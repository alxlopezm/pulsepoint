import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/apiClient'
import { socket } from '../lib/socket'

interface AuthUser {
  id: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<AuthUser>('/api/auth/me')
      .then((currentUser) => {
        setUser(currentUser)
        socket.connect()
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const signedInUser = await api.post<AuthUser>('/api/auth/login', { email, password })
      setUser(signedInUser)
      socket.connect()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const newUser = await api.post<AuthUser>('/api/auth/signup', { email, password })
      setUser(newUser)
      socket.connect()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' }
    }
  }

  const signOut = async () => {
    await api.post('/api/auth/logout')
    socket.disconnect()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
