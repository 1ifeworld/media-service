import { checkPrivy } from '../utils/checkPrivy'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Handle OPTIONS requests for /w3s separately
  if (path.startsWith('/w3s') && event.node.req.method === 'OPTIONS') {
    return null
  }
  // Assert POST method and perform authentication for POST requests to /w3s and all other routes
  if (event.node.req.method === 'POST') {
    assertMethod(event, 'POST')

    const requestObject = event.node.req
    let authTokenHeader = requestObject.headers['authorization']
    let secretHeader = requestObject.headers['secret']

    if (Array.isArray(authTokenHeader)) {
      authTokenHeader = authTokenHeader[0]
    }
    if (Array.isArray(secretHeader)) {
      secretHeader = secretHeader[0]
    }

    // Removes 'Bearer'
    const authToken = authTokenHeader?.split(' ')[1]
    const secretToken = secretHeader?.split(' ')[1]

    if (!authToken && !secretToken ) {
      throw new Error('No authentication token or secret provided')
    }

    const hasSecret = process.env.SECRET_AUTH === secretToken
    const tokenData = await checkPrivy(authToken)


    if (
      (!tokenData || tokenData.appId !== process.env.PRIVY_APP_ID)
      && !hasSecret
    ) {
      throw new Error('Invalid authentication token and secret')
    }
  }
})
