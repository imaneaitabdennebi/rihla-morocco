import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const STATUS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  refused: 'Refusée',
  cancelled: 'Annulée',
};

export function exportPdf(items, title) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - ${items.length} réservation(s)`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [['N°', 'Date', 'Circuit', 'Ville', 'Prix', 'Touriste', 'Email', 'Statut']],
    body: items.map((r) => [
      r.id,
      r.date,
      r.circuit,
      r.city,
      `${r.price} MAD`,
      r.tourist,
      r.email,
      STATUS[r.status] || r.status,
    ]),
    headStyles: { fillColor: [11, 127, 95] },
    styles: { fontSize: 9 },
  });

  doc.save('reservations.pdf');
}

export function exportExcel(items) {
  const rows = items.map((r) => ({
    'N°': r.id,
    Date: r.date,
    Circuit: r.circuit,
    Ville: r.city,
    'Prix (MAD)': r.price,
    Touriste: r.tourist,
    Email: r.email,
    Statut: STATUS[r.status] || r.status,
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 28 }, { wch: 14 },
    { wch: 12 }, { wch: 20 }, { wch: 28 }, { wch: 14 },
  ];

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Réservations');
  XLSX.writeFile(book, 'reservations.xlsx');
}