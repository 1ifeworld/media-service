// in middleware folder. not working causing CORS issues

import { checkPrivy } from '../utils/checkPrivy'

export default eventHandler(async (event) => {
    console.log("PREPING")

    if (getRequestURL(event).pathname.startsWith('/w3s')) {
        console.log("PREFLIGHT")

        if (event.node.req.method === 'OPTIONS') {
            return null
          }
    assertMethod(event, 'POST')

  console.log("POST AUTH")
  const requestObject = event.node.req

  let authTokenHeader = requestObject.headers['authorization']
  console.log("AUTH", authTokenHeader)
  if (Array.isArray(authTokenHeader)) {
    authTokenHeader = authTokenHeader[0]
  }
  const authToken = authTokenHeader?.split(' ')[1]
  console.log("AUTHTOKEN", authToken)

  if (!authToken) {
    throw new Error('No authentication token provided')
  }

  const tokenData = await checkPrivy(authToken)
  if (!tokenData || tokenData.appId !== process.env.PRIVY_APP_ID) {
    throw new Error('Invalid authentication token')
  }
  console.log("TOKEN", tokenData)

  event.context.authTokenData = tokenData
}

})
