export type Owner = "Leah" | "Moshe" | "Shared";
export type Status = "todo" | "doing" | "done" | "blocked";
export type Energy = "deep" | "light" | "admin";
export type BlockType = "focus" | "break" | "life";

export type Project = {
  id: string;
  name: string;
  owner: Owner;
  area: "Work" | "Hamsa Nomads" | "Immigration" | "Business" | "Development" | "Home" | "Health";
  objective: string;
  milestone: string;
  deadline?: string;
};

export type Task = {
  id: string;
  title: string;
  projectId: string;
  owner: Owner;
  minutes: number;
  status: Status;
  energy: Energy;
  priority: number;
  due?: string;
  recurring?: "daily" | "weekly";
  notes?: string;
};

export type Block = {
  id: string;
  start: string;
  end: string;
  label: string;
  type: BlockType;
  taskId?: string;
};

export type Proposal = {
  id: string;
  title: string;
  projectId: string;
  owner: Owner;
  minutes: number;
  priority: number;
  source: string;
};

export type DashboardState = {
  version: 2;
  projects: Project[];
  tasks: Task[];
  blocks: Block[];
  proposals: Proposal[];
  lastPlannedDate?: string;
};
