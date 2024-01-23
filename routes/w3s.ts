import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'
import { parse } from '@ucanto/principal/ed25519'
import { StoreMemory } from '@web3-storage/access'
import { create, type Client } from '@web3-storage/w3up-client'
import { formidable } from 'formidable'
import { filesFromPaths } from 'files-from-path'
import { AnyLink } from '@web3-storage/w3up-client/dist/src/types'

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
  const body = await watchData(event.node.req)

  let cid: AnyLink | undefined

  // @ts-expect-error
  if (body.file) {
    // @ts-expect-error
    const filePath = body.file[0].filepath
    const files = await filesFromPaths([filePath])
    cid = await client.uploadFile(files[0])
  } else {
    cid = await client.uploadFile(
      new Blob([JSON.stringify(body)], { type: 'application/json' }),
    )
  }

  if (!cid) {
    return { error: 'Upload to w3s failed' }
  }

  console.log(`https://${cid}.ipfs.w3s.link`)

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
      // Ensure that each field value is not an array
      const nonArrayFields = {}
      for (const key in fields) {
        nonArrayFields[key] = Array.isArray(fields[key])
          ? fields[key][0]
          : fields[key]
      }
      resolve({ ...nonArrayFields, ...files })
    })
  })
}
