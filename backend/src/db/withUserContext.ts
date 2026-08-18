import type { Prisma } from '@prisma/client'
import { prisma } from './prisma.js'

/**
 * Runs `fn` inside a transaction with the Postgres session variable
 * `app.current_user_id` set via `set_config(..., true)` (the SET LOCAL
 * equivalent), which the RLS policies check instead of Supabase's
 * `auth.uid()`. Scoping it to the transaction means it can never leak to
 * another request sharing a pooled connection.
 */
export function runAsUser<T>(
  userId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    return fn(tx)
  })
}
