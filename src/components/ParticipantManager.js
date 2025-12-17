// src/components/ParticipantManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllContacts } from '../services/database';

const ParticipantManager = ({ tripName, participants, onSave, user, onLogout }) => {
  const [participantList, setParticipantList] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const contacts = await getAllContacts();
      const safeContacts = contacts || [];

      // Build participant map από το prop participants
      const participantMap = {};
      if (participants && Array.isArray(participants)) {
        participants.forEach(p => {
          const contactId = typeof p === 'string' ? p : p.contactId;
          const checked = typeof p === 'object' ? p.checked : true;
          const notes = typeof p === 'object' ? (p.notes || '') : '';

          if (contactId) {
            participantMap[contactId] = { checked, notes };
          }
        });
      }

      // Build full list με ΟΛΟΥΣ τους contacts
      const pList = safeContacts.map(contact => {
        const cId = contact._id || contact.id;
        const existingData = participantMap[cId];

        return {
          contactId: cId,
          contact: contact,
          checked: existingData?.checked || false,
          notes: existingData?.notes || '',
          isExisting: !!existingData
        };
      });

      setParticipantList(pList);
    } catch (error) {
      console.error("Σφάλμα κατά τη φόρτωση δεδομένων:", error);
    }
  }, [participants]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheckToggle = (contactId) => {
    setParticipantList(prev => prev.map(p =>
        p.contactId === contactId ? { ...p, checked: !p.checked } : p
    ));
  };

  const handleNotesChange = (contactId, notes) => {
    const limitedNotes = notes.substring(0, 500);
    setParticipantList(prev => prev.map(p =>
        p.contactId === contactId ? { ...p, notes: limitedNotes } : p
    ));
  };

  // Όταν πατηθεί το κουμπί Αποθήκευση, εμφάνισε το confirmation dialog
  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  // Αν ο χρήστης επιβεβαιώσει, επέστρεψε τα δεδομένα στο TripForm
  const handleConfirmSave = () => {
    // Format back to DB structure
    const updatedParticipants = participantList.map(p => ({
      contactId: p.contactId,
      checked: p.checked,
      notes: p.notes
    }));

    onSave(updatedParticipants); // Καλεί το callback που θα ενημερώσει το state στο TripForm
    setShowConfirmDialog(false);
  };

  // Αν ακυρώσει, κλείσε το dialog και συνέχισε την επεξεργασία
  const handleCancelSave = () => {
    setShowConfirmDialog(false);
  };

  const checkedCount = participantList.filter(p => p.checked).length;
  const totalCount = participantList.length;

  return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerCenter}>
            <h2 style={styles.title}>Διαχείριση Συμμετεχόντων</h2>
            <p style={styles.tripName}>{tripName}</p>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.username}>{user?.username}</span>
            <button onClick={onLogout} style={styles.logoutBtn}>
              Αποσύνδεση
            </button>
          </div>
        </div>

        <div style={styles.stats}>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{totalCount}</span>
            <span style={styles.statLabel}>Σύνολο Επαφών</span>
          </div>
          <div style={{ ...styles.statBox, backgroundColor: '#e7fcef' }}>
            <span style={{ ...styles.statNumber, color: '#51cf66' }}>✓ {checkedCount}</span>
            <span style={styles.statLabel}>Επιβεβαιωμένοι</span>
          </div>
          <div style={{ ...styles.statBox, backgroundColor: '#fff9db' }}>
            <span style={{ ...styles.statNumber, color: '#f59f00' }}>⏳ {totalCount - checkedCount}</span>
            <span style={styles.statLabel}>Εκκρεμούν</span>
          </div>
        </div>

        <div style={styles.saveButtonContainer}>
          <button onClick={handleSaveClick} style={styles.saveBtn}>
            💾 Αποθήκευση
          </button>
        </div>

        <div style={styles.participantList}>
          {participantList.map((participant, index) => (
              <div key={participant.contactId || index} style={styles.participantCard}>
                <div style={styles.participantHeader}>
                  <div style={styles.checkboxContainer}>
                    <input
                        type="checkbox"
                        checked={participant.checked}
                        onChange={() => handleCheckToggle(participant.contactId)}
                        style={styles.checkbox}
                        id={`check-${participant.contactId}`}
                    />
                    <label htmlFor={`check-${participant.contactId}`} style={styles.checkboxLabel}>
                      <span style={styles.participantNumber}>#{index + 1}</span>
                      <span style={styles.participantName}>
                    {participant.contact.firstName} {participant.contact.lastName}
                  </span>
                      {participant.contact.phone && (
                          <span style={styles.participantPhone}>📞 {participant.contact.phone}</span>
                      )}
                    </label>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    ...(participant.checked ? styles.presentBadge : styles.absentBadge)
                  }}>
                    {participant.checked ? '✓ Επιβεβαιωμένος' : '⏳ Μη Επιβεβαιωμένος'}
                  </div>
                </div>

                <div style={styles.notesContainer}>
                  <label style={styles.notesLabel}>
                    Σημειώσεις ({(participant.notes || '').length}/500)
                  </label>
                  <textarea
                      value={participant.notes || ''}
                      onChange={(e) => handleNotesChange(participant.contactId, e.target.value)}
                      placeholder="Σημειώσεις (π.χ. προκαταβολή, ειδικές ανάγκες...)"
                      style={styles.notesInput}
                      maxLength={500}
                  />
                </div>
              </div>
          ))}
        </div>

        {participantList.length === 0 && (
            <div style={styles.emptyState}>
              <p>Δεν βρέθηκαν επαφές στη βάση δεδομένων.</p>
            </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
            <div style={styles.modalOverlay} onClick={handleCancelSave}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.modalTitle}>Τελειώσατε με τους συμμετέχοντες;</h3>
                <p style={styles.modalMessage}>
                  Αν ναι, θα επιστρέψετε στη φόρμα της εκδρομής για την τελική αποθήκευση της εκδρομής.
                </p>
                <p style={styles.modalMessage}>
                  Αν όχι, συνεχίστε με τους συμμετέχοντες!
                </p>
                <div style={styles.modalActions}>
                  <button onClick={handleConfirmSave} style={styles.modalYesBtn}>
                    Ναι, επιστροφή στη φόρμα
                  </button>
                  <button onClick={handleCancelSave} style={styles.modalNoBtn}>
                    Όχι, συνέχεια επεξεργασίας
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f5f7fa' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px', flexWrap: 'wrap', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  headerCenter: { flex: 1, textAlign: 'center' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  username: { color: '#555', fontSize: '16px' },
  logoutBtn: { padding: '10px 20px', backgroundColor: '#e03131', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  title: { margin: '0 0 5px 0', color: '#667eea', fontSize: '24px' },
  tripName: { margin: 0, color: '#555', fontSize: '16px' },
  saveButtonContainer: { display: 'flex', justifyContent: 'center', marginBottom: '30px' },
  saveBtn: { padding: '14px 40px', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(81,207,102,0.3)' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' },
  statBox: { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '2px solid #e9ecef' },
  statNumber: { display: 'block', fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' },
  statLabel: { display: 'block', fontSize: '14px', color: '#777' },
  participantList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  participantCard: { backgroundColor: 'white', border: '2px solid #e9ecef', borderRadius: '12px', padding: '20px' },
  participantHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' },
  checkboxContainer: { display: 'flex', alignItems: 'center', gap: '15px', flex: 1 },
  checkbox: { width: '24px', height: '24px', cursor: 'pointer', accentColor: '#51cf66' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, flexWrap: 'wrap' },
  participantNumber: { backgroundColor: '#667eea', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' },
  participantName: { fontSize: '18px', fontWeight: '600', color: '#333' },
  participantPhone: { fontSize: '14px', color: '#777' },
  statusBadge: { padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' },
  presentBadge: { backgroundColor: '#e7fcef', color: '#51cf66' },
  absentBadge: { backgroundColor: '#fff9db', color: '#f59f00' },
  notesContainer: { marginTop: '10px' },
  notesLabel: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#555' },
  notesInput: { width: '100%', minHeight: '80px', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '18px', backgroundColor: 'white', borderRadius: '12px' },

  // Modal styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', borderRadius: '15px', padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { margin: '0 0 15px 0', fontSize: '22px', color: '#333', textAlign: 'center' },
  modalMessage: { margin: '10px 0', fontSize: '16px', color: '#555', textAlign: 'center', lineHeight: '1.5' },
  modalActions: { display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'center', flexWrap: 'wrap' },
  modalYesBtn: { padding: '12px 30px', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(81,207,102,0.3)' },
  modalNoBtn: { padding: '12px 30px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }
};

export default ParticipantManager;