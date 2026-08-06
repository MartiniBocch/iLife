import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Briefcase, Clock, Plus } from 'lucide-react'
import WorkLog from '@/entities/WorkLog'

function WorkPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await WorkLog.list('date:desc')
        setLogs(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const totalHours = useMemo(
    () => logs.reduce((sum, item) => sum + Number(item.hours || 0), 0),
    [logs],
  )

  const handleLog = async () => {
    if (!hours) return

    const today = format(new Date(), 'yyyy-MM-dd')

    try {
      const log = await WorkLog.create({
        date: today,
        hours: Number(hours),
        notes,
      })

      setLogs((current) => [log, ...current])
      setHours('')
      setNotes('')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerIcon}>
          <Briefcase size={24} />
        </div>
        <div>
          <h2 style={styles.title}>Work Hub</h2>
          <p style={styles.subtitle}>Track your hours, output, and daily notes.</p>
        </div>
      </header>

      <div style={styles.grid}>
        <article style={{ ...styles.card, ...styles.primaryCard }}>
          <span style={styles.primaryLabel}>Total Hours Logged</span>
          <strong style={styles.primaryValue}>{totalHours} hrs</strong>
        </article>

        <section style={{ ...styles.card, ...styles.formCard }}>
          <h3 style={styles.cardTitle}>Log Today&apos;s Work</h3>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label htmlFor="hours" style={styles.label}>
                Hours
              </label>
              <input
                id="hours"
                type="number"
                min="0"
                step="0.5"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                placeholder="8"
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label htmlFor="notes" style={styles.label}>
                Notes / tasks accomplished
              </label>
              <input
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Client meeting, coding, planning..."
                style={styles.input}
              />
            </div>

            <button type="button" onClick={handleLog} style={styles.primaryButton}>
              <Plus size={16} />
              <span>Log Hours</span>
            </button>
          </div>
        </section>
      </div>

      <section style={styles.card}>
        <div style={styles.sectionHeading}>
          <Clock size={18} color="hsl(var(--primary))" />
          <h3 style={styles.cardTitle}>Recent Shifts</h3>
        </div>

        {loading ? (
          <p style={styles.infoText}>Loading work logs...</p>
        ) : logs.length === 0 ? (
          <p style={styles.infoText}>No work logged yet.</p>
        ) : (
          <div style={styles.list}>
            {logs.map((log) => (
              <article key={log.id} style={styles.logRow}>
                <div>
                  <h4 style={styles.logDate}>{log.date}</h4>
                  {log.notes ? <p style={styles.logNotes}>{log.notes}</p> : null}
                </div>

                <div style={styles.hoursBadge}>{log.hours} hours</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

const styles = {
  page: {
    display: 'grid',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerIcon: {
    width: '3rem',
    height: '3rem',
    borderRadius: '1rem',
    display: 'grid',
    placeItems: 'center',
    background: 'hsl(var(--primary) / 0.15)',
    color: 'hsl(var(--primary))',
  },
  title: {
    margin: 0,
    fontSize: '1.9rem',
  },
  subtitle: {
    margin: '0.35rem 0 0',
    color: 'hsl(var(--muted-foreground))',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1.25rem',
    padding: '1.25rem',
  },
  primaryCard: {
    background: 'hsl(var(--primary))',
    color: 'white',
    border: 'none',
    display: 'grid',
    gap: '0.65rem',
    alignContent: 'start',
  },
  primaryLabel: {
    fontSize: '0.82rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  primaryValue: {
    fontSize: '2.4rem',
    lineHeight: 1.08,
  },
  formCard: {
    display: 'grid',
    gap: '1rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
  },
  formGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'end',
  },
  field: {
    display: 'grid',
    gap: '0.45rem',
    minWidth: '180px',
  },
  label: {
    fontSize: '0.92rem',
    fontWeight: 600,
  },
  input: {
    height: '2.85rem',
    borderRadius: '0.9rem',
    border: '1px solid hsl(var(--border))',
    padding: '0 0.9rem',
    font: 'inherit',
    background: '#fff',
  },
  primaryButton: {
    height: '2.85rem',
    border: 'none',
    borderRadius: '999px',
    padding: '0 1rem',
    background: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontWeight: 600,
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  list: {
    display: 'grid',
    gap: '0.8rem',
  },
  logRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '1rem',
    border: '1px solid hsl(var(--border))',
    background: 'rgba(255,255,255,0.72)',
  },
  logDate: {
    margin: 0,
    fontSize: '1rem',
  },
  logNotes: {
    margin: '0.35rem 0 0',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.92rem',
  },
  hoursBadge: {
    whiteSpace: 'nowrap',
    padding: '0.65rem 0.9rem',
    borderRadius: '0.85rem',
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid hsl(var(--border))',
    fontWeight: 700,
    color: 'hsl(var(--primary))',
  },
  infoText: {
    color: 'hsl(var(--muted-foreground))',
  },
}

export default WorkPage