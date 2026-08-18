import type { NextFunction, Request, Response } from 'express'
import { AUTH_COOKIE_NAME, verifyToken } from '../utils/jwt.js'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    req.userId = verifyToken(token).userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}
