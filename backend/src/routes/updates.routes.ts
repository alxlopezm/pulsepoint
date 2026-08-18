import { Router } from 'express'
import { z } from 'zod'
import { runAsUser } from '../db/withUserContext.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { emitToUser } from '../socket.js'

const router = Router()
router.use(requireAuth)

const updateInputSchema = z.object({
  content: z.string().min(1),
})

router.get(
  '/initiatives/:initiativeId/updates',
  asyncHandler(async (req, res) => {
    const updates = await runAsUser(req.userId, (tx) =>
      tx.update.findMany({
        where: { initiative_id: req.params.initiativeId },
        orderBy: { created_at: 'desc' },
      }),
    )
    res.json(updates)
  }),
)

router.post(
  '/initiatives/:initiativeId/updates',
  asyncHandler(async (req, res) => {
    const { content } = updateInputSchema.parse(req.body)
    const userId = req.userId
    const initiativeId = req.params.initiativeId

    const update = await runAsUser(userId, (tx) =>
      tx.update.create({
        data: { content, initiative_id: initiativeId, created_by: userId },
      }),
    ).catch(() => null)

    if (!update) {
      res.status(404).json({ error: 'Initiative not found' })
      return
    }

    emitToUser(userId, 'updates:changed', { initiativeId })
    emitToUser(userId, 'summary:changed', {})
    res.status(201).json(update)
  }),
)

export default router
