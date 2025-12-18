// src/services/pdfService.js
// Service for generating PDF reports from trips

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate PDF report for a trip with participants
 * @param {Object} trip - Trip object
 * @param {Array} allContacts - Array of all contacts
 */
export const generateTripPDF = (trip, allContacts) => {
  try {
    const doc = new jsPDF();
    
    // Get participant details
    const participantDetails = getParticipantDetails(trip, allContacts);
    
    // Add title
    addTitle(doc, trip);
    
    // Add trip information
    const infoEndY = addTripInfo(doc, trip, participantDetails);
    
    // Add participants table
    addParticipantsTable(doc, participantDetails, infoEndY);
    
    // Add footer
    addFooter(doc);
    
    // Save PDF
    const filename = `ekdromi_${Date.now()}.pdf`;
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get participant details with contact information
 */
const getParticipantDetails = (trip, allContacts) => {
  if (!trip.participants || trip.participants.length === 0) {
    return [];
  }

  // Filter to only include checked (confirmed) participants
  return trip.participants
    .filter(p => {
      const isChecked = typeof p === 'object' ? p.checked === true : true;
      return isChecked;
    })
    .map(p => {
      const contactId = typeof p === 'string' ? p : p.contactId;
      const checked = typeof p === 'object' ? p.checked : true;
      const notes = typeof p === 'object' ? p.notes : '';
      
      const contact = allContacts.find(c => c._id === contactId);
      
      return {
        contact: contact || { firstName: 'Άγνωστο', lastName: '', phone: '' },
        checked,
        notes
      };
    });
};

/**
 * Add title to PDF
 */
const addTitle = (doc, trip) => {
  doc.setFontSize(20);
  doc.setTextColor(102, 126, 234);
  doc.text('Αναφορά Εκδρομής', 105, 20, { align: 'center' });
};

/**
 * Add trip information section
 * @returns {number} Y position after trip info
 */
const addTripInfo = (doc, trip, participantDetails) => {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const dateStr = new Date(trip.date).toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let currentY = 40;
  
  doc.text(`Όνομα: ${trip.name}`, 20, currentY);
  currentY += 10;
  
  doc.text(`Ημερομηνία: ${dateStr}`, 20, currentY);
  currentY += 10;
  
  doc.text(`Τοποθεσίες: ${trip.locations.join(', ')}`, 20, currentY);
  currentY += 10;
  
  doc.text(`Συμμετέχοντες: ${participantDetails.length}`, 20, currentY);
  currentY += 10;
  
  // Add trip notes if they exist
  if (trip.notes && trip.notes.trim()) {
    currentY += 5;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('Σημειώσεις Εκδρομής:', 20, currentY);
    currentY += 8;
    
    // Split notes into lines that fit the page width
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const notesLines = doc.splitTextToSize(trip.notes, 170);
    
    // Add a background box for notes
    const notesHeight = notesLines.length * 6 + 10;
    doc.setFillColor(255, 243, 205); // Light yellow
    doc.rect(15, currentY - 5, 180, notesHeight, 'F');
    
    doc.text(notesLines, 20, currentY);
    currentY += notesLines.length * 6 + 10;
  }
  
  return currentY;
};

/**
 * Add participants table
 */
const addParticipantsTable = (doc, participantDetails, startY) => {
  if (participantDetails.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Δεν υπάρχουν συμμετέχοντες', 105, startY + 20, { align: 'center' });
    return;
  }

  const hasNotes = participantDetails.some(p => p.notes && p.notes.trim() !== '');
  
  // Build table headers - NO status column anymore (all are confirmed)
  const headers = ['#', 'Όνομα', 'Επώνυμο', 'Τηλέφωνο'];
  if (hasNotes) headers.push('Σημειώσεις');
  
  // Build table data
  const tableData = participantDetails.map((p, idx) => {
    const row = [
      idx + 1,
      p.contact.firstName,
      p.contact.lastName,
      p.contact.phone || 'Μη διαθέσιμο'
    ];
    
    if (hasNotes) {
      row.push(p.notes || '-');
    }
    
    return row;
  });

  doc.autoTable({
    startY: startY + 10,
    head: [headers],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [102, 126, 234],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: hasNotes ? 30 : 40 },
      2: { cellWidth: hasNotes ? 30 : 40 },
      3: { halign: 'center', cellWidth: hasNotes ? 25 : 35 },
      ...(hasNotes && { 4: { cellWidth: 50 } })
    }
  });
};

/**
 * Add footer to PDF
 */
const addFooter = (doc) => {
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 100;
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  
  const createdDate = new Date().toLocaleString('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Δημιουργήθηκε: ${createdDate}`, 20, finalY + 15);
  doc.text('Trip Manager App', 105, finalY + 15, { align: 'center' });
};

const pdfService = {
  generateTripPDF
};

export default pdfService;