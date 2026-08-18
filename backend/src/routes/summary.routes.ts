import { Router } from 'express'
import { runAsUser } from '../db/withUserContext.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { syncOverdueNextSteps } from '../utils/nextStepStatus.js'

const router = Router()

router.get(
  '/summary',
  requireAuth,
  asyncHandler(async (req, res) => {
    const summaries = await runAsUser(req.userId, async (tx) => {
      await syncOverdueNextSteps(tx)

      const initiatives = await tx.initiative.findMany({ orderBy: { created_at: 'desc' } })
      const initiativeIds = initiatives.map((initiative) => initiative.id)

      if (initiativeIds.length === 0) return []

      const [updates, nextSteps] = await Promise.all([
        tx.update.findMany({
          where: { initiative_id: { in: initiativeIds } },
          orderBy: { created_at: 'desc' },
        }),
        tx.nextStep.findMany({ where: { initiative_id: { in: initiativeIds } } }),
      ])

      return initiatives.map((initiative) => ({
        initiative,
        recentUpdates: updates.filter((u) => u.initiative_id === initiative.id).slice(0, 2),
        pendingNextSteps: nextSteps.filter(
          (ns) => ns.initiative_id === initiative.id && ns.status !== 'completed',
        ),
      }))
    })

    res.json(summaries)
  }),
)

export default router
