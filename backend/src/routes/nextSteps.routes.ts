import { Router } from 'express'
import { z } from 'zod'
import { NextStepStatus } from '@prisma/client'
import { runAsUser } from '../db/withUserContext.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { emitToUser } from '../socket.js'
import { computeNextStepStatus, syncOverdueNextSteps } from '../utils/nextStepStatus.js'

const router = Router()
router.use(requireAuth)

const dateField = z
  .string()
  .date()
  .nullable()
  .optional()
  .transform((value) => (value === undefined ? undefined : value === null ? null : new Date(value)))

const nextStepInputSchema = z.object({
  description: z.string().min(1),
  responsible_person: z.string().nullable().optional(),
  start_date: dateField,
  due_date: dateField,
  completion_date: dateField,
})

const nextStepUpdateSchema = nextStepInputSchema.partial().extend({
  status: z.nativeEnum(NextStepStatus).optional(),
})

router.get(
  '/initiatives/:initiativeId/next-steps',
  asyncHandler(async (req, res) => {
    const initiativeId = req.params.initiativeId
    const nextSteps = await runAsUser(req.userId, async (tx) => {
      await syncOverdueNextSteps(tx, initiativeId)
      return tx.nextStep.findMany({
        where: { initiative_id: initiativeId },
        orderBy: [{ due_date: { sort: 'asc', nulls: 'last' } }, { created_at: 'asc' }],
      })
    })
    res.json(nextSteps)
  }),
)

router.post(
  '/initiatives/:initiativeId/next-steps',
  asyncHandler(async (req, res) => {
    const data = nextStepInputSchema.parse(req.body)
    const userId = req.userId
    const initiativeId = req.params.initiativeId
    const status = computeNextStepStatus(data)

    const nextStep = await runAsUser(userId, (tx) =>
      tx.nextStep.create({
        data: { ...data, initiative_id: initiativeId, status },
      }),
    ).catch(() => null)

    if (!nextStep) {
      res.status(404).json({ error: 'Initiative not found' })
      return
    }

    emitToUser(userId, 'next-steps:changed', { initiativeId })
    emitToUser(userId, 'summary:changed', {})
    res.status(201).json(nextStep)
  }),
)

router.patch(
  '/next-steps/:id',
  asyncHandler(async (req, res) => {
    const data = nextStepUpdateSchema.parse(req.body)
    const { status: explicitStatus, ...rest } = data
    const userId = req.userId

    const nextStep = await runAsUser(userId, async (tx) => {
      const existing = await tx.nextStep.findUnique({ where: { id: req.params.id } })
      if (!existing) return null

      const status =
        explicitStatus ??
        computeNextStepStatus({
          completion_date: rest.completion_date !== undefined ? rest.completion_date : existing.completion_date,
          due_date: rest.due_date !== undefined ? rest.due_date : existing.due_date,
          status: existing.status,
        })

      return tx.nextStep.update({ where: { id: req.params.id }, data: { ...rest, status } })
    }).catch(() => null)

    if (!nextStep) {
      res.status(404).json({ error: 'Next step not found' })
      return
    }

    emitToUser(userId, 'next-steps:changed', { initiativeId: nextStep.initiative_id })
    emitToUser(userId, 'summary:changed', {})
    res.json(nextStep)
  }),
)

router.delete(
  '/next-steps/:id',
  asyncHandler(async (req, res) => {
    const userId = req.userId

    const deleted = await runAsUser(userId, (tx) =>
      tx.nextStep.delete({ where: { id: req.params.id } }),
    ).catch(() => null)

    if (!deleted) {
      res.status(404).json({ error: 'Next step not found' })
      return
    }

    emitToUser(userId, 'next-steps:changed', { initiativeId: deleted.initiative_id })
    emitToUser(userId, 'summary:changed', {})
    res.status(204).end()
  }),
)

export default router
