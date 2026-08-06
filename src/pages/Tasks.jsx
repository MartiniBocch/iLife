import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Circle, ListTodo } from 'lucide-react'
import Task from '../entities/Task'

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await Task.list('dueDate:asc')
        setTasks(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const { todayTasks, otherTasks } = useMemo(() => {
    return {
      todayTasks: tasks.filter((task) => task.dueDate === todayStr),
      otherTasks: tasks.filter((task) => task.dueDate !== todayStr),
    }
  }, [tasks, todayStr])

  const toggleTask = async (task) => {
    const updatedTask = { ...task, completed: !task.completed }

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === task.id ? updatedTask : item,
      ),
    )

    try {
      await Task.update(task.id, { completed: !task.completed })
    } catch (error) {
      console.error(error)
    }
  }

  const TaskItem = ({ task }) => (
    <button
      type="button"
      onClick={() => toggleTask(task)}
      style={{
        ...styles.taskItem,
        ...(task.completed ? styles.taskDone : {}),
      }}
    >
      {task.completed ? (
        <CheckCircle2 size={20} color="hsl(var(--primary))" />
      ) : (
        <Circle size={20} color="hsl(var(--muted-foreground))" />
      )}

      <div style={styles.taskContent}>
        <span
          style={{
            ...styles.taskTitle,
            ...(task.completed ? styles.taskTitleDone : {}),
          }}
        >
          {task.title}
        </span>
        {task.dueDate && (
          <span style={styles.taskMeta}>Due: {task.dueDate}</span>
        )}
      </div>
    </button>
  )

  return (
    <section style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerIcon}>
          <ListTodo size={24} />
        </div>
        <div>
          <h2 style={styles.title}>Tasks</h2>
          <p style={styles.subtitle}>
            Manage all your personal, work, and educational tasks for the day.
          </p>
        </div>
      </header>

      {loading ? (
        <p style={styles.infoText}>Loading tasks...</p>
      ) : (
        <div style={styles.grid}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Today</h3>
            {todayTasks.length === 0 ? (
              <p style={styles.infoText}>No tasks due today. You&apos;re all caught up!</p>
            ) : (
              <div style={styles.list}>
                {todayTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Upcoming</h3>
            {otherTasks.length === 0 ? (
              <p style={styles.infoText}>No upcoming tasks yet.</p>
            ) : (
              <div style={styles.list}>
                {otherTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
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
    gap: '1.25rem',
  },
  card: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1.25rem',
    padding: '1.25rem',
  },
  cardTitle: {
    margin: '0 0 1rem',
    fontSize: '1.1rem',
  },
  list: {
    display: 'grid',
    gap: '0.75rem',
  },
  taskItem: {
    width: '100%',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1rem',
    background: '#fff',
    padding: '0.9rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    textAlign: 'left',
  },
  taskDone: {
    opacity: 0.8,
  },
  taskContent: {
    display: 'grid',
    gap: '0.15rem',
  },
  taskTitle: {
    fontWeight: 600,
  },
  taskTitleDone: {
    textDecoration: 'line-through',
    color: 'hsl(var(--muted-foreground))',
  },
  taskMeta: {
    fontSize: '0.9rem',
    color: 'hsl(var(--muted-foreground))',
  },
  infoText: {
    color: 'hsl(var(--muted-foreground))',
  },
}

export default TasksPage