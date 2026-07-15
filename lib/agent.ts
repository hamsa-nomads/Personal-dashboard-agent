import type { Block, Owner, Project, Task } from "./types";
import { rankTasks } from "./planner";

export type AgentAction =
  | { type: "start" }
  | { type: "pause" }
  | { type: "finish" }
  | { type: "block" }
  | { type: "replan" }
  | { type: "owner"; owner: Owner | "All" }
  | { type: "add"; title: string }
  | { type: "none" };

export type AgentReply = { text: string; action: AgentAction };

function normalize(input: string) {
  return input.trim().toLowerCase().replace(/[?.!,]/g, "");
}

export function respondToAgent(input: string, context: { tasks: Task[]; projects: Project[]; blocks: Block[]; currentTask?: Task; owner: Owner | "All" }): AgentReply {
  const text = normalize(input);
  const ranked = rankTasks(context.tasks, context.owner);
  const next = ranked.find((task) => task.id !== context.currentTask?.id) ?? ranked[0];

  if (!text) return { text: "Say or type a command.", action: { type: "none" } };
  if (/^(start|start focus|begin|begin focus)/.test(text)) return { text: `Starting ${context.currentTask?.title ?? "your focus block"}.`, action: { type: "start" } };
  if (/^(pause|stop timer|pause focus)/.test(text)) return { text: "Focus timer paused.", action: { type: "pause" } };
  if (/(finish|finished|complete|done with)/.test(text)) return { text: `Marked ${context.currentTask?.title ?? "the current task"} complete.`, action: { type: "finish" } };
  if (/(blocked|i am blocked|mark blocked)/.test(text)) return { text: "Marked the current task blocked and moved it out of the active queue.", action: { type: "block" } };
  if (/(plan my day|replan|schedule my day|make my schedule)/.test(text)) return { text: "I rebuilt the day around your highest-priority unfinished work, with breaks included.", action: { type: "replan" } };
  if (/(show|switch to|filter).*(leah)/.test(text)) return { text: "Showing Leah's work plus shared responsibilities.", action: { type: "owner", owner: "Leah" } };
  if (/(show|switch to|filter).*(moshe)/.test(text)) return { text: "Showing Moshe's work plus shared responsibilities.", action: { type: "owner", owner: "Moshe" } };
  if (/(show|switch to|filter).*(shared)/.test(text)) return { text: "Showing shared work.", action: { type: "owner", owner: "Shared" } };
  if (/(show|switch to|filter).*(all|everything)/.test(text)) return { text: "Showing all work.", action: { type: "owner", owner: "All" } };

  const addMatch = input.match(/(?:add|create|remember) (?:a )?task(?: to)?[: ]+(.+)/i) ?? input.match(/(?:add|create|remember)[: ]+(.+)/i);
  if (addMatch?.[1]) return { text: `Added “${addMatch[1].trim()}” to the inbox.`, action: { type: "add", title: addMatch[1].trim() } };

  if (/(what.*next|next task|what should i do)/.test(text)) {
    return { text: context.currentTask ? `Right now: ${context.currentTask.title}. After that: ${next?.title ?? "nothing urgent"}.` : `Your next task is ${next?.title ?? "not set"}.`, action: { type: "none" } };
  }

  if (/(what.*today|today.*plan|read.*schedule)/.test(text)) {
    const remaining = context.blocks.filter((block) => block.end >= new Date().toTimeString().slice(0, 5)).slice(0, 4);
    return { text: remaining.length ? `The next blocks are ${remaining.map((block) => `${block.start}, ${block.label}`).join("; ")}.` : "There are no remaining scheduled blocks. Ask me to replan the day.", action: { type: "none" } };
  }

  if (/(tired|low energy|exhausted)/.test(text)) {
    const light = ranked.find((task) => task.energy !== "deep");
    return { text: light ? `Use a lower-energy block: ${light.title}, about ${light.minutes} minutes.` : "Take a ten-minute movement break, then return to the shortest unfinished task.", action: { type: "none" } };
  }

  const minutesMatch = text.match(/(?:i have|only have|give me) (\d+) minutes/);
  if (minutesMatch) {
    const available = Number(minutesMatch[1]);
    const fit = ranked.find((task) => task.minutes <= available) ?? ranked[0];
    return { text: fit ? `Best fit: ${fit.title}. It is estimated at ${fit.minutes} minutes.` : "Nothing is currently queued. Add a task first.", action: { type: "none" } };
  }

  if (/(help|commands|what can you do)/.test(text)) {
    return { text: "Try: what should I do next, plan my day, start focus, pause, finish this task, I have 20 minutes, I am tired, show Leah, or add task followed by the task.", action: { type: "none" } };
  }

  return { text: `I did not map that to an action. Your highest-priority unfinished item is ${ranked[0]?.title ?? "not set"}. Say “help” for commands.`, action: { type: "none" } };
}
