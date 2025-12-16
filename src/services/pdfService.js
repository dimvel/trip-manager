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
        addTripInfo(doc, trip, participantDetails);

        // Add participants table
        addParticipantsTable(doc, participantDetails);

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

    return trip.participants.map(p => {
        // Handle both old format (string) and new format (object)
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

    doc.text(`Όνομα: ${trip.name}`, 20, 40);
    doc.text(`Ημερομηνία: ${dateStr}`, 20, 50);
    doc.text(`Τοποθεσίες: ${trip.locations.join(', ')}`, 20, 60);
    doc.text(`Συνολικοί Συμμετέχοντες: ${participantDetails.length}`, 20, 70);

    // Add attendance stats
    const confirmedCount = participantDetails.filter(p => p.checked).length;
    const unconfirmedCount = participantDetails.length - confirmedCount;

    doc.text(`Επιβεβαιωμένοι: ${confirmedCount} | Μη Επιβεβαιωμένοι: ${unconfirmedCount}`, 20, 80);
};

/**
 * Add participants table
 */
const addParticipantsTable = (doc, participantDetails) => {
    if (participantDetails.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Δεν υπάρχουν συμμετέχοντες', 105, 100, { align: 'center' });
        return;
    }

    const hasNotes = participantDetails.some(p => p.notes && p.notes.trim() !== '');

    // Build table headers
    const headers = ['#', 'Όνομα', 'Επώνυμο', 'Τηλέφωνο', 'Κατάσταση'];
    if (hasNotes) headers.push('Σημειώσεις');

    // Build table data
    const tableData = participantDetails.map((p, idx) => {
        const row = [
            idx + 1,
            p.contact.firstName,
            p.contact.lastName,
            p.contact.phone || 'Μη διαθέσιμο',
            p.checked ? 'Επιβεβαιωμένος' : 'Μη Επιβεβαιωμένος'
        ];

        if (hasNotes) {
            row.push(p.notes || '-');
        }

        return row;
    });

    doc.autoTable({
        startY: 90,
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
            1: { cellWidth: hasNotes ? 25 : 35 },
            2: { cellWidth: hasNotes ? 25 : 35 },
            3: { halign: 'center', cellWidth: hasNotes ? 25 : 30 },
            4: { halign: 'center', cellWidth: hasNotes ? 30 : 35 },
            ...(hasNotes && { 5: { cellWidth: 45 } })
        },
        didParseCell: function(data) {
            // Color code confirmation status
            if (data.column.index === 4 && data.section === 'body') {
                const isConfirmed = data.cell.raw === 'Επιβεβαιωμένος';
                data.cell.styles.textColor = isConfirmed ? [81, 207, 102] : [245, 159, 0];
                data.cell.styles.fontStyle = 'bold';
            }
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