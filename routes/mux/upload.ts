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

    return { id: asset.id, playbackId: asset.playback_ids?.[0].id }
  } catch (e) {
    console.error('Error creating Mux asset', e)
    return createError({ statusCode: 500, statusMessage: 'Error creating Mux asset' })
  }}
})

function createError({ statusCode, statusMessage }) {
  console.log(`Sending error response: ${statusCode}`)
  return { error: statusMessage, statusCode: statusCode }
}
