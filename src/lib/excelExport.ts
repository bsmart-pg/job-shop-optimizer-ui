
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Schedule, Job } from './types';
import { mergeConsecutiveJobs } from './scheduleUtils';

export const exportToExcel = async () => {
  try {
    // Use relative URL for the fetch call
    const response = await fetch('/schedule');
    if (!response.ok) {
      throw new Error('Failed to fetch schedule data');
    }
    
    const schedule: Schedule = await response.json();
    console.log('Original jobs before merging:', schedule.jobs.length);
    
    // Apply the same merging logic used in the timeline
    const mergedJobs = mergeConsecutiveJobs(schedule.jobs);
    console.log('Jobs after merging for Excel export:', mergedJobs.length);
    
    // Transform merged jobs into Excel data rows
    const data = mergedJobs
      .filter(job => job.line) // Only include assigned jobs
      .map((job: Job) => ({
        'Job': job.name.split(" x ")[0],
        'Amount': job.name.split(" x ")[1],
        'Line': job.line?.name || '',
        'Start Cleaning': job.startCleaningDateTime ? format(new Date(job.startCleaningDateTime), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        'Start Production': job.startProductionDateTime ? format(new Date(job.startProductionDateTime), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        'End': job.endDateTime ? format(new Date(job.endDateTime), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        'Due Date': job.dueDateTime ? format(new Date(job.dueDateTime), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        'Cleaning Required': job.startCleaningDateTime && job.startProductionDateTime && 
          new Date(job.startCleaningDateTime).getTime() !== new Date(job.startProductionDateTime).getTime() ? 'Yes' : 'No',
        'On Time': job.endDateTime && job.dueDateTime && 
          new Date(job.endDateTime) <= new Date(job.dueDateTime) ? 'Yes' : 'No'
      }));
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
    
    // Generate filename with current date
    const fileName = `timeline_export_${format(new Date(), 'dd_MM_yyyy')}.xlsx`;
    
    // Export file
    XLSX.writeFile(wb, fileName);
    
    console.log('Excel export completed successfully');
  } catch (error) {
    console.error('Error exporting timeline to Excel:', error);
    throw error;
  }
};
