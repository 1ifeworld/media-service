// in middleware folder. not working causing CORS issues

import { checkPrivy } from '../utils/checkPrivy'

export default eventHandler(async (event) => {
  console.log('PREPING')

  const path = getRequestURL(event).pathname

  // Handle OPTIONS requests for /w3s separately
  if (path.startsWith('/w3s') && event.node.req.method === 'OPTIONS') {
    console.log('PREFLIGHT for /w3s')
    return null
  }

  // Assert POST method and perform authentication for POST requests to /w3s and all other routes
  if (event.node.req.method === 'POST') {
    assertMethod(event, 'POST')
    console.log('POST AUTH')

    const requestObject = event.node.req
    let authTokenHeader = requestObject.headers['authorization']
    console.log('AUTH', authTokenHeader)

    if (Array.isArray(authTokenHeader)) {
      authTokenHeader = authTokenHeader[0]
    }
    const authToken = authTokenHeader?.split(' ')[1]
    console.log('AUTHTOKEN', authToken)

    if (!authToken) {
      throw new Error('No authentication token provided')
    }

    const tokenData = await checkPrivy(authToken)
    if (!tokenData || tokenData.appId !== process.env.PRIVY_APP_ID) {
      throw new Error('Invalid authentication token')
    }
    console.log('TOKEN', tokenData)

    event.context.authTokenData = tokenData
  }
})
