import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, ListTodo, Calendar, Clock } from 'lucide-react';
import Task from '@/entities/Task';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await Task.list('dueDate:asc');
        setTasks(data || []);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const todayStr = format(new Date(), 'dd-MM-yyyy');

  // Split tasks into Today vs. Upcoming / Other
  const { todayTasks, upcomingTasks } = useMemo(() => {
    return {
      todayTasks: tasks.filter((task) => task.dueDate === todayStr),
      upcomingTasks: tasks.filter((task) => task.dueDate !== todayStr),
    };
  }, [tasks, todayStr]);

  // Toggle completion in local state + persist back to server/entity
  const toggleTask = async (task) => {
    const nextStatus = !task.completed;

    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, completed: nextStatus } : item
      )
    );

    try {
      await Task.update(task.id, { completed: nextStatus });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Reusable card styling matching the Calendar Timeline look
  const TaskCard = ({ task }) => (
    <div
      onClick={() => toggleTask(task)}
      className={`group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-3 ${task.completed ? 'opacity-70' : ''
        }`}
    >
      <button
        type="button"
        className="mt-0.5 text-muted-foreground group-hover:scale-110 transition-transform"
        onClick={(e) => {
          e.stopPropagation();
          toggleTask(task);
        }}
      >
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-50" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={`font-semibold text-base transition-colors ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
        >
          {task.title}
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {task.category && (
            <span
              className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize ${task.category === 'personal'
                  ? 'bg-pink-100 text-pink-700'
                  : task.category === 'work'
                    ? 'bg-blue-100 text-blue-700'
                    : task.category === 'education'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-primary/10 text-primary'
                }`}
            >
              {task.category}
            </span>
          )}

          {task.dueDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 bg-slate-100/80 px-2 py-1 rounded-md">
              <Clock className="h-3 w-3" />
              {task.dueDate === todayStr
                ? 'Today'
                : format(new Date(task.dueDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
          <ListTodo className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your daily to-dos and upcoming activities.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading tasks...
        </div>
      ) : (
        /* Two Columns Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Today's Tasks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Today</h2>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                {todayTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <div className="p-8 text-center bg-white/40 rounded-2xl border border-dashed border-border/80">
                  <p className="text-sm text-muted-foreground">
                    No tasks scheduled for today.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Upcoming Tasks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Upcoming & Other</h2>
              <span className="ml-auto text-xs bg-slate-100 text-muted-foreground px-2.5 py-0.5 rounded-full font-medium">
                {upcomingTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <div className="p-8 text-center bg-white/40 rounded-2xl border border-dashed border-border/80">
                  <p className="text-sm text-muted-foreground">
                    No upcoming tasks remaining.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}