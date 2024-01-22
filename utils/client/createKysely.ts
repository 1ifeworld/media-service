import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import { NameInKysely } from '../models'
import pkg  from 'pg'

const { Pool } = pkg

export interface Database {
  names: NameInKysely
}

export function createKysely(): Kysely<Database> {
  const pool = new Pool({
    connectionString: process.env.NAMES_DATABASE_URL,
  })



  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: pool,
    }),
    plugins: [new CamelCasePlugin()],
  })
}
