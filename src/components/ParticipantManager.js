// src/components/ParticipantManager.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllContacts, updateTrip } from '../services/database';

const ParticipantManager = ({ trip, onBack, onUpdate }) => {
  const [participants, setParticipants] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const contacts = await getAllContacts();
      const safeContacts = contacts || [];

      // Build participant map from trip safely
      const participantMap = {};
      if (trip?.participants && Array.isArray(trip.participants)) {
        trip.participants.forEach(p => {
          const contactId = typeof p === 'string' ? p : p.contactId;
          const checked = typeof p === 'object' ? p.checked : true;
          const notes = typeof p === 'object' ? (p.notes || '') : '';

          if (contactId) {
            participantMap[contactId] = { checked, notes };
          }
        });
      }

      // Build full list with ALL contacts, matching by any available ID
      const participantList = safeContacts.map(contact => {
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

      setParticipants(participantList);
    } catch (error) {
      console.error("Σφάλμα κατά τη φόρτωση δεδομένων:", error);
    }
  }, [trip]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheckToggle = (contactId) => {
    setParticipants(prev => prev.map(p =>
        p.contactId === contactId ? { ...p, checked: !p.checked } : p
    ));
  };

  const handleNotesChange = (contactId, notes) => {
    const limitedNotes = notes.substring(0, 500);
    setParticipants(prev => prev.map(p =>
        p.contactId === contactId ? { ...p, notes: limitedNotes } : p
    ));
  };

  const handleSave = async () => {
    if (!trip) return;
    setSaving(true);

    try {
      // Format back to DB structure - keeping only essential info
      const updatedParticipants = participants.map(p => ({
        contactId: p.contactId,
        checked: p.checked,
        notes: p.notes
      }));

      const updatedTrip = {
        ...trip,
        participants: updatedParticipants
      };

      await updateTrip(updatedTrip);
      alert('Οι αλλαγές αποθηκεύτηκαν επιτυχώς!');
      onUpdate(); // Ενημέρωση του parent state
      onBack();   // Επιστροφή στην προηγούμενη οθόνη
    } catch (error) {
      console.error("Save error:", error);
      alert('Σφάλμα κατά την αποθήκευση');
    } finally {
      setSaving(false);
    }
  };

  const checkedCount = participants.filter(p => p.checked).length;
  const totalCount = participants.length;

  return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}>
            ← Πίσω
          </button>
          <div style={styles.headerCenter}>
            <h2 style={styles.title}>Διαχείριση Συμμετεχόντων</h2>
            <p style={styles.tripName}>{trip?.name || 'Φόρτωση...'}</p>
          </div>
          <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...styles.saveBtn, ...(saving ? styles.savingBtn : {}) }}
          >
            {saving ? 'Αποθήκευση...' : '💾 Αποθήκευση'}
          </button>
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

        <div style={styles.participantList}>
          {participants.map((participant, index) => (
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

        {participants.length === 0 && (
            <div style={styles.emptyState}>
              <p>Δεν βρέθηκαν επαφές στη βάση δεδομένων.</p>
            </div>
        )}
      </div>
  );
};

// Styles (διατηρούνται όπως τα είχες με μικρές βελτιώσεις στο spacing)
const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f5f7fa' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px', flexWrap: 'wrap', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  headerCenter: { flex: 1, textAlign: 'center' },
  backBtn: { padding: '12px 24px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
  title: { margin: '0 0 5px 0', color: '#667eea', fontSize: '24px' },
  tripName: { margin: 0, color: '#555', fontSize: '16px' },
  saveBtn: { padding: '12px 28px', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(81,207,102,0.3)' },
  savingBtn: { backgroundColor: '#95a5a6', cursor: 'not-allowed' },
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
  notesInput: { width: '100%', minHeight: '80px', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '18px', backgroundColor: 'white', borderRadius: '12px' }
};

export default ParticipantManager;