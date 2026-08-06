import { useCopilotAction, useCopilotContext } from "@copilotkit/react-core";
import { Task } from "@/entities/Task";
import { Finance } from "@/entities/Finance";
import { WorkLog } from "@/entities/WorkLog";
import { HealthLog } from "@/entities/HealthLog";
import { Project } from "@/entities/Project";
import { Relationship } from "@/entities/Relationship";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function useChatActions() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setChatInstructions } = useCopilotContext();

  useEffect(() => {
    setChatInstructions(`
      You are "iLife Assistant", a helpful, empathetic, and smart personal assistant.
      You can add and edit tasks, finances, work hours, health/diary logs, projects, and relationships.
      Be concise, friendly, and use an encouraging tone.
      Today's date is ${format(new Date(), 'yyyy-MM-dd')}.
      When the user asks to "edit" something, try to figure out what entity they mean and use the appropriate update action if you have an ID, otherwise ask for clarification or use the generic add action if it's new.
    `);
    setIsInitialized(true);
  }, [setChatInstructions]);

  // Tasks
  useCopilotAction({
    name: "addTask",
    description: "Add a new task to the user's life planner.",
    parameters: [
      { name: "title", type: "string", description: "Task title/description" },
      { name: "category", type: "string", enum: ["personal", "work", "education"], description: "Category of the task" },
      { name: "dueDate", type: "string", description: "Due date in YYYY-MM-DD format", optional: true }
    ],
    handler: async ({ title, category, dueDate }) => {
      try {
        const task = await Task.create({ title, category, dueDate, completed: false });
        return `Created task: ${task.title}`;
      } catch (e) {
        return "Failed to create task.";
      }
    }
  });

  // Finances
  useCopilotAction({
    name: "logFinance",
    description: "Log an income or expense transaction.",
    parameters: [
      { name: "amount", type: "number", description: "Amount of money" },
      { name: "type", type: "string", enum: ["income", "expense"], description: "Is it income or expense?" },
      { name: "category", type: "string", description: "Category e.g., groceries, salary, shopping" },
      { name: "date", type: "string", description: "Date in YYYY-MM-DD format", optional: true }
    ],
    handler: async ({ amount, type, category, date }) => {
      try {
        const txnDate = date || format(new Date(), 'yyyy-MM-dd');
        await Finance.create({ amount, type, category, date: txnDate, description: "Logged via Assistant" });
        return `Logged ${type} of $${amount} for ${category}.`;
      } catch (e) {
        return "Failed to log finance.";
      }
    }
  });

  // Work Logs
  useCopilotAction({
    name: "logWorkHours",
    description: "Log hours worked on a specific date.",
    parameters: [
      { name: "hours", type: "number", description: "Number of hours worked" },
      { name: "notes", type: "string", description: "Notes about the work", optional: true },
      { name: "date", type: "string", description: "Date in YYYY-MM-DD format", optional: true }
    ],
    handler: async ({ hours, notes, date }) => {
      try {
        const workDate = date || format(new Date(), 'yyyy-MM-dd');
        await WorkLog.create({ hours, notes: notes || "", date: workDate });
        return `Logged ${hours} hours of work for ${workDate}.`;
      } catch (e) {
        return "Failed to log work hours.";
      }
    }
  });

  // Health & Diary
  useCopilotAction({
    name: "logHealthOrDiary",
    description: "Log physical health, cycle, or diary/breathing notes for today.",
    parameters: [
      { name: "diary", type: "string", description: "Psychological diary entry", optional: true },
      { name: "physicalSymptoms", type: "string", description: "Headaches, sickness, etc.", optional: true },
      { name: "morningCheckIn", type: "string", description: "08:00 breathing notes", optional: true },
      { name: "middayCheckIn", type: "string", description: "15:00 breathing notes", optional: true },
      { name: "eveningCheckIn", type: "string", description: "22:00 breathing notes", optional: true }
    ],
    handler: async (args) => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const existing = await HealthLog.filter({ date: today });
        if (existing && existing.length > 0) {
          await HealthLog.update(existing[0].id, args);
          return "Updated today's health/diary log.";
        } else {
          await HealthLog.create({ date: today, ...args });
          return "Created today's health/diary log.";
        }
      } catch (e) {
        return "Failed to update health log.";
      }
    }
  });

  // Projects
  useCopilotAction({
    name: "updateProjectProgress",
    description: "Update the progress or notes of an educational project/exam.",
    parameters: [
      { name: "title", type: "string", description: "Title of the project/exam to update" },
      { name: "progress", type: "number", description: "Progress percentage 0-100", optional: true },
      { name: "trackingNotes", type: "string", description: "Notes about the progress", optional: true }
    ],
    handler: async ({ title, progress, trackingNotes }) => {
      try {
        const projects = await Project.list();
        const project = projects.find(p => p.title.toLowerCase().includes(title.toLowerCase()));
        if (!project) return `Could not find a project matching "${title}".`;
        
        const updates: any = {};
        if (progress !== undefined) updates.progress = progress;
        if (trackingNotes !== undefined) updates.trackingNotes = trackingNotes;
        
        await Project.update(project.id, updates);
        return `Updated project "${project.title}".`;
      } catch (e) {
        return "Failed to update project.";
      }
    }
  });

  return { isInitialized };
}