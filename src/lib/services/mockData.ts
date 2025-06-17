
import { Schedule } from "../types";

export const getMockSchedule = (): Schedule => ({
  solverStatus: "NOT_SOLVING",
  score: "0hard/0soft",
  lines: [
    { id: "line1", name: "Line 1", machineTypeDisplayName: "Type A", lineAvailable: true },
    { id: "line2", name: "Line 2", machineTypeDisplayName: "Type B", lineAvailable: true }
  ],
  jobs: [
    {
      id: "job1",
      name: "Job 1",
      product: {
        id: "prod1",
        name: "Product 1",
        compatibleMachines: ["Type A"],
        compatiblePackaging: "Box",
        compatibleCarrier: "Pallet",
        neededPackagingAmount: 24,
        neededCarrierAmount: 40
      },
      duration: 7200, // 2 hours
      readyDateTime: new Date().toISOString(),
      idealEndDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      dueDateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
      line: null,
      startCleaningDateTime: null,
      startProductionDateTime: null,
      endDateTime: null,
      customerName: "Sample Customer",
      compatiblePackaging: "Box",
      compatibleCarrier: "Pallet",
      neededPackagingAmount: 24,
      neededCarrierAmount: 40
    }
  ],
  excludedJobs: [],
  stockDoneJobs: [],
  partiallyStockDoneJobs: [],
  workCalendar: {
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] // tomorrow
  }
});
