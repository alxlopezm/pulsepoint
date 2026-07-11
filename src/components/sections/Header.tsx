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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="text-primary" size={24} />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-bold text-transparent">
            PulsePoint
          </span>
        </Link>

        <nav className="flex items-center gap-4">
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => signOut()}
            aria-label="Sign out"
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-secondary transition-colors hover:bg-secondary-lighter dark:text-secondary-lighter dark:hover:bg-secondary/60"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
