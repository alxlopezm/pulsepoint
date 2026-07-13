import { useState } from 'react'
import { Activity, BarChart3, ShieldCheck, Zap } from 'lucide-react'
import { AuthModal } from '../auth/AuthModal'

const features = [
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Follow every initiative from request to delivery with dated updates and next steps.',
  },
  {
    icon: ShieldCheck,
    title: 'Governance',
    description: 'Keep ownership, priority, and status visible for clean, auditable decision-making.',
  },
  {
    icon: Zap,
    title: 'Efficiency',
    description: 'Filter, search, and roll up initiatives across business units in seconds.',
  },
]

export function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <div className="min-h-full bg-secondary-lighter dark:bg-secondary">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Activity className="text-primary" size={26} />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
            PulsePoint
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsAuthOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary"
        >
          Sign In
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-secondary dark:text-secondary-lighter sm:text-5xl">
          Govern your technology initiatives with clarity
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary-light">
          PulsePoint gives your team one place to track status, ownership, and next steps across
          every business unit.
        </p>
        <button
          type="button"
          onClick={() => setIsAuthOpen(true)}
          className="mt-8 rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary"
        >
          Get started
        </button>

        <div className="mt-20 grid gap-8 text-left sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-secondary-light/20 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 dark:border-secondary-light/10 dark:bg-secondary-light/5"
            >
              <Icon className="text-primary" size={28} />
              <h2 className="mt-4 text-lg font-semibold text-secondary dark:text-secondary-lighter">
                {title}
              </h2>
              <p className="mt-2 text-sm text-secondary-light">{description}</p>
            </div>
          ))}
        </div>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}
