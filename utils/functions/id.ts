import { createKysely } from '../client/createKysely'



export async function getIdByOwner(owner: string): Promise<string | null> {
  console.log('Entering getIdByOwner function')
  try {
    const db = createKysely()
    console.log('Executing database query')
    const record = await db
      .selectFrom('names')
      .select('id')  // Just select the 'id' column
      .where('owner', '=', owner)
      .executeTakeFirst()

    if (!record) {
      console.log('No record found for owner:', owner)
      return null
    }
    console.log('ID retrieved from database:', record.id)
    return record.id // Return the ID directly
  } catch (error) {
    console.error('Error caught in getIdByOwner function:', error)
    throw error
  }
}
