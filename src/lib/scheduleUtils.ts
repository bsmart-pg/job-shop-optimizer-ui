
import { Job } from './types';

export function mergeConsecutiveJobs(jobs: Job[]): Job[] {
  // Sort jobs by startCleaningDateTime to ensure correct order
  const sortedJobs = [...jobs].sort((a, b) => {
    if (!a.startCleaningDateTime || !b.startCleaningDateTime) return 0;
    return new Date(a.startCleaningDateTime).getTime() - new Date(b.startCleaningDateTime).getTime();
  });

  const mergedJobs: Job[] = [];
  let currentChain: Job[] = [];

  function getProductName(job: Job): string {
    return job.name.split(" x ")[0];
  }

  function mergeJobChain(chain: Job[]): Job | null {
    if (chain.length === 0) return null;
    if (chain.length === 1) return chain[0];

    const firstJob = chain[0];
    const lastJob = chain[chain.length - 1];
    const totalAmount = chain.reduce((sum, job) => {
      const amount = parseInt(job.name.split(" x ")[1]) || 0;
      return sum + amount;
    }, 0);

    return {
      ...firstJob,
      name: `${getProductName(firstJob)} x ${totalAmount}`,
      endDateTime: lastJob.endDateTime,
      duration: chain.reduce((sum, job) => sum + job.duration, 0)
    };
  }

  // Process all jobs
  for (let i = 0; i < sortedJobs.length; i++) {
    const currentJob = sortedJobs[i];
    
    // Skip jobs without required timestamps
    if (!currentJob.startCleaningDateTime || !currentJob.endDateTime) {
      mergedJobs.push(currentJob);
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

    // Check if jobs can be chained (same product and consecutive times)
    const isConsecutive = lastJobInChain.endDateTime === currentJob.startCleaningDateTime;
    const isSameProduct = currentProductName === lastProductName;

    if (isConsecutive && isSameProduct) {
      // Add to current chain
      currentChain.push(currentJob);
    } else {
      // End current chain and start new one
      const mergedJob = mergeJobChain(currentChain);
      if (mergedJob) mergedJobs.push(mergedJob);
      currentChain = [currentJob];
    }
  }

  // Handle the last chain
  const lastMergedJob = mergeJobChain(currentChain);
  if (lastMergedJob) mergedJobs.push(lastMergedJob);

  return mergedJobs;
}
