import type { DashboardState, Project, Task } from "./types";

export const projects: Project[] = [
  { id: "sharepoint", name: "Directorate SharePoint", owner: "Leah", area: "Work", objective: "Make the directorate homepage genuinely useful for non-technical staff.", milestone: "Finish the Word of the Day experience and polish the daily engagement components." },
  { id: "hamsa-events", name: "Hamsa Nomads — Events", owner: "Shared", area: "Hamsa Nomads", objective: "Run small, well-organized Jewish travel and Shabbos experiences.", milestone: "Beth Tephilah dinner theater, Renaissance Faire Shabbos, then late-August camping weekends.", deadline: "2026-08-14" },
  { id: "hamsa-site", name: "Hamsa Nomads — Website", owner: "Moshe", area: "Hamsa Nomads", objective: "Keep the site mobile-first, coherent, fast, and aligned with the Hamsa visual identity.", milestone: "Stabilize passport pages, shared backgrounds, header behavior, and event flows." },
  { id: "immigration", name: "USCIS Adjustment of Status", owner: "Shared", area: "Immigration", objective: "Prepare a complete, internally consistent marriage-based filing package.", milestone: "Finish forms, translations, I-864 evidence, and bona-fide-marriage documentation." },
  { id: "torah-tinkers", name: "Torah Tinkers", owner: "Leah", area: "Business", objective: "Launch a hands-on STEM + Torah product for families and homeschoolers.", milestone: "Prototype the Shabbat lamp house kit and validate the first ten customers." },
  { id: "catanlike", name: "Hex Isles / Catanlike", owner: "Moshe", area: "Development", objective: "Make the Cities & Knights-inspired game reliable for two-device online play.", milestone: "Resolve turn synchronization, bot, trade, privacy, and notification bugs." },
  { id: "dashboard", name: "Personal Dashboard Agent", owner: "Shared", area: "Development", objective: "Run Leah and Moshe's work from one private, time-aware operating system.", milestone: "Deploy the PWA, enable shared sync, voice commands, and real web push." },
  { id: "expenses", name: "Cohen Expense Flow", owner: "Shared", area: "Home", objective: "Keep receipts, reimbursements, and Hamsa/Personal expenses organized.", milestone: "Clear items needing review and keep weekly receipt processing current." },
  { id: "health", name: "Health & Movement", owner: "Leah", area: "Health", objective: "Build consistent daily movement without sacrificing project progress.", milestone: "Exercise most days and include regular screen breaks and walking." },
  { id: "home", name: "Home & Ava", owner: "Shared", area: "Home", objective: "Keep daily household responsibilities visible and shared.", milestone: "Ava gets a proper outing every day and essential household tasks do not disappear." },
];

export const tasks: Task[] = [
  { id: "sp-word", title: "Finish the SharePoint Word of the Day layout", projectId: "sharepoint", owner: "Leah", minutes: 50, status: "todo", energy: "deep", priority: 99 },
  { id: "sp-riddle", title: "Polish the homepage riddle component", projectId: "sharepoint", owner: "Leah", minutes: 35, status: "todo", energy: "light", priority: 78 },
  { id: "bt-final", title: "Finalize Beth Tephilah dinner-theater logistics and RSVP check", projectId: "hamsa-events", owner: "Shared", minutes: 40, status: "todo", energy: "admin", priority: 94, due: "2026-07-22" },
  { id: "renaissance-flow", title: "Review the Renaissance Faire application and schedule-a-call flow", projectId: "hamsa-events", owner: "Shared", minutes: 35, status: "todo", energy: "light", priority: 91, due: "2026-07-18" },
  { id: "renaissance-logistics", title: "Confirm Renaissance Faire food, Sefer Torah, indoor, and camping logistics", projectId: "hamsa-events", owner: "Shared", minutes: 50, status: "todo", energy: "deep", priority: 89, due: "2026-08-03" },
  { id: "camping-lg", title: "Finalize Lake George camping weekend date, sites, and pricing", projectId: "hamsa-events", owner: "Shared", minutes: 45, status: "todo", energy: "deep", priority: 82, due: "2026-07-24" },
  { id: "camping-ithaca", title: "Finalize Buttermilk Falls weekend route, sites, and pricing", projectId: "hamsa-events", owner: "Shared", minutes: 45, status: "todo", energy: "deep", priority: 80, due: "2026-07-25" },
  { id: "passport-bg", title: "Remove old checkerboard background code from passport pages", projectId: "hamsa-site", owner: "Moshe", minutes: 45, status: "todo", energy: "deep", priority: 96 },
  { id: "passport-match", title: "Make Retreat-passeport use the same background as Passeport.html", projectId: "hamsa-site", owner: "Moshe", minutes: 35, status: "todo", energy: "deep", priority: 95 },
  { id: "header-layout", title: "Fix the Hamsa header so links remain readable without being crushed", projectId: "hamsa-site", owner: "Moshe", minutes: 40, status: "todo", energy: "deep", priority: 88 },
  { id: "holy-dough", title: "Add Holy Dough as a former event using the existing local-event images", projectId: "hamsa-site", owner: "Moshe", minutes: 30, status: "todo", energy: "light", priority: 73 },
  { id: "uscis-forms", title: "Complete the remaining I-130 and I-485 answers and consistency review", projectId: "immigration", owner: "Shared", minutes: 60, status: "todo", energy: "deep", priority: 100 },
  { id: "uscis-evidence", title: "Build the bona-fide-marriage evidence checklist and assign each missing item", projectId: "immigration", owner: "Shared", minutes: 45, status: "todo", energy: "admin", priority: 98 },
  { id: "uscis-translation", title: "Arrange a certified English translation of Moshe's birth certificate", projectId: "immigration", owner: "Shared", minutes: 25, status: "todo", energy: "admin", priority: 93 },
  { id: "uscis-i864", title: "Prepare the I-864 financial evidence and confirm sponsor documentation", projectId: "immigration", owner: "Leah", minutes: 50, status: "todo", energy: "deep", priority: 97 },
  { id: "tt-decisions", title: "Write the flagship Shabbat lamp kit design decisions", projectId: "torah-tinkers", owner: "Leah", minutes: 45, status: "todo", energy: "deep", priority: 86 },
  { id: "tt-bom", title: "Draft the first 30-unit bill of materials and target cost", projectId: "torah-tinkers", owner: "Leah", minutes: 45, status: "todo", energy: "deep", priority: 84 },
  { id: "tt-prototype", title: "Choose the first shutter mechanism and prepare a laser-cut prototype", projectId: "torah-tinkers", owner: "Leah", minutes: 60, status: "todo", energy: "deep", priority: 83 },
  { id: "tt-customers", title: "Prepare a short outreach message for the first ten potential customers", projectId: "torah-tinkers", owner: "Leah", minutes: 30, status: "todo", energy: "light", priority: 76 },
  { id: "catan-sync", title: "Stop the online map from reloading after every action", projectId: "catanlike", owner: "Moshe", minutes: 60, status: "todo", energy: "deep", priority: 90 },
  { id: "catan-bot", title: "Remove the duplicate runBotTurn definition and fix black-screen bot turns", projectId: "catanlike", owner: "Moshe", minutes: 60, status: "todo", energy: "deep", priority: 89 },
  { id: "catan-trade", title: "Fix online accept/refuse trade state and private-card visibility", projectId: "catanlike", owner: "Moshe", minutes: 60, status: "todo", energy: "deep", priority: 87 },
  { id: "dashboard-deploy", title: "Deploy the Personal Dashboard Agent to Vercel", projectId: "dashboard", owner: "Shared", minutes: 35, status: "todo", energy: "admin", priority: 92 },
  { id: "dashboard-push", title: "Configure VAPID keys, Supabase, and scheduled web push", projectId: "dashboard", owner: "Moshe", minutes: 45, status: "todo", energy: "admin", priority: 91 },
  { id: "dashboard-iphone", title: "Install the PWA on Leah and Moshe's iPhones and test alerts", projectId: "dashboard", owner: "Shared", minutes: 25, status: "todo", energy: "light", priority: 88 },
  { id: "expenses-review", title: "Clear receipts and expense items marked Needs review", projectId: "expenses", owner: "Shared", minutes: 25, status: "todo", energy: "admin", priority: 72, recurring: "weekly" },
  { id: "exercise", title: "Strength workout or brisk 35-minute walk", projectId: "health", owner: "Leah", minutes: 35, status: "todo", energy: "light", priority: 90, recurring: "daily" },
  { id: "ava-walk", title: "Take Ava for a proper daily outing", projectId: "home", owner: "Shared", minutes: 25, status: "done", energy: "light", priority: 87, recurring: "daily", notes: "Already completed for July 15, 2026." },
];

export const initialState: DashboardState = { version: 2, projects, tasks, blocks: [], proposals: [] };
