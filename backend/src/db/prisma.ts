import { PrismaClient } from '@prisma/client'

const appDatabaseUrl = process.env.APP_DATABASE_URL
if (!appDatabaseUrl) {
  throw new Error('Missing APP_DATABASE_URL environment variable')
}

// Runtime traffic connects through the restricted `pulsepoint_app` role (see
// prisma/migrations/20260806000001_row_level_security) rather than the
// migration/owner role in DATABASE_URL, so Postgres actually enforces RLS.
export const prisma = new PrismaClient({
  datasources: {
    db: { url: appDatabaseUrl },
  },
})
