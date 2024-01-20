import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'
import { parse } from '@ucanto/principal/ed25519'
import { StoreMemory } from '@web3-storage/access'
import { create, type Client } from '@web3-storage/w3up-client'
import { formidable } from 'formidable'
import { filesFromPaths } from 'files-from-path'

let client: Client
;(async () => {
  const principal = parse(process.env.KEY)
  client = await create({ principal, store: new StoreMemory() })
  const proof = await parseProof(process.env.PROOF)
  const space = await client.addSpace(proof)
  await client.setCurrentSpace(space.did())
})()

/** @param {string} data Base64 encoded CAR file */
async function parseProof(data) {
  const blocks = []
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'))
  for await (const block of reader.blocks()) {
    blocks.push(block)
  }
  return importDAG(blocks)
}

// export default defineEventHandler(async (event) => {
//   if (event.node.req.method === 'OPTIONS') {
//     return null
//   }
//   assertMethod(event, 'POST')
//   const requestObject = event.node.req

//   // Extract and validate the authToken
//   let authToken = requestObject.headers['authorization']

//   console.log('AUTH', authToken)

//   if (Array.isArray(authToken)) {
//     authToken = authToken[0]
//   }

//   console.log('AUTH[0]', authToken)

//   authToken = authToken?.split(' ')[1]
//   console.log('AUTH SPLIT', authToken)
//   if (!authToken) {
//     return { error: 'No authentication token provided' }
//   }

//   const verifiedClaims = await checkPrivy(authToken)

//   console.log('VER CLAIMS', verifiedClaims)

//   console.log('APP ID', verifiedClaims.appId)
//   if (!verifiedClaims || verifiedClaims.appId !== process.env.PRIVY_APP_ID) {
//     console.error('Invalid authentication token')
//     return { error: 'Invalid authentication token' }
//   }

//   const body = await watchData(requestObject)
//   // @ts-ignore
//   const filePath = body.file[0].filepath
//   const files = await filesFromPaths([filePath])
//   const cid = await client.uploadFile(files[0])

//   return { cid: cid?.toString() }
// })

export default defineEventHandler(async (event) => {
  console.log("W3S")

//   if (event.node.req.method === 'OPTIONS') {
//     return null
//   }
// assertMethod(event, 'POST')

console.log("W3S INNIT")



  // const tokenData = event.context.authTokenData
  // if (!tokenData) {
  //   console.error('No token data available from middleware')
  //   return { error: 'Authentication failed' }
  // }

  // console.log('Authenticated App ID:', tokenData.appId)

  const body = await watchData(event.node.req)
  // @ts-ignore
  const filePath = body.file[0].filepath
  const files = await filesFromPaths([filePath])
  const cid = await client.uploadFile(files[0])

  console.log (" CID " , cid)

  return { cid: cid?.toString() }
})

function watchData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true })
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ ...fields, ...files })
    })
  })
}
