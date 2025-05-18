
import { Job } from './types';

export function mergeConsecutiveJobs(jobs: Job[]): Job[] {
  // First, group jobs by line
  const jobsByLine: Record<string, Job[]> = {};
  
  // Group all jobs by line id
  jobs.forEach(job => {
    if (job.line) {
      const lineId = job.line.id;
      if (!jobsByLine[lineId]) {
        jobsByLine[lineId] = [];
      }
      jobsByLine[lineId].push(job);
    }
  });
  
  // For unassigned jobs (no line), keep them unchanged
  const unassignedJobs = jobs.filter(job => !job.line);

  // Process each line separately
  const mergedJobsByLine: Job[] = [];
  
  Object.entries(jobsByLine).forEach(([lineId, lineJobs]) => {
    // Sort jobs within each line by startCleaningDateTime
    const sortedLineJobs = [...lineJobs].sort((a, b) => {
      if (!a.startCleaningDateTime || !b.startCleaningDateTime) return 0;
      return new Date(a.startCleaningDateTime).getTime() - new Date(b.startCleaningDateTime).getTime();
    });
    
    const lineMergedJobs: Job[] = [];
    let currentChain: Job[] = [];
    
    // Process all jobs within this line
    for (let i = 0; i < sortedLineJobs.length; i++) {
      const currentJob = sortedLineJobs[i];
      
      // Skip jobs without required timestamps
      if (!currentJob.startCleaningDateTime || !currentJob.endDateTime) {
        lineMergedJobs.push(currentJob);
        continue;
      }
      
      // If we're starting a new chain
      if (currentChain.length === 0) {
        currentChain.push(currentJob);
        continue;
      }
      
      const lastJobInChain = currentChain[currentChain.length - 1];
      const currentProductName = getProductName(currentJob);
      const lastProductName = getProductName(lastJobInChain);
      
      // Check if jobs can be chained (same product, consecutive times, and same due date)
      const isConsecutive = lastJobInChain.endDateTime === currentJob.startCleaningDateTime;
      const isSameProduct = currentProductName === lastProductName;
      const isSameDueDate = isSameDueDateTime(lastJobInChain, currentJob);
      
      // Log the merging decision factors
      console.log(`Checking jobs for merging: ${lastJobInChain.id} and ${currentJob.id}`);
      console.log(`- Same product: ${isSameProduct} (${lastProductName} vs ${currentProductName})`);
      console.log(`- Consecutive times: ${isConsecutive}`);
      console.log(`- Same due date: ${isSameDueDate} (${lastJobInChain.dueDateTime} vs ${currentJob.dueDateTime})`);
      
      if (isConsecutive && isSameProduct && isSameDueDate) {
        // Add to current chain
        console.log(`Merging jobs: ${lastJobInChain.id} and ${currentJob.id}`);
        currentChain.push(currentJob);
      } else {
        // End current chain and start new one
        console.log(`Cannot merge jobs: ${lastJobInChain.id} and ${currentJob.id}`);
        const mergedJob = mergeJobChain(currentChain);
        if (mergedJob) lineMergedJobs.push(mergedJob);
        currentChain = [currentJob];
      }
    }
    
    // Handle the last chain in this line
    const lastMergedJob = mergeJobChain(currentChain);
    if (lastMergedJob) lineMergedJobs.push(lastMergedJob);
    
    // Add all merged jobs from this line to the final result
    mergedJobsByLine.push(...lineMergedJobs);
  });
  
  // Combine unassigned jobs with the merged jobs by line
  return [...unassignedJobs, ...mergedJobsByLine];
}

// Helper function to check if two jobs have the same due date
function isSameDueDateTime(job1: Job, job2: Job): boolean {
  // Handle case when either job doesn't have a due date
  if (!job1.dueDateTime || !job2.dueDateTime) {
    return false;
  }
  
  // Convert to Date objects and compare
  const dueDate1 = new Date(job1.dueDateTime).getTime();
  const dueDate2 = new Date(job2.dueDateTime).getTime();
  
  return dueDate1 === dueDate2;
}

// Helper function to extract product name from job name
function getProductName(job: Job): string {
  return job.name.split(" x ")[0];
}

// Helper function to merge a chain of jobs
function mergeJobChain(chain: Job[]): Job | null {
  if (chain.length === 0) return null;
  if (chain.length === 1) return chain[0];
  
  const firstJob = chain[0];
  const lastJob = chain[chain.length - 1];
  const totalAmount = chain.reduce((sum, job) => {
    // Extract amount part from the job name, default to 1 if not found
    const parts = job.name.split(" x ");
    const amount = parts.length > 1 ? parseInt(parts[1]) || 1 : 1;
    return sum + amount;
  }, 0);
  
  return {
    ...firstJob,
    name: `${getProductName(firstJob)} x ${totalAmount}`,
    endDateTime: lastJob.endDateTime,
    duration: chain.reduce((sum, job) => sum + job.duration, 0)
  };
}
