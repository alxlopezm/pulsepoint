import { Router } from 'express'
import { z } from 'zod'
import { InitiativeStatus, InitiativeType, Priority } from '@prisma/client'
import { runAsUser } from '../db/withUserContext.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { emitToUser } from '../socket.js'

const router = Router()
router.use(requireAuth)

const initiativeInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  owner: z.string().nullable().optional(),
  business_unit_id: z.string().uuid(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(InitiativeStatus).optional(),
  type: z.nativeEnum(InitiativeType),
})

const initiativeUpdateSchema = initiativeInputSchema.partial()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const initiatives = await runAsUser(req.userId, (tx) =>
      tx.initiative.findMany({ orderBy: { created_at: 'desc' } }),
    )
    res.json(initiatives)
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const initiative = await runAsUser(req.userId, (tx) =>
      tx.initiative.findUnique({ where: { id: req.params.id } }),
    )
    if (!initiative) {
      res.status(404).json({ error: 'Initiative not found' })
      return
    }
    res.json(initiative)
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = initiativeInputSchema.parse(req.body)
    const userId = req.userId

    const initiative = await runAsUser(userId, (tx) =>
      tx.initiative.create({ data: { ...data, created_by: userId } }),
    )

    emitToUser(userId, 'initiatives:changed', {})
    emitToUser(userId, 'summary:changed', {})
    res.status(201).json(initiative)
  }),
)

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = initiativeUpdateSchema.parse(req.body)
    const userId = req.userId

    const initiative = await runAsUser(userId, (tx) =>
      tx.initiative.update({ where: { id: req.params.id }, data }),
    ).catch(() => null)

    if (!initiative) {
      res.status(404).json({ error: 'Initiative not found' })
      return
    }

    emitToUser(userId, 'initiatives:changed', {})
    emitToUser(userId, 'initiative:changed', { id: initiative.id })
    emitToUser(userId, 'summary:changed', {})
    res.json(initiative)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = req.userId

    const deleted = await runAsUser(userId, (tx) =>
      tx.initiative.delete({ where: { id: req.params.id } }),
    ).catch(() => null)

    if (!deleted) {
      res.status(404).json({ error: 'Initiative not found' })
      return
    }

    emitToUser(userId, 'initiatives:changed', {})
    emitToUser(userId, 'summary:changed', {})
    res.status(204).end()
  }),
)

export default router
