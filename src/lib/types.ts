
export interface Line {
  id: string;
  name: string;
  machineTypeDisplayName: string;
  lineAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  compatibleMachines: string[];
  compatiblePackaging: string | null;
  compatibleCarrier: string;
  neededPackagingAmount: number | null;
  neededCarrierAmount: number;
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
  customerName: string;
  usedStock?: number;
  quantity?: number;
  orderNumber?: string;
  recipient?: string; // Added the recipient property
  compatiblePackaging: string | null;
  compatibleCarrier: string;
  neededPackagingAmount: number | null;
  neededCarrierAmount: number;
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
  excludedJobs: Job[];
  stockDoneJobs: Job[];
  partiallyStockDoneJobs: Job[];
  unfulfillableJobs: Job[];
  workCalendar: WorkCalendar;
}

export type SolverStatus = "NOT_SOLVING" | "SOLVING" | "TERMINATED";
