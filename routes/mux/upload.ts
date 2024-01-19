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

  const requestObject = event.node.req

  let authTokenHeader = requestObject.headers['authorization']
  if (Array.isArray(authTokenHeader)) {
    authTokenHeader = authTokenHeader[0]
  }

  const authToken = authTokenHeader?.split(' ')[1] // Extract token from "Bearer [token]"
  if (!authToken) {
    return { error: 'No authentication token provided' }
  }

  const storage = useStorage('redis')
  const { cid } = await readBody(event)

  let inStorage = await storage.hasItem(authToken)
  let tokenData

  // this logic could be better. we should check if its expired, if so revalidate etc.
  if (!inStorage) {
    const authorized = await checkPrivy(authToken);
    if (!authorized || authorized.appId !== process.env.PRIVY_APP_ID || Date.now() > authorized.expiration) {
      // Re-validate the token
      const revalidatedToken = await checkPrivy(authToken);
      if (!revalidatedToken) {
        return { error: 'Token revalidation failed' };
      }
      tokenData = revalidatedToken;
    }
    await storage.setItem(authToken, {
      userId: authorized.privyUserId,
      expiry: authorized.expiration,
      appId: authorized.appId,
      issuedAt: authorized.issuedAt,
    })
    tokenData = authorized
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
