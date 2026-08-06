"use client";

import React, { useState, useEffect } from "react";
import Task from "@/entities/Task";
import Project from "@/entities/Project";
import { CalendarDays, CheckCircle2, Circle, LayoutList, Calendar as CalendarIcon } from "lucide-react";
import useAppLevelAuth from "@/hooks/useAppLevelAuth";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const auth = useAppLevelAuth ? useAppLevelAuth() : {};
  const isLoggedIn = auth?.isLoggedIn ?? true; // Default to true locally

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("week");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, p] = await Promise.all([
          Task.list("dueDate:asc").catch(() => []),
          Project.list("deadline:asc").catch(() => [])
        ]);
        setTasks(t || []);
        setProjects(p || []);
      } catch (e) {
        console.error("Error fetching calendar data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  // Handler to toggle task completion from calendar
  const handleToggleTask = async (taskToToggle, e) => {
    e.stopPropagation(); // Prevents event bubbling

    const nextStatus = !taskToToggle.completed;

    // 1. Optimistically update local React state
    setTasks((currentTasks) =>
      currentTasks.map((t) =>
        t.id === taskToToggle.id ? { ...t, completed: nextStatus } : t
      )
    );

    // 2. Persist to backend entity service
    try {
      await Task.update(taskToToggle.id, { completed: nextStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // Group everything by date
  const timeline = {};

  tasks.forEach(task => {
    if (task.dueDate) {
      if (!timeline[task.dueDate]) timeline[task.dueDate] = [];
      timeline[task.dueDate].push({ type: 'task', data: task });
    }
  });

  projects.forEach(project => {
    if (project.deadline) {
      if (!timeline[project.deadline]) timeline[project.deadline] = [];
      timeline[project.deadline].push({ type: 'project', data: project });
    }
  });

  const sortedDates = Object.keys(timeline).sort();

  // Helper for week view grid
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  const getItemColor = (item) => {
    if (item.type === 'task') {
      switch (item.data.category) {
        case 'personal': return 'bg-pink-100 border-pink-300 text-pink-800';
        case 'work': return 'bg-blue-100 border-blue-300 text-blue-800';
        case 'education': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        default: return 'bg-purple-100 border-purple-300 text-purple-800';
      }
    } else {
      return 'bg-primary/10 border-primary text-primary font-semibold';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule & Calendar</h1>
          <p className="text-muted-foreground mt-1">Overview of your upcoming tasks and deadlines.</p>
        </div>

        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="rounded-xl flex gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Week Grid
          </Button>
          <Button
            variant={viewMode === "timeline" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className="rounded-xl flex gap-2"
          >
            <LayoutList className="h-4 w-4" />
            Timeline View
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading calendar schedule...</div>
      ) : viewMode === "week" ? (
        /* WEEK GRID VIEW */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
              &larr; Prev Week
            </Button>
            <span className="font-semibold text-sm">
              {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
              Next Week &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayItems = timeline[dateStr] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dateStr}
                  className={`min-h-[140px] p-3 rounded-2xl border flex flex-col justify-start transition-all ${isToday ? "bg-primary/5 border-primary shadow-sm" : "bg-white/50 border-white/60"
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      {format(day, "EEE")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isToday ? "bg-primary text-white" : "text-foreground"
                      }`}>
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[180px]">
                    {dayItems.map((item, idx) => {
                      const isTask = item.type === "task";
                      const isCompleted = isTask && item.data.completed;

                      return (
                        <div
                          key={idx}
                          onClick={(e) => isTask && handleToggleTask(item.data, e)}
                          className={`text-xs p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all ${getItemColor(item)} ${isCompleted ? "opacity-60 line-through" : ""
                            }`}
                        >
                          {isTask && (
                            isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )
                          )}
                          <span className="truncate flex-1">
                            {item.data.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="space-y-6">
          {sortedDates.map(dateKey => (
            <div key={dateKey} className="relative pl-6 md:pl-0">
              <div className="md:grid md:grid-cols-4 md:gap-6 items-start">
                <div className="mb-2 md:mb-0 md:text-right font-medium">
                  <div className="text-lg font-bold">
                    {format(new Date(dateKey + 'T00:00:00'), 'EEEE')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(dateKey + 'T00:00:00'), 'MMM d, yyyy')}
                  </div>
                </div>

                <div className="md:col-span-3 space-y-3">
                  {timeline[dateKey].map((item, idx) => {
                    const isTask = item.type === "task";
                    const isCompleted = isTask && item.data.completed;

                    return (
                      <div
                        key={idx}
                        onClick={(e) => isTask && handleToggleTask(item.data, e)}
                        className={`p-4 rounded-2xl border bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-between transition-all cursor-pointer hover:border-primary/50 ${isCompleted ? "bg-gray-50/50 opacity-70" : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {isTask ? (
                            isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground shrink-0 hover:text-primary" />
                            )
                          ) : (
                            <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                          )}
                          <div>
                            <div className={`font-semibold text-base ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {item.data.title}
                            </div>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${item.data.category === 'personal' ? 'bg-pink-100 text-pink-700' :
                                  item.data.category === 'work' ? 'bg-blue-100 text-blue-700' :
                                    item.data.category === 'education' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-primary/20 text-primary'
                                }`}>
                                {isTask ? item.data.category : 'Project / Exam'}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {sortedDates.length === 0 && (
            <div className="text-center p-12 bg-white/50 rounded-3xl border border-white">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Your calendar is clear</h3>
              <p className="text-muted-foreground">Add tasks or projects to see them here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}