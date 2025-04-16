
export interface Line {
  id: string;
  name: string;
  machineTypeDisplayName: string;
}

export interface Product {
  id: string;
  name: string;
  compatibleMachines: string[];
}

export interface Job {
  id: string;
  name: string;
  product: Product;
  duration: number;
  readyDateTime: string;
  idealEndDateTime: string;
  dueDateTime: string;
  line: Line | null;
  startCleaningDateTime: string | null;
  startProductionDateTime: string | null;
  endDateTime: string | null;
}

export interface WorkCalendar {
  fromDate: string;
  toDate: string;
}

export interface Schedule {
  solverStatus: string | null;
  score: string | null;
  lines: Line[];
  jobs: Job[];
  workCalendar: WorkCalendar;
}

export type SolverStatus = "NOT_SOLVING" | "SOLVING" | "TERMINATED";
