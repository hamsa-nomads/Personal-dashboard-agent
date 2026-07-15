"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Bot, BriefcaseBusiness, Check, Clock3, Cloud, CloudOff, Home, Inbox, LayoutGrid, Mic, Pause, Play, Plus, RefreshCw, Sparkles, Upload, X } from "lucide-react";
import VoiceAgent from "@/components/VoiceAgent";
import { respondToAgent } from "@/lib/agent";
import { buildDayPlan, rankTasks } from "@/lib/planner";
import { initialState } from "@/lib/seed";
import type { DashboardState, Owner, Proposal, Task } from "@/lib/types";

const STORAGE = "dayframe-state-v2";
const tabs = [["Now", Home], ["Today", Clock3], ["Projects", LayoutGrid], ["Inbox", Inbox]] as const;
const today = () => new Date().toISOString().slice(0, 10);
const minutesNow = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const toMinutes = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
const id = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

function vapidBytes(value: string) {
  const padded = (value + "=".repeat((4 - value.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function projectGuess(text: string) {
  const value = text.toLowerCase();
  if (/uscis|i-130|i-485|immigration|birth certificate/.test(value)) return "immigration";
  if (/sharepoint|word of the day|riddle/.test(value)) return "sharepoint";
  if (/torah tinkers|shabbat lamp|stem/.test(value)) return "torah-tinkers";
  if (/catan|hex isles|trade|bot turn/.test(value)) return "catanlike";
  if (/passport|website|header|404/.test(value)) return "hamsa-site";
  if (/renaissance|camping|lake george|event|shabbos/.test(value)) return "hamsa-events";
  if (/exercise|workout|walk/.test(value)) return "health";
  if (/ava|dog|home/.test(value)) return "home";
  return "dashboard";
}

function extract(text: string, source: string): Proposal[] {
  return [...new Set(text.split(/\n+|(?<=[.!?])\s+/).map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim()).filter((line) => line.length > 12 && /\b(add|build|call|check|complete|confirm|create|finish|fix|prepare|review|schedule|test|translate|update|write|need to|should)\b/i.test(line)))].slice(0, 40).map((title) => ({
    id: id(), title: title.replace(/[.!?]+$/, ""), projectId: projectGuess(title), owner: /moshe|code|website|catan/i.test(title) ? "Moshe" : /leah|sharepoint|torah tinkers/i.test(title) ? "Leah" : "Shared", minutes: 40, priority: /uscis|urgent|today|fix/i.test(title) ? 90 : 70, source,
  }));
}

export default function Page() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("Now");
  const [owner, setOwner] = useState<Owner | "All">("All");
  const [agent, setAgent] = useState(false);
  const [adding, setAdding] = useState(false);
  const [notes, setNotes] = useState("");
  const [seconds, setSeconds] = useState(50 * 60);
  const [running, setRunning] = useState(false);
  const [sync, setSync] = useState<"local" | "syncing" | "synced">("local");
  const [alertText, setAlertText] = useState("Enable alerts after installing on your iPhone Home Screen.");
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      let next = initialState;
      const local = localStorage.getItem(STORAGE);
      if (local) next = JSON.parse(local) as DashboardState;
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        const payload = await response.json() as { configured?: boolean; state?: DashboardState };
        if (response.ok && payload.state) { next = payload.state; setSync("synced"); }
      } catch { setSync("local"); }
      if (next.lastPlannedDate !== today()) next = { ...next, tasks: next.tasks.map((task) => task.recurring === "daily" ? { ...task, status: "todo" as const } : task), blocks: [], lastPlannedDate: today() };
      if (!next.blocks.length) next = { ...next, blocks: buildDayPlan(next.tasks), lastPlannedDate: today() };
      if (active) { setState(next); hydrated.current = true; }
    })();
    navigator.serviceWorker?.register("/sw.js").catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE, JSON.stringify(state));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSync("syncing");
      try {
        const response = await fetch("/api/state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(state) });
        const payload = await response.json() as { configured?: boolean };
        setSync(response.ok && payload.configured ? "synced" : "local");
      } catch { setSync("local"); }
    }, 800);
  }, [state]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (seconds || !running) return;
    setRunning(false);
    if (Notification.permission === "granted") new Notification("Focus block finished", { body: "Stand up, drink water, and move." });
  }, [seconds, running]);

  const ranked = useMemo(() => rankTasks(state.tasks, owner), [state.tasks, owner]);
  const currentBlock = state.blocks.find((block) => toMinutes(block.start) <= minutesNow() && minutesNow() < toMinutes(block.end)) ?? state.blocks.find((block) => toMinutes(block.start) > minutesNow());
  const current = state.tasks.find((task) => task.id === currentBlock?.taskId) ?? ranked[0];
  const project = state.projects.find((item) => item.id === current?.projectId);
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  function patchTask(taskId: string, patch: Partial<Task>) {
    setState((value) => ({ ...value, tasks: value.tasks.map((task) => task.id === taskId ? { ...task, ...patch } : task) }));
  }

  async function plan() {
    const blocks = buildDayPlan(state.tasks, owner);
    setState((value) => ({ ...value, blocks, lastPlannedDate: today() }));
    try { await fetch("/api/push/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: today(), blocks, offsetMinutes: new Date().getTimezoneOffset() }) }); } catch { /* local-only mode */ }
  }

  async function enableAlerts() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) { setAlertText("This browser does not support web notifications."); return; }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") { setAlertText("Notification permission was not granted."); return; }
    const registration = await navigator.serviceWorker.ready;
    try {
      const keyResponse = await fetch("/api/push/public-key");
      const key = await keyResponse.json() as { publicKey?: string; configured?: boolean };
      if (!key.configured || !key.publicKey) throw new Error("Push server is not configured yet.");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidBytes(key.publicKey) });
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: subscription.toJSON(), deviceName: navigator.userAgent.includes("iPhone") ? "iPhone" : "Desktop" }) });
      await plan();
      setAlertText("Background web-push reminders are active on this device.");
    } catch (error) {
      setAlertText(error instanceof Error ? error.message : "Local notifications are enabled; cloud push is not configured.");
      new Notification("Dayframe alerts enabled", { body: "This device can show local focus reminders." });
    }
  }

  function command(text: string) {
    const reply = respondToAgent(text, { tasks: state.tasks, projects: state.projects, blocks: state.blocks, currentTask: current, owner });
    if (reply.action.type === "start") { setSeconds(Math.min(50, current?.minutes ?? 50) * 60); setRunning(true); if (current) patchTask(current.id, { status: "doing" }); }
    if (reply.action.type === "pause") setRunning(false);
    if (reply.action.type === "finish" && current) patchTask(current.id, { status: "done" });
    if (reply.action.type === "block" && current) patchTask(current.id, { status: "blocked" });
    if (reply.action.type === "replan") void plan();
    if (reply.action.type === "owner") setOwner(reply.action.owner);
    if (reply.action.type === "add") setState((value) => ({ ...value, tasks: [...value.tasks, { id: id(), title: reply.action.type === "add" ? reply.action.title : "New task", projectId: projectGuess(text), owner: "Shared", minutes: 30, status: "todo", energy: "light", priority: 70 }] }));
    return reply.text;
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const task: Task = { id: id(), title: String(form.get("title")), projectId: String(form.get("projectId")), owner: String(form.get("owner")) as Owner, minutes: Number(form.get("minutes")), status: "todo", energy: "light", priority: 70 };
    setState((value) => ({ ...value, tasks: [...value.tasks, task] }));
    setAdding(false);
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as unknown;
      const texts: string[] = [];
      if (Array.isArray(data)) for (const conversation of data.slice(-150)) {
        const mapping = (conversation as { mapping?: Record<string, { message?: { author?: { role?: string }; content?: { parts?: unknown[] } } }> }).mapping;
        for (const node of Object.values(mapping ?? {})) if (node.message?.author?.role === "user") for (const part of node.message.content?.parts ?? []) if (typeof part === "string") texts.push(part);
      }
      setState((value) => ({ ...value, proposals: [...value.proposals, ...extract(texts.join("\n"), file.name)] }));
    } catch { setAlertText("Could not read that conversations.json file."); }
    event.target.value = "";
  }

  return <main className="shell">
    <aside className="sidebar"><div className="brand"><b>D</b><div><strong>Dayframe</strong><small>Personal work OS</small></div></div><nav>{tabs.map(([label, Icon]) => <button key={label} className={tab === label ? "active" : ""} onClick={() => setTab(label)}><Icon />{label}</button>)}</nav><div className="sync">{sync === "synced" ? <Cloud /> : <CloudOff />} {sync === "syncing" ? "Syncing…" : sync === "synced" ? "Shared sync" : "This device"}</div></aside>
    <section className="content"><header><div><small>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</small><h1>{tab}</h1></div><div className="header-actions"><div className="owners">{(["All", "Leah", "Moshe", "Shared"] as const).map((value) => <button key={value} className={owner === value ? "active" : ""} onClick={() => setOwner(value)}>{value}</button>)}</div><button className="round" onClick={() => setAgent(true)}><Bot /></button><button className="round accent" onClick={() => setAdding(true)}><Plus /></button></div></header>

      {tab === "Now" && <div className="now-grid"><section className="focus"><span className="kicker">CURRENT FOCUS</span><h2>{current?.title ?? "Queue clear"}</h2><p>{project?.name} · {current?.owner}</p><div className="timer">{clock}</div><div className="actions"><button className="primary" onClick={() => { setRunning(!running); if (!running && current) patchTask(current.id, { status: "doing" }); }}>{running ? <Pause /> : <Play />}{running ? "Pause" : "Start focus"}</button><button onClick={() => current && patchTask(current.id, { status: "done" })}><Check />Finished</button></div></section><aside className="next"><span className="kicker">COMING NEXT</span>{state.blocks.filter((block) => toMinutes(block.start) > minutesNow()).slice(0, 4).map((block) => <div key={block.id}><b>{block.start}</b><p>{block.label}</p></div>)}<button className="link" onClick={() => void plan()}><RefreshCw />Replan from now</button></aside><section className="queue"><div className="panel-title"><div><span>Priority queue</span><h3>After the current block</h3></div></div>{ranked.slice(0, 8).map((task, index) => <div className="task" key={task.id}><b>{index + 1}</b><button className="check" onClick={() => patchTask(task.id, { status: "done" })}></button><div><strong>{task.title}</strong><p>{state.projects.find((item) => item.id === task.projectId)?.name} · {task.owner}</p></div><small>{task.minutes}m</small></div>)}</section><section className="alerts"><Bell /><div><strong>Notifications</strong><p>{alertText}</p></div><button onClick={enableAlerts}>Enable alerts</button></section></div>}

      {tab === "Today" && <section className="card"><div className="panel-title"><div><span>Adaptive schedule</span><h3>Today’s timeline</h3></div><button onClick={() => void plan()}><Sparkles />Replan</button></div>{state.blocks.map((block) => <div className="timeline" key={block.id}><time>{block.start}</time><i className={block.type}></i><div><strong>{block.label}</strong><p>{block.end} · {block.type}</p></div></div>)}</section>}

      {tab === "Projects" && <section className="projects">{state.projects.filter((item) => owner === "All" || item.owner === owner || item.owner === "Shared").map((item) => { const tasks = state.tasks.filter((task) => task.projectId === item.id); const done = tasks.filter((task) => task.status === "done").length; return <article key={item.id}><div className="project-head"><BriefcaseBusiness /><small>{item.area}</small></div><h3>{item.name}</h3><p>{item.objective}</p><b>Next: {item.milestone}</b><div className="progress"><span style={{ width: `${tasks.length ? done / tasks.length * 100 : 0}%` }} /></div><small>{done}/{tasks.length} complete</small></article>; })}</section>}

      {tab === "Inbox" && <div className="inbox-grid"><section className="card"><h2>Private task extraction</h2><p>Paste notes or import ChatGPT conversations.json. Nothing becomes a task until approved.</p><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Paste notes…" /><div className="actions"><button className="primary" onClick={() => { setState((value) => ({ ...value, proposals: [...value.proposals, ...extract(notes, "Pasted notes")] })); setNotes(""); }}><Sparkles />Extract</button><label className="button"><Upload />Import JSON<input type="file" accept=".json,application/json" onChange={importJson} /></label></div></section><section className="card"><div className="panel-title"><div><span>Review required</span><h3>{state.proposals.length} proposals</h3></div></div>{state.proposals.map((proposal) => <div className="proposal" key={proposal.id}><div><strong>{proposal.title}</strong><p>{proposal.owner} · {proposal.source}</p></div><button className="primary" onClick={() => setState((value) => ({ ...value, proposals: value.proposals.filter((item) => item.id !== proposal.id), tasks: [...value.tasks, { id: id(), title: proposal.title, projectId: proposal.projectId, owner: proposal.owner, minutes: proposal.minutes, priority: proposal.priority, energy: "light", status: "todo" }] }))}><Check /></button></div>)}</section></div>}
    </section>

    <button className="voice-fab" onClick={() => setAgent(true)}><Mic /></button><nav className="mobile-nav">{tabs.map(([label, Icon]) => <button key={label} className={tab === label ? "active" : ""} onClick={() => setTab(label)}><Icon /><span>{label}</span></button>)}</nav><VoiceAgent open={agent} onClose={() => setAgent(false)} onCommand={command} />
    {adding && <div className="modal-bg" onClick={() => setAdding(false)}><form className="modal" onSubmit={addTask} onClick={(event) => event.stopPropagation()}><button type="button" className="close" onClick={() => setAdding(false)}><X /></button><h2>Add task</h2><label>Next action<input name="title" required autoFocus /></label><label>Project<select name="projectId">{state.projects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Owner<select name="owner"><option>Shared</option><option>Leah</option><option>Moshe</option></select></label><label>Minutes<input name="minutes" type="number" min="5" step="5" defaultValue="30" /></label><button className="primary">Add task</button></form></div>}
  </main>;
}
