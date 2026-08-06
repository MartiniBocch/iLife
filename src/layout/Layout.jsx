import { NavLink, Outlet } from 'react-router-dom'
import {
  Briefcase,
  CalendarDays,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  Wallet,
  CheckSquare,
  Flower2,
} from 'lucide-react'

const navigation = [
  { name: 'Home', path: '/', icon: HomeIcon },
  { name: 'Calendar', path: '/calendar', icon: CalendarDays },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Work', path: '/work', icon: Briefcase },
  { name: 'Finances', path: '/finances', icon: Wallet },
  { name: 'Education', path: '/education', icon: GraduationCap },
  { name: 'Personal', path: '/personal', icon: Heart },
  { name: 'Cycle', path: '/cycle', icon: Flower2 },
]

function Layout() {
  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div style={styles.brandBlock}>
          <h1 style={styles.brandTitle}>iLife</h1>
          <p style={styles.brandText}>Manage your life beautifully.</p>
        </div>

        <nav style={styles.nav}>
          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <Icon size={18} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  appShell: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    minHeight: '100vh',
    background: '#f8fafc', // Light slate canvas for page content
    color: '#0f172a',
  },
  sidebar: {
    background: '#0f172a', // Dark slate background for sidebar
    color: '#f8fafc',
    borderRight: '1px solid #1e293b',
    padding: '2rem 1.25rem',
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
  },
  brandBlock: {
    marginBottom: '2rem',
    paddingLeft: '0.5rem',
  },
  brandTitle: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#ffffff',
  },
  brandText: {
    margin: '0.35rem 0 0',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: '#94a3b8', // Subtle slate-gray for inactive items
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    fontSize: '0.938rem',
    fontWeight: 500,
    transition: 'all 0.15s ease-in-out',
  },
  navLinkActive: {
    background: '#1e293b', // Slightly lighter dark tone to highlight active pill
    color: '#38bdf8', // Vibrant sky-blue text & icon for active page
    fontWeight: 600,
  },
  main: {
    padding: '2rem',
    overflowY: 'auto',
  },
}

export default Layout