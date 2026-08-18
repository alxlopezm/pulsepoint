import { Router } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { AUTH_COOKIE_NAME, authCookieOptions, signToken } from '../utils/jwt.js'

const router = Router()

const BCRYPT_ROUNDS = 10

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' })
      return
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const user = await prisma.user.create({
      data: { email, password_hash },
      select: { id: true, email: true },
    })

    res.cookie(AUTH_COOKIE_NAME, signToken(user.id), authCookieOptions)
    res.status(201).json(user)
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = credentialsSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    res.cookie(AUTH_COOKIE_NAME, signToken(user.id), authCookieOptions)
    res.json({ id: user.id, email: user.email })
  }),
)

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions)
  res.status(204).end()
})

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    })
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    res.json(user)
  }),
)

export default router
