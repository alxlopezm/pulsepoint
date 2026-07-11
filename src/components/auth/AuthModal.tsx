import { useState, type FormEvent } from 'react'
import { Modal } from '../modals/Modal'
import { useAuth } from '../../hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type Mode = 'sign-in' | 'sign-up'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const resetAndClose = () => {
    setEmail('')
    setPassword('')
    setError(null)
    setConfirmationSent(false)
    setMode('sign-in')
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'sign-in') {
      const { error: signInError } = await signIn(email, password)
      setLoading(false)
      if (signInError) {
        setError(signInError)
        return
      }
      resetAndClose()
    } else {
      const { error: signUpError, needsConfirmation } = await signUp(email, password)
      setLoading(false)
      if (signUpError) {
        setError(signUpError)
        return
      }
      if (needsConfirmation) {
        setConfirmationSent(true)
      } else {
        resetAndClose()
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={mode === 'sign-in' ? 'Sign in' : 'Create an account'}
    >
      {confirmationSent ? (
        <div className="space-y-4">
          <p className="text-sm text-secondary dark:text-secondary-lighter">
            Check your email to confirm your account before signing in.
          </p>
          <button
            type="button"
            onClick={resetAndClose}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-secondary dark:text-secondary-lighter"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-secondary-light/40 bg-transparent px-3 py-2 text-sm text-secondary outline-none transition-colors focus:border-primary dark:text-secondary-lighter"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-secondary dark:text-secondary-lighter"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-secondary-light/40 bg-transparent px-3 py-2 text-sm text-secondary outline-none transition-colors focus:border-primary dark:text-secondary-lighter"
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-secondary-light">
            {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
                setError(null)
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      )}
    </Modal>
  )
}
