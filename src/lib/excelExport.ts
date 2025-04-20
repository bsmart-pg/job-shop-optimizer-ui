
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const exportToExcel = () => {
  // Get timeline data from the DOM since we're using vis-timeline
  const items = document.querySelectorAll('.vis-item.timeline-item');
  
  const data = Array.from(items).map(item => {
    const content = item.querySelector('.timeline-item-text')?.textContent || '';
    const start = item.getAttribute('data-start') || '';
    const end = item.getAttribute('data-end') || '';
    
    return {
      'Job/Linie': content,
      'Start': start ? format(new Date(start), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
      'Ende': end ? format(new Date(end), 'dd.MM.yyyy HH:mm', { locale: de }) : '',
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
