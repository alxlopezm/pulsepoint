import jwt from 'jsonwebtoken'
import type { CookieOptions } from 'express'

function loadJwtSecret(): string {
  const value = process.env.JWT_SECRET
  if (!value) {
    throw new Error('Missing JWT_SECRET environment variable')
  }
  return value
}

const JWT_SECRET = loadJwtSecret()

export interface AuthPayload {
  userId: string
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies AuthPayload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as AuthPayload
}

export const AUTH_COOKIE_NAME = 'pulsepoint_token'

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: SEVEN_DAYS_MS,
}
