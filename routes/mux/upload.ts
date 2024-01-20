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

  if (isPreflightRequest) {
    const corsOptions = {
      methods: ['POST', 'OPTIONS'] as HTTPMethod[],
      allowHeaders: [
        'Authorization',
        'Content-Type',
        'Access-Control-Allow-Origin',
      ],
      preflight: { statusCode: 204 },
    }
    useCORS(event, corsOptions)
  }

  console.log(' POST CORS MUXI')

  const tokenData = event.context.authTokenData
  console.log('TOKEN DATA MUX', tokenData)

  if (!tokenData) {
    console.error('No token data available from middleware')
    return { error: 'Authentication failed' }
  }

  // const tokenData = event.context.authTokenData
  // if (!tokenData) {
  //   console.error('No token data available from middleware')
  //   return { error: 'Authentication failed' }
  // }

  // console.log('Authenticated App ID:', tokenData.appId)

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
