// src/components/TripForm.js
import React, { useState, useEffect } from 'react';
import { addTrip, updateTrip, getAllContacts } from '../services/database';
import ParticipantManager from './ParticipantManager';

const TripForm = ({ trip, onSave, onCancel, user, onLogout }) => {
  // --- Form State ---
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [locations, setLocations] = useState('');
  const [error, setError] = useState('');

  // --- Participants State (ΠΡΟΣΩΡΙΝΟ - δεν αποθηκεύεται στη βάση μέχρι το submit) ---
  const [participants, setParticipants] = useState([]);

  // --- View State ---
  const [showParticipantManager, setShowParticipantManager] = useState(false);

  // --- Contacts State ---
  const [allContacts, setAllContacts] = useState([]);

  // Load all contacts from DB on mount
  const loadContacts = async () => {
    try {
      const contacts = await getAllContacts();
      setAllContacts(contacts || []);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  };

  useEffect(() => {
    loadContacts();

    if (trip) {
      setName(trip.name || '');
      setDate(trip.date || '');
      setLocations(trip.locations ? trip.locations.join(', ') : '');
      setParticipants(trip.participants || []);
    }
  }, [trip]);

  // Get confirmed participants count
  const getConfirmedParticipants = () => {
    if (!participants) return [];

    return participants
        .filter(p => {
          if (typeof p === 'object') return p.checked === true;
          return true;
        })
        .map(p => typeof p === 'string' ? p : p.contactId);
  };

  const confirmedParticipants = getConfirmedParticipants();

  // Handle form submission (αποθήκευση στη βάση)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !date || !locations) {
      setError('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία');
      return;
    }

    const locationArray = locations.split(',').map(loc => loc.trim()).filter(Boolean);

    if (locationArray.length === 0) {
      setError('Προσθέστε τουλάχιστον μία τοποθεσία');
      return;
    }

    const tripData = {
      name,
      date,
      locations: locationArray,
      participants: participants, // Χρησιμοποιεί το state που ενημερώθηκε από τον ParticipantManager
      status: 'upcoming'
    };

    try {
      if (trip) {
        await updateTrip({ ...trip, ...tripData });
      } else {
        await addTrip(tripData);
      }
      onSave();
    } catch (err) {
      setError(err.message || 'Σφάλμα κατά την αποθήκευση');
    }
  };

  // Handle opening participant manager
  const handleOpenParticipantManager = () => {
    setShowParticipantManager(true);
  };

  // Handle saving from participant manager (ΔΕΝ αποθηκεύει στη βάση, μόνο ενημερώνει το state)
  const handleParticipantsSave = (updatedParticipants) => {
    setParticipants(updatedParticipants);
    setShowParticipantManager(false);
  };

  // Αν είμαστε στον ParticipantManager, εμφάνισέ τον
  if (showParticipantManager) {
    return (
        <ParticipantManager
            tripName={name || 'Νέα Εκδρομή'}
            participants={participants}
            onSave={handleParticipantsSave}
            user={user}
            onLogout={onLogout}
        />
    );
  }

  // Αλλιώς εμφάνισε το form
  return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            {trip ? 'Επεξεργασία Εκδρομής' : 'Νέα Εκδρομή'}
          </h1>
          <div style={styles.headerRight}>
            <span style={styles.username}>{user?.username || 'Χρήστης'}</span>
            <button onClick={onLogout} style={styles.logoutBtn}>
              Αποσύνδεση
            </button>
          </div>
        </header>

        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Βασικές Πληροφορίες</h2>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Όνομα Εκδρομής *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                    placeholder="π.χ. Εκδρομή στα Μετέωρα"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Ημερομηνία *</label>
                <div style={styles.dateInputWrapper}>
                  <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={styles.dateInput}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  />
                  <span style={styles.calendarIcon}>📅</span>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Τοποθεσίες * (χωρίστε με κόμμα)</label>
                <input
                    type="text"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    style={styles.input}
                    placeholder="π.χ. Καλαμπάκα, Μετέωρα, Τρίκαλα"
                />
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.participantsHeader}>
                <h2 style={styles.sectionTitle}>
                  Συμμετέχοντες ({confirmedParticipants.length})
                </h2>
                <button
                    type="button"
                    onClick={handleOpenParticipantManager}
                    style={styles.manageParticipantsBtn}
                >
                  {participants.length > 0 ? '✏️ Επεξεργασία Συμμετεχόντων' : '+ Προσθήκη Συμμετεχόντων'}
                </button>
              </div>

              {confirmedParticipants.length === 0 ? (
                  <p style={styles.noParticipants}>
                    Δεν υπάρχουν συμμετέχοντες. Πατήστε "Προσθήκη Συμμετεχόντων" για να προσθέσετε.
                  </p>
              ) : (
                  <div style={styles.participantsList}>
                    {confirmedParticipants.map((contactId, index) => {
                      const contact = allContacts.find(c => (c._id === contactId || c.id === contactId));
                      if (!contact) return null;

                      // Βρες τις σημειώσεις για αυτόν τον συμμετέχοντα
                      const participantObj = participants.find(p =>
                          (typeof p === 'object' ? p.contactId : p) === contactId
                      );
                      const notes = participantObj && typeof participantObj === 'object' ? participantObj.notes : '';

                      return (
                          <div key={contactId} style={styles.participantItem}>
                            <span style={styles.participantNumber}>{index + 1}.</span>
                            <div style={styles.participantInfo}>
                        <span style={styles.participantName}>
                          {contact.firstName} {contact.lastName}
                        </span>
                              {contact.phone && (
                                  <span style={styles.participantPhone}>
                            📞 {contact.phone}
                          </span>
                              )}
                              {notes && notes.trim() && (
                                  <span style={styles.participantNotes}>
                            📝 {notes}
                          </span>
                              )}
                            </div>
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.actions}>
              <button type="submit" style={styles.saveBtn}>
                {trip ? 'Ενημέρωση' : 'Δημιουργία'} Εκδρομής
              </button>
              <button type="button" onClick={onCancel} style={styles.cancelBtn}>
                Ακύρωση
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7fa', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, color: '#667eea', fontSize: '28px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  username: { color: '#555', fontSize: '16px' },
  logoutBtn: { padding: '10px 20px', backgroundColor: '#e03131', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  formContainer: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '1000px', margin: '0 auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '30px' },
  section: { borderBottom: '2px solid #f0f0f0', paddingBottom: '25px' },
  sectionTitle: { color: '#333', fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500', fontSize: '15px' },
  input: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' },
  dateInputWrapper: { position: 'relative', width: '100%' },
  dateInput: { width: '100%', padding: '12px', paddingRight: '40px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', cursor: 'pointer' },
  calendarIcon: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', pointerEvents: 'none' },
  noParticipants: { padding: '30px', textAlign: 'center', color: '#999', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '15px' },
  participantsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  manageParticipantsBtn: { padding: '12px 24px', backgroundColor: '#7950f2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', boxShadow: '0 4px 12px rgba(121,80,242,0.3)' },
  participantsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  participantItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' },
  participantNumber: { color: '#667eea', fontWeight: 'bold', fontSize: '16px', minWidth: '30px', marginTop: '2px' },
  participantInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  participantName: { fontWeight: '600', fontSize: '15px', color: '#333' },
  participantPhone: { fontSize: '13px', color: '#777' },
  participantNotes: { fontSize: '13px', color: '#555', fontStyle: 'italic', backgroundColor: '#fff3cd', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ffc107' },
  error: { backgroundColor: '#fee', color: '#c33', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' },
  actions: { display: 'flex', gap: '15px', justifyContent: 'center', paddingTop: '10px' },
  saveBtn: { padding: '14px 40px', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(81,207,102,0.3)' },
  cancelBtn: { padding: '14px 40px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }
};

export default TripForm;