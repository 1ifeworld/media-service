// in middleware folder. not working causing CORS issues

import { checkPrivy } from '../utils/checkPrivy'

export default eventHandler(async (event) => {

    // if (getRequestURL(event).pathname.startsWith('/')) {
    //     if (event.node.req.method === 'OPTIONS') {
    //         return null
    //       }
    // assertMethod(event, 'POST')



  const requestObject = event.node.req

  let authTokenHeader = requestObject.headers['authorization']
  if (Array.isArray(authTokenHeader)) {
    authTokenHeader = authTokenHeader[0]
  }
  const authToken = authTokenHeader?.split(' ')[1]
  if (!authToken) {
    throw new Error('No authentication token provided')
  }

  const tokenData = await checkPrivy(authToken)
  if (!tokenData || tokenData.appId !== process.env.PRIVY_APP_ID) {
    throw new Error('Invalid authentication token')
  }

  return tokenData
}

)
