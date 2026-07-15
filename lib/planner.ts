import type { Block, Owner, Task } from "./types";

const DAY_END = 18 * 60;

function toTime(total: number) {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function roundToFive(value: number) {
  return Math.ceil(value / 5) * 5;
}

function dueBoost(due?: string) {
  if (!due) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${due}T00:00:00`);
  const days = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return 40;
  if (days <= 3) return 25;
  if (days <= 7) return 15;
  return 0;
}

export function rankTasks(tasks: Task[], owner: Owner | "All" = "All") {
  return tasks
    .filter((task) => task.status !== "done" && task.status !== "blocked")
    .filter((task) => owner === "All" || task.owner === owner || task.owner === "Shared")
    .map((task) => ({ ...task, score: task.priority + dueBoost(task.due) }))
    .sort((a, b) => b.score - a.score);
}

export function buildDayPlan(tasks: Task[], owner: Owner | "All" = "All", startDate = new Date()): Block[] {
  const ranked = rankTasks(tasks, owner);
  let cursor = roundToFive(Math.max(8 * 60 + 30, startDate.getHours() * 60 + startDate.getMinutes()));
  const blocks: Block[] = [];
  let focusBlocks = 0;

  for (const task of ranked) {
    if (cursor >= DAY_END || focusBlocks >= 7) break;

    if (cursor < 12 * 60 && cursor + task.minutes > 12 * 60) {
      blocks.push({ id: `lunch-${cursor}`, start: toTime(cursor), end: toTime(Math.max(cursor + 40, 12 * 60 + 40)), label: "Lunch away from the screen", type: "life" });
      cursor = Math.max(cursor + 40, 12 * 60 + 40);
    }

    const duration = Math.min(50, Math.max(15, task.minutes));
    const start = cursor;
    const end = Math.min(DAY_END, start + duration);
    blocks.push({ id: `task-${task.id}-${start}`, start: toTime(start), end: toTime(end), label: task.title, type: task.projectId === "health" || task.projectId === "home" ? "life" : "focus", taskId: task.id });
    cursor = end;
    focusBlocks += 1;

    if (cursor < DAY_END && task.projectId !== "health" && task.projectId !== "home") {
      blocks.push({ id: `break-${cursor}`, start: toTime(cursor), end: toTime(cursor + 10), label: "Stand up, water, and move", type: "break" });
      cursor += 10;
    }
  }

  return blocks;
}
