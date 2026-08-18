import { Activity, LogOut } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { ThemeToggle } from '../icons/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/summary', label: 'Summary' },
]

export function Header() {
  const { signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-secondary-light/30 bg-secondary-lighter/90 backdrop-blur dark:border-secondary-light/10 dark:bg-secondary/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <Activity className="text-primary" size={24} />
          <span className="hidden bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-bold text-transparent sm:inline">
            PulsePoint
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-secondary hover:text-primary dark:text-secondary-lighter dark:hover:text-accent-light'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Sign out"
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-secondary transition-colors hover:bg-secondary-lighter dark:text-secondary-lighter dark:hover:bg-secondary/60"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
