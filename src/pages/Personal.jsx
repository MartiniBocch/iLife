import { useEffect, useState } from 'react'
import { Brain, Users, Wind } from 'lucide-react'
import DiaryLog from '@/entities/DiaryLog'
import BreathingLog from '@/entities/BreathingLog'
import Relationship from '@/entities/Relationship'

function PersonalPage() {
  const [loading, setLoading] = useState(true)
  const [relationships, setRelationships] = useState([])
  const [diaryEntry, setDiaryEntry] = useState('')
  const [morningCheckIn, setMorningCheckIn] = useState('')
  const [middayCheckIn, setMiddayCheckIn] = useState('')
  const [eveningCheckIn, setEveningCheckIn] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const relationshipData = await Relationship.list('nextPlan:asc')
        setRelationships(relationshipData || [])

        const today = new Date().toISOString().slice(0, 10)
        const diaryList = await DiaryLog.filter({ date: today })
        const breathingList = await BreathingLog.filter({ date: today })

        if (diaryList?.length) {
          setDiaryEntry(diaryList[0].notes || '')
        }

        if (breathingList?.length) {
          const morning = breathingList.find((item) => item.timeSlot === 'morning')
          const midday = breathingList.find((item) => item.timeSlot === 'midday')
          const evening = breathingList.find((item) => item.timeSlot === 'evening')

          setMorningCheckIn(morning?.notes || '')
          setMiddayCheckIn(midday?.notes || '')
          setEveningCheckIn(evening?.notes || '')
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSaveLogs = async () => {
    const today = new Date().toISOString().slice(0, 10)

    try {
      const diaryList = await DiaryLog.filter({ date: today })
      if (diaryList?.length) {
        await DiaryLog.update(diaryList[0].id, { notes: diaryEntry })
      } else if (diaryEntry.trim()) {
        await DiaryLog.create({ date: today, notes: diaryEntry })
      }

      await saveBreathingLog('morning', morningCheckIn, today)
      await saveBreathingLog('midday', middayCheckIn, today)
      await saveBreathingLog('evening', eveningCheckIn, today)

      window.alert("Today's personal logs were saved.")
    } catch (error) {
      console.error(error)
      window.alert('Something went wrong while saving your logs.')
    }
  }

  const saveBreathingLog = async (timeSlot, notes, date) => {
    const existingLogs = await BreathingLog.filter({ date })
    const existing = existingLogs?.find((item) => item.timeSlot === timeSlot)

    if (!notes.trim()) return

    if (existing) {
      await BreathingLog.update(existing.id, { notes })
    } else {
      await BreathingLog.create({ date, timeSlot, notes })
    }
  }

  return (
    <section style={styles.page}>
      <header style={styles.header}>
        <h2 style={styles.title}>Personal Hub</h2>
        <p style={styles.subtitle}>Nourish your mind, spirit, and relationships.</p>
      </header>

      {loading ? (
        <p style={styles.infoText}>Loading your personal hub...</p>
      ) : (
        <div style={styles.grid}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <Brain size={20} />
              <div>
                <h3 style={styles.cardTitle}>Daily Diary</h3>
                <p style={styles.cardText}>Express your emotions and thoughts freely.</p>
              </div>
            </div>

            <textarea
              value={diaryEntry}
              onChange={(event) => setDiaryEntry(event.target.value)}
              placeholder="Write how you're feeling today..."
              style={styles.textareaLarge}
            />
          </section>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <Wind size={20} />
              <div>
                <h3 style={styles.cardTitle}>3-Stop Breathing</h3>
                <p style={styles.cardText}>Pause. Breathe. Notice how you feel.</p>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>08:00 — Morning Check-in</label>
              <textarea
                value={morningCheckIn}
                onChange={(event) => setMorningCheckIn(event.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>15:00 — Midday Check-in</label>
              <textarea
                value={middayCheckIn}
                onChange={(event) => setMiddayCheckIn(event.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>22:00 — Evening Check-in</label>
              <textarea
                value={eveningCheckIn}
                onChange={(event) => setEveningCheckIn(event.target.value)}
                style={styles.textarea}
              />
            </div>

            <button type="button" onClick={handleSaveLogs} style={styles.primaryButton}>
              Save Today&apos;s Logs
            </button>
          </section>

          <section style={{ ...styles.card, gridColumn: '1 / -1' }}>
            <div style={styles.cardHeader}>
              <Users size={20} />
              <div>
                <h3 style={styles.cardTitle}>Relationships</h3>
                <p style={styles.cardText}>Keep gentle track of the people who matter most.</p>
              </div>
            </div>

            {relationships.length === 0 ? (
              <p style={styles.infoText}>No relationships added yet.</p>
            ) : (
              <div style={styles.relationshipGrid}>
                {relationships.map((relationship) => (
                  <article key={relationship.id} style={styles.relationshipCard}>
                    <div style={styles.relationshipAvatar}>
                      {relationship.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 style={styles.relationshipName}>{relationship.name}</h4>
                      <p style={styles.relationshipMeta}>{relationship.type || 'Connection'}</p>
                      <p style={styles.relationshipMeta}>
                        Next Plan: {relationship.nextPlan || 'Not set'}
                      </p>
                      {relationship.notes && (
                        <p style={styles.relationshipNotes}>{relationship.notes}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
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
    gap: '0.35rem',
  },
  title: {
    margin: 0,
    fontSize: '1.9rem',
  },
  subtitle: {
    margin: 0,
    color: 'hsl(var(--muted-foreground))',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1.25rem',
    padding: '1.25rem',
    display: 'grid',
    gap: '1rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.1rem',
  },
  cardText: {
    margin: '0.25rem 0 0',
    color: 'hsl(var(--muted-foreground))',
  },
  fieldGroup: {
    display: 'grid',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  textareaLarge: {
    minHeight: '260px',
    width: '100%',
    borderRadius: '1rem',
    border: '1px solid hsl(var(--border))',
    padding: '1rem',
    font: 'inherit',
    resize: 'vertical',
  },
  textarea: {
    minHeight: '90px',
    width: '100%',
    borderRadius: '1rem',
    border: '1px solid hsl(var(--border))',
    padding: '0.85rem 1rem',
    font: 'inherit',
    resize: 'vertical',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 1.2rem',
    background: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    fontWeight: 600,
  },
  relationshipGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
  },
  relationshipCard: {
    border: '1px solid hsl(var(--border))',
    borderRadius: '1rem',
    padding: '1rem',
    display: 'flex',
    gap: '0.9rem',
    alignItems: 'flex-start',
    background: 'rgba(255,255,255,0.75)',
  },
  relationshipAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '999px',
    display: 'grid',
    placeItems: 'center',
    background: 'hsl(var(--primary) / 0.15)',
    color: 'hsl(var(--primary))',
    fontWeight: 700,
    flexShrink: 0,
  },
  relationshipName: {
    margin: 0,
  },
  relationshipMeta: {
    margin: '0.2rem 0 0',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.92rem',
  },
  relationshipNotes: {
    margin: '0.6rem 0 0',
    fontSize: '0.95rem',
  },
  infoText: {
    color: 'hsl(var(--muted-foreground))',
  },
}

export default PersonalPage