import zod from 'zod'
import { getIdByOwner } from '../../utils/functions/id'


export default defineEventHandler(async (event) => {
  const schema = zod.object({
    owner: zod.string(),
  })
  const safeParse = schema.safeParse(event)

  if (!safeParse.success) {
    const response = { error: !safeParse.success}
    return new Response(JSON.stringify(response), { status: 400 })
  }

  const { owner } = safeParse.data

  try {
    const id = await getIdByOwner(owner)
    if (id === null) {
      return new Response('Id not found', { status: 404 })
    }

    return new Response(JSON.stringify({ id }), { status: 200 })
  } catch (error) {
    console.error('Error fetching id by owner:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
