import Mux from '@mux/mux-node'
import { useCORS } from 'nitro-cors'

const { Video } = new Mux()

type HTTPMethod =
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'

export default defineEventHandler(async (event) => {
  console.log('PRE UPLOAD')

  // Define CORS options
  const corsOptions = {
    methods: ['POST', 'OPTIONS'] as HTTPMethod[],
    allowHeaders: [
      'Authorization',
      'Content-Type',
      'Access-Control-Allow-Origin',
    ],
    preflight: { statusCode: 204 },
  }

  // Apply CORS to the request
  useCORS(event, corsOptions)

  // Handle preflight (OPTIONS) request
  if (event.node.req.method === 'OPTIONS') {
    // End the response for OPTIONS request
    return { statusCode: 204 }
  }

  // Ensure this is a POST request
  if (event.node.req.method !== 'POST') {
    return { error: 'Method not allowed', statusCode: 405 }
  }

  // Now handle POST request
  const tokenData = event.context.authTokenData

  if (!tokenData) {
    console.error('No token data available from middleware')
    return { error: 'Authentication failed' }
  }

  console.log('TOKEN DATA MUX', tokenData)

  const cid = await readBody(event)
  const assetEndpointForMux = `https://${cid}.ipfs.w3s.link`
  console.log('MUX ASSET', assetEndpointForMux)

  try {
    const asset = await Video.Assets.create({
      input: assetEndpointForMux,
      playback_policy: 'public',
      encoding_tier: 'baseline',
    })
    return { id: asset.id, playbackId: asset.playback_ids?.[0].id }
  } catch (e) {
    console.error('Error creating Mux asset', e)
    return { error: 'Error creating Mux asset' }
  }
})

// const directUpload = await Video.Uploads.create({
//   cors_origin: '*',
//   new_asset_settings: {
//     input: body,
//     playback_policy: 'public',
//     encoding_tier: 'baseline',
//   },
// })
