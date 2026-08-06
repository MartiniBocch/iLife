import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  HeartPulse,
  Wallet,
} from 'lucide-react'
import Task from '@/entities/Task'
import HealthLog from '@/entities/HealthLog'
import Finance from '@/entities/Finance'

function HomePage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [healthLogs, setHealthLogs] = useState([])
  const [finances, setFinances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd')

        const [taskData, healthData, financeData] = await Promise.all([
          Task.list(),
          HealthLog.filter({ date: today }),
          Finance.list(),
        ])

        setTasks(taskData || [])
        setHealthLogs(healthData || [])
        setFinances(financeData || [])
      } catch (error) {
        console.error('Failed to load dashboard data', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const dashboard = useMemo(() => {
    const todayTasks = tasks.filter((task) => task.dueDate === todayStr)
    const completedToday = todayTasks.filter((task) => task.completed).length

    const currentHealth = healthLogs.length > 0 ? healthLogs[0] : null

    const incomeTotal = finances
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const expenseTotal = finances
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return {
      todayTasks,
      completedToday,
      currentHealth,
      balance: incomeTotal - expenseTotal,
    }
  }, [finances, healthLogs, tasks, todayStr])

  const cards = [
    {
      title: "Today's Tasks",
      value: `${dashboard.completedToday}/${dashboard.todayTasks.length}`,
      subtitle: 'completed',
      icon: CheckCircle2,
      path: '/tasks',
    },
    {
      title: 'Cycle Phase',
      value:
        dashboard.currentHealth?.cyclePhase &&
        dashboard.currentHealth?.cyclePhase !== 'none'
          ? dashboard.currentHealth.cyclePhase
          : 'Log today',
      subtitle: 'physical wellbeing',
      icon: HeartPulse,
      path: '/cycle',
    },
    {
      title: 'Current Balance',
      value: `£${Number(dashboard.balance || 0).toLocaleString()}`,
      subtitle: 'income minus expenses',
      icon: Wallet,
      path: '/finances',
    },
    {
      title: 'Upcoming Plans',
      value: 'View',
      subtitle: 'calendar overview',
      icon: CalendarIcon,
      path: '/calendar',
    },
  ]

  return (
    <section style={styles.page}>
      <header style={styles.header}>
        <p style={styles.dateLabel}>{format(new Date(), 'EEEE, MMMM do')}</p>
        <h2 style={styles.title}>Good morning, beautiful.</h2>
        <p style={styles.subtitle}>
          Here&apos;s your at-a-glance view of tasks, finances, and wellbeing.
        </p>
      </header>

      {loading ? (
        <p style={styles.infoText}>Loading your dashboard...</p>
      ) : (
        <div style={styles.grid}>
          {cards.map(({ title, value, subtitle, icon: Icon, path }) => (
            <button
              key={title}
              type="button"
              onClick={() => navigate(path)}
              style={styles.metricCard}
            >
              <div style={styles.metricHeader}>
                <div style={styles.metricIcon}>
                  <Icon size={20} />
                </div>
                <span style={styles.metricTitle}>{title}</span>
              </div>

              <strong style={styles.metricValue}>{value}</strong>
              <span style={styles.metricSubtitle}>{subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

const styles = {
  page: {
    display: 'grid',
    gap: '1.5rem',
  },
  header: {
    display: 'grid',
    gap: '0.45rem',
  },
  dateLabel: {
    margin: 0,
    fontSize: '0.85rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'hsl(var(--muted-foreground))',
  },
  title: {
    margin: 0,
    fontSize: '2.2rem',
    lineHeight: 1.08,
  },
  subtitle: {
    margin: 0,
    color: 'hsl(var(--muted-foreground))',
    maxWidth: '38rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  metricCard: {
    border: '1px solid hsl(var(--border))',
    borderRadius: '1.25rem',
    background: 'hsl(var(--card))',
    padding: '1.25rem',
    textAlign: 'left',
    display: 'grid',
    gap: '0.85rem',
    cursor: 'pointer',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  metricIcon: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '0.9rem',
    display: 'grid',
    placeItems: 'center',
    background: 'hsl(var(--primary) / 0.15)',
    color: 'hsl(var(--primary))',
  },
  metricTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  metricValue: {
    fontSize: '1.9rem',
    lineHeight: 1.1,
    color: 'hsl(var(--foreground))',
  },
  metricSubtitle: {
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.92rem',
  },
  infoText: {
    color: 'hsl(var(--muted-foreground))',
  },
}

export default HomePage