import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (title: string, headers: string[], rows: any[][], fileName: string) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    // Table
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [255, 71, 0] }, // #FF4700
    });

    doc.save(`${fileName}.pdf`);
};
