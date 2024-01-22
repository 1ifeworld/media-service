import { createKysely } from '../../utils/client/createKysely'
import { parseNameFromDb } from '../../utils/utils'


export default defineEventHandler(async (event) => {
  const body = event.node.req



  const db = createKysely()
  const names = await db.selectFrom('names').selectAll().execute()
  const parsedNames = parseNameFromDb(names)

  // Simplify the response format
  const formattedNames = parsedNames.reduce((acc, name) => {
    return {
      ...acc,
      [name.name]: {
				owner: name.owner,
				id: name.id,
        addresses: name.addresses,
        texts: name.texts,
        contenthash: name.contenthash,
      },
    }
  }, {})

  return Response.json(formattedNames, {
    status: 200,
  })
})
