
import { privyClient } from "../client/privyClient";


export async function checkPrivy(authToken: string) {
try {

    const verifiedClaims = await privyClient.verifyAuthToken(authToken)

    console.log("VERIFIEDCLAIMS", verifiedClaims)

    return {issuer: verifiedClaims.issuer, expiration: verifiedClaims.expiration, privyUserId: verifiedClaims.userId, appId: verifiedClaims.appId }
} catch (error) {
    console.log(`Token verification failed with error ${error}.`)
}
}

