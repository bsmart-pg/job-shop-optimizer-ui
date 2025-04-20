
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const exportToExcel = () => {
  try {
    // Get timeline data from the DOM since we're using vis-timeline
    const items = document.querySelectorAll('.vis-item.vis-range:not(.vis-background)');
    const cleaningItems = document.querySelectorAll('.vis-item.cleaning-item');
    
    console.log('Found timeline items:', items.length);
    console.log('Found cleaning items:', cleaningItems.length);
    
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
    
    // Process all timeline items that represent jobs
    const data = Array.from(items)
      .filter(item => {
        // Filter out background items and cleaning items (which we process separately)
        return !item.classList.contains('vis-background') && 
               !item.classList.contains('cleaning-item');
      })
      .map(item => {
        const jobId = item.id;
        const content = item.querySelector('.vis-item-content')?.textContent?.trim() || '';
        const start = item.getAttribute('data-start') || '';
        const end = item.getAttribute('data-end') || '';
        
        console.log('Processing item:', jobId, content);
        
        // Get line name from content (if in byLine view) or from parent element (if in byJob view)
        let jobName = content;
        let lineName = '';
        
        // Determine if we're in byLine or byJob view
        const currentView = document.querySelector('.tabs-list [data-state="active"]');
        if (currentView && currentView.textContent?.includes('Line')) {
          // In byLine view, the content is the job name and we get line from the group
          jobName = content;
          const groupId = item.getAttribute('group') || '';
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
          const groupId = item.getAttribute('group') || '';
          const groupElement = document.querySelector(`.vis-group[data-id="${groupId}"]`);
          if (groupElement) {
            jobName = groupElement.querySelector('.vis-content')?.textContent?.trim() || '';
          }
        }
        
        // Get cleaning info from the map
        const cleaning = cleaningMap.get(jobId.toString());
        const startCleaning = cleaning ? cleaning.startCleaning : '';
        const startProduction = start; // Default to item start time if no cleaning info
        
        console.log('Job:', jobName, 'Line:', lineName, 'Start:', start, 'End:', end);
        
        return {
          'Job': jobName,
          'Line': lineName,
          'Start Cleaning': startCleaning ? format(new Date(startCleaning), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
          'Start Production': startProduction ? format(new Date(startProduction), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
          'End': end ? format(new Date(end), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
        };
      });
    
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
