import zod from 'zod'
import { get } from '../../utils/functions/get'

export default defineEventHandler(async (event) => {
  console.log("getName")
  const schema = zod.object({
    name: zod.string().regex(/^[a-z0-9-.]+$/),
  })

  const safeParse = schema.safeParse(event)

  if (!safeParse.success) {
    const response = { error: !safeParse.success }
    return Response.json(response, { status: 400 })
  }

  const { name } = safeParse.data
  const nameData = await get(name)

  if (nameData === null) {
    return new Response('Name not found', { status: 404 })
  }

  return Response.json(nameData, {
    status: 200,
  })
})
