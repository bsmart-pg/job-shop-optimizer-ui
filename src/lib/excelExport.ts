
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Schedule, Job } from './types';

export const exportToExcel = async () => {
  try {
    // Fetch schedule data from the API
    const response = await fetch('http://localhost:8080/schedule');
    if (!response.ok) {
      throw new Error('Failed to fetch schedule data');
    }
    
    const schedule: Schedule = await response.json();
    console.log('Schedule data:', schedule);
    
    // Transform jobs into Excel data rows
    const data = schedule.jobs
      .filter(job => job.line) // Only include assigned jobs
      .map((job: Job) => ({
        'Job': job.name,
        'Line': job.line?.name || '',
        'Start Cleaning': job.startCleaningDateTime ? format(new Date(job.startCleaningDateTime), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        'Start Production': job.startProductionDateTime ? format(new Date(job.startProductionDateTime), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        'End': job.endDateTime ? format(new Date(job.endDateTime), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        'Cleaning Required': job.startCleaningDateTime && job.startProductionDateTime && 
          new Date(job.startCleaningDateTime).getTime() !== new Date(job.startProductionDateTime).getTime() ? 'Yes' : 'No'
      }));
    
    // Debug output
    console.log('Exported data rows:', data.length);
    console.log('Sample data:', data.slice(0, 2));

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
    alert('There was an error exporting the timeline data. Please check the console for details.');
  }
};
