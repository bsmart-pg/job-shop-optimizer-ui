
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const exportToExcel = () => {
  // Get timeline data from the DOM since we're using vis-timeline
  const items = document.querySelectorAll('.vis-item.timeline-item');
  const cleaningItems = document.querySelectorAll('.vis-item.cleaning-item');
  
  // Create a map to store cleaning items by their job ID
  const cleaningMap = new Map();
  cleaningItems.forEach(item => {
    const jobId = item.id.toString().replace('_cleaning', '');
    const startCleaning = item.getAttribute('data-start') || '';
    const endCleaning = item.getAttribute('data-end') || '';
    
    cleaningMap.set(jobId, {
      startCleaning,
      endCleaning // This is effectively the start production time
    });
  });
  
  const data = Array.from(items).map(item => {
    const content = item.querySelector('.timeline-item-text')?.textContent || '';
    const jobId = item.getAttribute('data-id') || item.id;
    const start = item.getAttribute('data-start') || '';
    const end = item.getAttribute('data-end') || '';
    
    // Get line name from content (if in byLine view) or from parent element (if in byJob view)
    let jobName = content;
    let lineName = '';
    
    // Determine if we're in byLine or byJob view
    const currentView = document.querySelector('.tabs-list [data-state="active"]');
    if (currentView && currentView.textContent?.includes('Line')) {
      // In byLine view, the content is the job name and we get line from the group
      jobName = content;
      const groupId = item.getAttribute('data-group') || '';
      const groupElement = document.querySelector(`.vis-group[data-id="${groupId}"]`);
      if (groupElement) {
        lineName = groupElement.querySelector('.vis-content')?.textContent?.trim() || '';
        // Strip out the machine type if it's displayed as a subtitle
        if (lineName.includes('\n')) {
          lineName = lineName.split('\n')[0].trim();
        }
      }
    } else {
      // In byJob view, the content might be the line name and we get job from the group
      lineName = content;
      const groupId = item.getAttribute('data-group') || '';
      const groupElement = document.querySelector(`.vis-group[data-id="${groupId}"]`);
      if (groupElement) {
        jobName = groupElement.querySelector('.vis-content')?.textContent?.trim() || '';
      }
    }
    
    // Get cleaning info from the map
    const cleaning = cleaningMap.get(jobId.toString());
    const startCleaning = cleaning ? cleaning.startCleaning : '';
    const startProduction = cleaning ? cleaning.endCleaning : start;
    
    return {
      'Job': jobName,
      'Line': lineName,
      'Start Cleaning': startCleaning ? format(new Date(startCleaning), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
      'Start Production': startProduction ? format(new Date(startProduction), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
      'End': end ? format(new Date(end), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
    };
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
  
  // Generate filename with current date
  const fileName = `timeline_export_${format(new Date(), 'dd_MM_yyyy')}.xlsx`;
  
  // Export file
  XLSX.writeFile(wb, fileName);
};
