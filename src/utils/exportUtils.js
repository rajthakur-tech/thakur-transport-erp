import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatINR, formatDate } from './helpers';

/**
 * Export generic array of objects to Excel (.xlsx)
 */
export const exportToExcel = (data, fileName = 'TCR_Report', sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-fit column widths
    const maxProps = Object.keys(data[0] || {});
    const colWidths = maxProps.map(key => {
      const maxLen = Math.max(
        key.length,
        ...data.map(item => (item[key] ? item[key].toString().length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
    });
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (err) {
    console.error('Excel export error:', err);
    alert('Could not export to Excel: ' + err.message);
    return false;
  }
};

/**
 * Export tabular data to PDF using jsPDF and autoTable
 */
export const exportToPDF = ({
  title = 'Business Report',
  subtitle = 'Thakur Transport & Management System',
  businessName = 'THAKUR TRANSPORT',
  headers = [],
  data = [],
  fileName = 'TT_Report'
}) => {
  try {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    
    // Header styling
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(businessName.toUpperCase(), 40, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, 40, 48);
    
    // Timestamp
    const dateStr = `Generated on: ${new Date().toLocaleString('en-IN')}`;
    doc.text(dateStr, doc.internal.pageSize.getWidth() - 40, 48, { align: 'right' });
    
    // Title of Report
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 40, 85);

    // Table
    doc.autoTable({
      startY: 95,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [19, 91, 236], // TCR Blue
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 6,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 40, right: 40 }
    });

    // Save PDF
    doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF export error:', err);
    alert('Could not export to PDF: ' + err.message);
    return false;
  }
};
