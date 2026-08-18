import type { Server as HttpServer } from 'node:http'
import { Server, type Socket } from 'socket.io'
import { AUTH_COOKIE_NAME, verifyToken } from './utils/jwt.js'

let io: Server | undefined

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex === -1) continue
    const key = part.slice(0, separatorIndex).trim()
    const value = part.slice(separatorIndex + 1).trim()
    result[key] = decodeURIComponent(value)
  }
  return result
}

export function initSocket(httpServer: HttpServer, corsOrigin: string): Server {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  })

  io.use((socket, next) => {
    const rawCookies = socket.handshake.headers.cookie
    const token = rawCookies ? parseCookies(rawCookies)[AUTH_COOKIE_NAME] : undefined
    if (!token) {
      next(new Error('Not authenticated'))
      return
    }
    try {
      socket.data.userId = verifyToken(token).userId
      next()
    } catch {
      next(new Error('Invalid or expired session'))
    }
  })

  io.on('connection', (socket: Socket) => {
    socket.join(`user:${socket.data.userId}`)
  })

  return io
}

// Mirrors the Supabase Realtime channels the original hooks subscribed to,
// scoped per-user since RLS made everything per-user ownership anyway.
export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload)
}
