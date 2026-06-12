import { env } from './env'

export const databaseConfig = {
  url: env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
  },
}
