import { Router } from 'express'
import { runAsUser } from '../db/withUserContext.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const businessUnits = await runAsUser(req.userId, (tx) =>
      tx.businessUnit.findMany({ orderBy: { name: 'asc' } }),
    )
    res.json(businessUnits)
  }),
)

export default router
