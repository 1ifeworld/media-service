import { AuthTokenClaims } from '@privy-io/server-auth'
import { privyClient } from './client/privyClient'

export async function checkPrivy(authToken: string) {
  try {
    const verifiedClaims: AuthTokenClaims =
      await privyClient.verifyAuthToken(authToken)
    return {
      appId: verifiedClaims.appId,
      issuer: verifiedClaims.issuer,
      issuedAt: verifiedClaims.issuedAt,
      expiration: verifiedClaims.expiration,
      sessionId: verifiedClaims.sessionId,
      privyUserId: verifiedClaims.userId,
    }
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`)
  }
}
