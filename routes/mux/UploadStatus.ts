import Mux from '@mux/mux-node'


const { Video } = new Mux()

export default defineEventHandler(async (event) => {
  const assetId = await readBody(event)
  try {
    const status = await Video.Assets.get(assetId.assetId)

    return { status: status.status, error: status.errors }
  } catch (e) {
    console.error('Error fetching Mux asset', e)
    return { error: 'Error fetching Mux asset' }
  }
})
