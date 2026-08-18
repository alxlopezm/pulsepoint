import { io, type Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Missing VITE_API_URL. Check your .env.local file.')
}

// Connected only while authenticated - useAuth calls connect()/disconnect()
// around sign-in/sign-up/sign-out.
export const socket: Socket = io(API_URL, {
  withCredentials: true,
  autoConnect: false,
})
