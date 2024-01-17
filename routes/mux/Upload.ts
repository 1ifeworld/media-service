import Mux from '@mux/mux-node'

const { Video } = new Mux()

export default defineEventHandler(async (event) => {
  const cid = await readBody(event)

  const assetEndpointForMux = `https://${cid}.ipfs.w3s.link`

  try{
  const asset = await Video.Assets.create({
    input: assetEndpointForMux,
    playback_policy: 'public',
    encoding_tier: 'baseline',
  })

  return { id: asset.id, playbackId: asset.playback_ids?.[0].id }
} catch(e) {
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