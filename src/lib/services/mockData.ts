
import { Schedule } from "../types";

export const getMockSchedule = (): Schedule => ({
  solverStatus: "NOT_SOLVING",
  score: "0hard/0soft",
  lines: [
    { id: "line1", name: "Line 1", machineTypeDisplayName: "Type A" },
    { id: "line2", name: "Line 2", machineTypeDisplayName: "Type B" }
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
      line: { id: "line1", name: "Line 1", machineTypeDisplayName: "Type A" },
      startCleaningDateTime: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
      startProductionDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      endDateTime: null,
      customerName: "Sample Customer",
      quantity: 480, // This will need 20 boxes (480/24) and 1 pallet (20/40)
      orderNumber: "ORD-001",
      recipient: "Customer A"
    },
    {
      id: "job2",
      name: "Job 2",
      product: {
        id: "prod2",
        name: "Product 2 - No Packaging",
        compatibleMachines: ["Type B"],
        compatiblePackaging: null,
        compatibleCarrier: "Container",
        neededPackagingAmount: null,
        neededCarrierAmount: 100
      },
      duration: 5400, // 1.5 hours
      readyDateTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      idealEndDateTime: new Date(Date.now() + 86400000 + 5400000).toISOString(),
      dueDateTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
      line: { id: "line2", name: "Line 2", machineTypeDisplayName: "Type B" },
      startCleaningDateTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
      startProductionDateTime: new Date(Date.now() + 86400000 + 1800000).toISOString(),
      endDateTime: null,
      customerName: "Another Customer",
      quantity: 250, // This will need 3 containers (250/100)
      orderNumber: "ORD-002",
      recipient: "Customer B"
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
