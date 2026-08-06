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
    gridTemplateColumns: '280px 1fr',
    minHeight: '100vh',
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
  },
  sidebar: {
    borderRight: '1px solid hsl(var(--border))',
    padding: '2rem 1.25rem',
    background: 'hsl(var(--card))',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  brandBlock: {
    marginBottom: '2rem',
  },
  brandTitle: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
  },
  brandText: {
    margin: '0.5rem 0 0',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.95rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'hsl(var(--foreground))',
    padding: '0.9rem 1rem',
    borderRadius: '1rem',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    background: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
  },
  main: {
    padding: '2rem',
  },
}

export default Layout