import Mux from '@mux/mux-node'
import { useCORS } from 'nitro-cors'

const { Video } = new Mux()

type HTTPMethod = 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'

export default defineEventHandler(async (event) => {

  const corsOptions = {
    methods: ['POST', 'OPTIONS'] as HTTPMethod[],
    allowHeaders: ['Authorization', 'Content-Type', 'Access-Control-Allow-Origin'],
    preflight: { statusCode: 204 },
  }

  useCORS(event, corsOptions)

  if (event.node.req.method === 'OPTIONS') {
  } else if (event.node.req.method !== 'POST') {
    return createError({ statusCode: 405, statusMessage: 'Method not allowed' }) }
    else {

  try {
    const cid = await readBody(event)
    const assetEndpointForMux = `https://${cid}.ipfs.w3s.link`

    const asset = await Video.Assets.create({
      input: assetEndpointForMux,
      playback_policy: 'public',
      encoding_tier: 'baseline',
    })

      let processing = true

      const checkAssetStatus = async (assetId) => {
        const assetDetails = await Video.Assets.get(assetId)
        if (assetDetails.status === 'ready' || assetDetails.status === 'errored') {
          processing = false
          return assetDetails.status
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds delay
          return checkAssetStatus(assetId)
        }
      }

      const finalStatus = await checkAssetStatus(asset.id)

      return { id: asset.id, playbackId: asset.playback_ids?.[0].id, processing, status: finalStatus }
  }  catch (e) {
    console.error('Error creating Mux asset:', e.message, 'Details:', e.details || 'None')
    return createError({
      statusCode: 500,
      statusMessage: 'Error creating Mux asset',
      details: e.details || 'An unexpected error occurred',
    })
  }

  function createError({ statusCode, statusMessage, details }) {
    console.log(`Sending error response: ${statusCode}, Details: ${details}`)
    return { error: statusMessage, details: details, statusCode: statusCode }
   }
  }
})
