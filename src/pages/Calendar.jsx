"use client";

import React, { useState, useEffect } from "react";
import Task from "@/entities/Task";
import Project from "@/entities/Project";
import { CalendarDays, CheckCircle2, Circle, LayoutList, Calendar as CalendarIcon } from "lucide-react";
import useAppLevelAuth from "@/hooks/useAppLevelAuth";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("week");
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchData = async () => {
      try {
        const [t, p] = await Promise.all([
          Task.list("dueDate:asc"),
          Project.list("deadline:asc")
        ]);
        setTasks(t || []);
        setProjects(p || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  // Group everything by date
  const timeline = {};

  tasks.forEach(task => {
    if (task.dueDate) {
      if (!timeline[task.dueDate]) timeline[task.dueDate] = [];
      timeline[task.dueDate].push({ type: 'task', data: task });
    }
  });

  projects.forEach(proj => {
    if (proj.deadline) {
      if (!timeline[proj.deadline]) timeline[proj.deadline] = [];
      timeline[proj.deadline].push({ type: 'project', data: proj });
    }
  });

  const sortedDates = Object.keys(timeline).sort();

  // Week view logic
  const daysInWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Life Calendar
          </h1>
          <p className="text-muted-foreground text-lg">Your unified schedule across all hubs.</p>
        </div>
        
        <div className="flex bg-white/50 backdrop-blur-md rounded-xl p-1 shadow-sm border">
          <Button 
            variant={viewMode === "week" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("week")}
            className={viewMode === "week" ? "rounded-lg" : ""}
          >
            <CalendarIcon className="w-4 h-4 mr-2" /> Weekly Grid
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "rounded-lg" : ""}
          >
            <LayoutList className="w-4 h-4 mr-2" /> Upcoming List
          </Button>
        </div>
      </div>

      {viewMode === "week" ? (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white">
            <Button variant="outline" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>Prev Week</Button>
            <h2 className="text-xl font-bold">{format(currentWeekStart, 'MMMM yyyy')}</h2>
            <Button variant="outline" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>Next Week</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {daysInWeek.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayItems = timeline[dateStr] || [];
              const isToday = isSameDay(day, new Date());
              
              return (
                <div key={idx} className={`min-h-[200px] bg-white/70 backdrop-blur-md rounded-2xl p-4 border shadow-sm transition-all ${isToday ? 'border-primary ring-2 ring-primary/20' : 'border-white hover:shadow-md'}`}>
                  <div className="flex flex-col items-center mb-4 pb-2 border-b">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{format(day, 'EEE')}</span>
                    <span className={`text-2xl font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>{format(day, 'd')}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {dayItems.map((item, i) => (
                      <div key={i} className={`p-2 rounded-lg text-xs font-medium border ${
                          item.type === 'task' 
                            ? (item.data.category === 'personal' ? 'bg-pink-50 border-pink-100 text-pink-700' :
                              item.data.category === 'work' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                              'bg-yellow-50 border-yellow-100 text-yellow-700')
                            : 'bg-primary/10 border-primary/20 text-primary'
                        }`}>
                        <div className="flex items-start gap-1.5">
                          {item.type === 'task' && (item.data.completed ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 mt-0.5 shrink-0" />)}
                          <span className="line-clamp-2">{item.data.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayItems.length === 0 && (
                      <div className="text-center text-xs text-muted-foreground pt-4">No plans</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-12 mt-8">
          {sortedDates.map((date, idx) => (
            <div key={idx} className="relative pl-8 md:pl-0">
              <div className="md:grid md:grid-cols-5 md:gap-8 items-start">
                
                {/* Date Column */}
                <div className="md:col-span-1 mb-4 md:mb-0 sticky top-24">
                  <div className="font-bold text-2xl text-foreground">
                    {format(new Date(date + 'T00:00:00'), 'd')}
                  </div>
                  <div className="text-sm font-medium text-primary uppercase tracking-wider">
                    {format(new Date(date + 'T00:00:00'), 'MMM yyyy')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(date + 'T00:00:00'), 'EEEE')}
                  </div>
                </div>

                {/* Items Column */}
                <div className="md:col-span-4 space-y-3">
                  {timeline[date].map((item, i) => (
                    <div key={i} className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                      
                      {item.type === 'task' ? (
                        <div className="mt-1">
                          {item.data.completed ? <CheckCircle2 className="text-green-500 w-5 h-5"/> : <Circle className="text-muted-foreground w-5 h-5"/>}
                        </div>
                      ) : (
                        <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                          P
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="font-semibold text-lg">{item.data.title}</div>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${
                            item.data.category === 'personal' ? 'bg-pink-100 text-pink-700' :
                            item.data.category === 'work' ? 'bg-blue-100 text-blue-700' :
                            item.data.category === 'education' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-primary text-white' // Projects
                          }`}>
                            {item.type === 'task' ? item.data.category : 'Project / Exam'}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
                
              </div>
              <div className="absolute left-0 top-2 bottom-[-3rem] w-px bg-border md:hidden" />
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