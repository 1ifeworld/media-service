import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'
import { parse } from '@ucanto/principal/ed25519'
import { StoreMemory } from '@web3-storage/access'
import { create, type Client } from '@web3-storage/w3up-client'
import { formidable } from 'formidable'
import { filesFromPaths } from 'files-from-path'
import { checkPrivy } from '../utils/authDb'

let client: Client
(async () => {
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

export default defineEventHandler(async (event) => {
  const requestObject = event.node.req

  const storage = useStorage('redis')

  // console.log("REQUESTOBJECT", requestObject)
  // console.log("Headers:", requestObject.headers)

  // Extract and validate the authToken
  let authToken = requestObject.headers['authorization']
  // console.log("AUTHTOKEN PRE", authToken)

  if (Array.isArray(authToken)) {
    authToken = authToken[0] // Take the first token if there are multiple
  }

  authToken = authToken?.split(' ')[1]
  if (!authToken) {
    return { error: 'No authentication token provided' }
  }

  console.log("AUTHTOKEN POST", authToken)

  let tokenData = await storage.getItem(authToken)
  console.log("tokenData pre", tokenData)

  // this logic could be better. we should check if its expired, if so revalidate etc.
  
  if (!tokenData) {
    const authorized = await checkPrivy(authToken)
    if (!authorized || authorized.appId !== process.env.PRIVY_APP_ID) {
      return { error: 'Invalid or unauthorized authentication token' }
    }
    // Store the verified token in Redis
    await storage.setItem(authToken, { userId: authorized.privyUserId, expiry: authorized.expiration })
    tokenData = authorized
    console.log("tokenData postwritter", tokenData)

  }

  const body = await watchData(requestObject)
  // @ts-ignore
  const filePath = body.file[0].filepath
  const files = await filesFromPaths([filePath])
  const cid = await client.uploadFile(files[0])

  console.log(`https://${cid?.toString()}.ipfs.w3s.link`)
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
