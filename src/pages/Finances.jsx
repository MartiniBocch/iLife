import { useEffect, useMemo, useState } from 'react'
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react'
import Finance from '@/entities/Finance'

function FinancesPage() {
  const [finances, setFinances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const data = await Finance.list('date:desc')
        setFinances(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinances()
  }, [])

  const { incomeTotal, expenseTotal, balance } = useMemo(() => {
    const income = finances
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const expenses = finances
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return {
      incomeTotal: income,
      expenseTotal: expenses,
      balance: income - expenses,
    }
  }, [finances])

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <section style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerIcon}>
          <Wallet size={24} />
        </div>
        <div>
          <h2 style={styles.title}>Finances</h2>
          <p style={styles.subtitle}>
            Keep track of your income, expenses, and current balance.
          </p>
        </div>
      </header>

      <div style={styles.metricsGrid}>
        <article style={{ ...styles.metricCard, ...styles.metricPrimary }}>
          <span style={styles.metricLabel}>Current Balance</span>
          <strong style={styles.metricValue}>£{formatCurrency(balance)}</strong>
        </article>

        <article style={styles.metricCard}>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Total Income</span>
            <TrendingUp size={18} color="#15803d" />
          </div>
          <strong style={{ ...styles.metricValueSm, color: '#15803d' }}>
            +£{formatCurrency(incomeTotal)}
          </strong>
        </article>

        <article style={styles.metricCard}>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Total Expenses</span>
            <TrendingDown size={18} color="#dc2626" />
          </div>
          <strong style={{ ...styles.metricValueSm, color: '#dc2626' }}>
            -£{formatCurrency(expenseTotal)}
          </strong>
        </article>
      </div>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.cardTitle}>All Transactions</h3>
            <p style={styles.cardText}>
              Your recorded entries appear here in one running list.
            </p>
          </div>
        </div>

        {loading ? (
          <p style={styles.infoText}>Loading finances...</p>
        ) : finances.length === 0 ? (
          <p style={styles.infoText}>No transactions logged yet.</p>
        ) : (
          <div style={styles.list}>
            {finances.map((item) => (
              <article key={item.id} style={styles.transactionRow}>
                <div>
                  <h4 style={styles.transactionTitle}>
                    {item.category || 'Transaction'}
                  </h4>
                  <p style={styles.transactionMeta}>
                    {item.date || 'No date'}
                    {item.description ? ` • ${item.description}` : ''}
                  </p>
                </div>

                <strong
                  style={{
                    ...styles.transactionAmount,
                    color: item.type === 'income' ? '#15803d' : 'hsl(var(--foreground))',
                  }}
                >
                  {item.type === 'income' ? '+' : '-'}£{formatCurrency(item.amount)}
                </strong>
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
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  metricCard: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1.25rem',
    padding: '1.25rem',
    display: 'grid',
    gap: '0.8rem',
  },
  metricPrimary: {
    background: 'hsl(var(--primary))',
    color: 'white',
    border: 'none',
  },
  metricLabel: {
    fontSize: '0.82rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  metricValue: {
    fontSize: '2.25rem',
    lineHeight: 1.1,
  },
  metricValueSm: {
    fontSize: '1.8rem',
    lineHeight: 1.1,
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },
  card: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1.25rem',
    padding: '1.25rem',
    display: 'grid',
    gap: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.15rem',
  },
  cardText: {
    margin: '0.3rem 0 0',
    color: 'hsl(var(--muted-foreground))',
  },
  list: {
    display: 'grid',
    gap: '0.9rem',
  },
  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.72)',
  },
  transactionTitle: {
    margin: 0,
    fontSize: '1rem',
    textTransform: 'capitalize',
  },
  transactionMeta: {
    margin: '0.35rem 0 0',
    fontSize: '0.92rem',
    color: 'hsl(var(--muted-foreground))',
  },
  transactionAmount: {
    fontSize: '1.05rem',
    whiteSpace: 'nowrap',
  },
  infoText: {
    color: 'hsl(var(--muted-foreground))',
  },
}

export default FinancesPage