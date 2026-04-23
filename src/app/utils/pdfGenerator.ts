import jsPDF from 'jspdf';
import type { Payment } from '../types';

export function generatePDFReceipt(apartmentName: string, payment: Payment) {
  const doc = new jsPDF();

  const totalUtilities =
    payment.utilitiesAmount.electricity +
    payment.utilitiesAmount.water +
    payment.utilitiesAmount.internet;
  const totalAmount = payment.rentAmount + totalUtilities;

  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let y = 20;

  doc.setFontSize(22);
  doc.text('RENT RECEIPT', 105, y, { align: 'center' });

  y += 15;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Receipt #${payment.id}`, 105, y, { align: 'center' });

  y += 20;
  doc.setDrawColor(200);
  doc.line(20, y, 190, y);

  y += 15;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Property:', 20, y);
  doc.setFont(undefined, 'bold');
  doc.text(apartmentName, 70, y);

  y += 10;
  doc.setFont(undefined, 'normal');
  doc.text('Payment Date:', 20, y);
  doc.setFont(undefined, 'bold');
  doc.text(formattedDate, 70, y);

  y += 20;
  doc.setDrawColor(200);
  doc.line(20, y, 190, y);

  y += 15;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('PAYMENT BREAKDOWN', 20, y);

  y += 12;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Rent', 20, y);
  doc.text(`$${payment.rentAmount.toFixed(2)}`, 190, y, { align: 'right' });

  if (totalUtilities > 0) {
    y += 10;
    doc.text('Utilities', 20, y);
    doc.text(`$${totalUtilities.toFixed(2)}`, 190, y, { align: 'right' });

    if (payment.utilitiesAmount.electricity > 0) {
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('  • Electricity', 20, y);
      doc.text(`$${payment.utilitiesAmount.electricity.toFixed(2)}`, 190, y, { align: 'right' });
    }

    if (payment.utilitiesAmount.water > 0) {
      y += 8;
      doc.text('  • Water', 20, y);
      doc.text(`$${payment.utilitiesAmount.water.toFixed(2)}`, 190, y, { align: 'right' });
    }

    if (payment.utilitiesAmount.internet > 0) {
      y += 8;
      doc.text('  • Internet', 20, y);
      doc.text(`$${payment.utilitiesAmount.internet.toFixed(2)}`, 190, y, { align: 'right' });
    }
  }

  y += 15;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);

  y += 12;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);
  doc.text('TOTAL PAID', 20, y);
  doc.text(`$${totalAmount.toFixed(2)}`, 190, y, { align: 'right' });

  if (payment.notes) {
    y += 20;
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(20, y, 190, y);

    y += 12;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', 20, y);

    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60);
    const splitNotes = doc.splitTextToSize(payment.notes, 170);
    doc.text(splitNotes, 20, y);
  }

  y = 270;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('This is a computer-generated receipt.', 105, y, { align: 'center' });
  y += 5;
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, 105, y, { align: 'center' });

  const fileName = `Receipt_${apartmentName.replace(/\s+/g, '_')}_${payment.paymentDate}.pdf`;
  doc.save(fileName);
}
