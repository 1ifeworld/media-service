import Mux from '@mux/mux-node'
import { checkPrivy } from '../../utils/authDb'


const { Video } = new Mux()

export default defineEventHandler(async (event) => {
  const storage = useStorage('redis')
  const { cid, authToken } = await readBody(event)

  let tokenData = await storage.getItem(authToken)

  if (!tokenData) {
    const verifiedClaims = await checkPrivy(authToken)
    if (!verifiedClaims || verifiedClaims.appId !== process.env.PRIVY_APP_ID) {
      console.error('Invalid authentication token')
      return { error: 'Invalid authentication token' }
    }

    await storage.setItem(authToken, { userId: verifiedClaims.privyUserId, expiry: verifiedClaims.expiration })
    tokenData = verifiedClaims
  }

  const assetEndpointForMux = `https://${cid}.ipfs.w3s.link`

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
