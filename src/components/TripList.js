// src/components/TripList.js
import React, { useState } from 'react';
import { deleteTrip, searchTrips, getAllContacts } from '../services/database';
import { generateTripPDF } from '../services/pdfService';

const TripList = ({ trips, onRefresh, onEdit, type }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredTrips, setFilteredTrips] = useState(trips);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);

  React.useEffect(() => {
    setFilteredTrips(trips);
  }, [trips]);

  // Helper: Get participant counts
  const getParticipantCounts = (trip) => {
    if (!trip.participants || trip.participants.length === 0) {
      return { total: 0, confirmed: 0, unconfirmed: 0 };
    }

    // Count only checked participants
    const confirmed = trip.participants.filter(p =>
        typeof p === 'object' ? p.checked === true : true
    ).length;

    return { total: confirmed, confirmed, unconfirmed: 0 };
  };

  const handleSearch = async () => {
    const results = await searchTrips(searchTerm, startDate, endDate);
    const filtered = results.filter(trip => trip.status === type);
    setFilteredTrips(filtered);
  };

  const handleReset = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setFilteredTrips(trips);
  };

  const handleDelete = async (tripId) => {
    await deleteTrip(tripId);
    setShowDeleteConfirm(null);
    onRefresh();
  };

  const handleGeneratePDF = async (trip) => {
    try {
      const allContacts = await getAllContacts();
      const result = generateTripPDF(trip, allContacts);

      if (!result.success) {
        alert('Σφάλμα κατά τη δημιουργία του PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Σφάλμα κατά τη δημιουργία του PDF');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
      <div>
        <div style={styles.searchBar}>
          <input
              type="text"
              placeholder="Αναζήτηση ονόματος εκδρομής..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
          />
          <div style={styles.dateInputWrapper}>
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInputWithIcon}
                placeholder="Από ημερομηνία"
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
            />
            <span style={styles.calendarIcon}>📅</span>
          </div>
          <div style={styles.dateInputWrapper}>
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInputWithIcon}
                placeholder="Έως ημερομηνία"
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
            />
            <span style={styles.calendarIcon}>📅</span>
          </div>
          <button onClick={handleSearch} style={styles.searchBtn}>
            Αναζήτηση
          </button>
          <button onClick={handleReset} style={styles.resetBtn}>
            Επαναφορά
          </button>
        </div>

        {filteredTrips.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Δεν υπάρχουν εκδρομές</p>
            </div>
        ) : (
            <div style={styles.grid}>
              {filteredTrips.map(trip => {
                const counts = getParticipantCounts(trip);

                return (
                    <div key={trip._id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>{trip.name}</h3>
                        <div style={styles.badgeContainer}>
                          {counts.total > 0 && (
                              <div style={styles.badge}>
                                {counts.total} συμμετέχοντες
                              </div>
                          )}
                        </div>
                      </div>

                      <div style={styles.cardBody}>
                        <p style={styles.date}>
                          📅 {formatDate(trip.date)}
                        </p>
                        <p style={styles.locations}>
                          📍 {trip.locations.join(', ')}
                        </p>
                      </div>

                      <div style={styles.cardActions}>
                        {counts.total > 0 && (
                            <button
                                onClick={() => setShowDetailsModal(trip)}
                                style={styles.detailsBtn}
                                title="Δες λίστα συμμετεχόντων"
                            >
                              👥 Λίστα
                            </button>
                        )}

                        <button
                            onClick={() => handleGeneratePDF(trip)}
                            style={styles.pdfBtn}
                            title="Εξαγωγή σε PDF"
                        >
                          📄 PDF
                        </button>

                        {type === 'upcoming' && (
                            <button
                                onClick={() => onEdit(trip)}
                                style={styles.editBtn}
                            >
                              ✏️ Επεξεργασία
                            </button>
                        )}

                        <button
                            onClick={() => setShowDeleteConfirm(trip._id)}
                            style={styles.deleteBtn}
                        >
                          🗑️ Διαγραφή
                        </button>
                      </div>

                      {showDeleteConfirm === trip._id && (
                          <div style={styles.confirmDialog}>
                            <p>Σίγουρα θέλετε να διαγράψετε αυτή την εκδρομή;</p>
                            <div style={styles.confirmActions}>
                              <button
                                  onClick={() => handleDelete(trip._id)}
                                  style={styles.confirmYes}
                              >
                                Ναι
                              </button>
                              <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  style={styles.confirmNo}
                              >
                                Όχι
                              </button>
                            </div>
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
        )}

        {/* Modal: Trip Details */}
        {showDetailsModal && (
            <TripDetailsModal
                trip={showDetailsModal}
                onClose={() => setShowDetailsModal(null)}
            />
        )}
      </div>
  );
};

// Trip Details Modal Component
const TripDetailsModal = ({ trip, onClose }) => {
  const [allContacts, setAllContacts] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('confirmed');

  React.useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const contacts = await getAllContacts();
    setAllContacts(contacts);
  };

  const getParticipantDetails = () => {
    if (!trip.participants) return { confirmed: [], unconfirmed: [] };

    const confirmed = [];
    const unconfirmed = [];

    trip.participants.forEach(p => {
      const contactId = typeof p === 'string' ? p : p.contactId;
      const isChecked = typeof p === 'object' ? p.checked : true;
      const contact = allContacts.find(c => c._id === contactId);

      if (contact) {
        if (isChecked) {
          confirmed.push(contact);
        } else {
          unconfirmed.push(contact);
        }
      }
    });

    return { confirmed, unconfirmed };
  };

  const { confirmed, unconfirmed } = getParticipantDetails();

  return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>Λίστα Συμμετεχόντων</h2>
            <button onClick={onClose} style={styles.modalCloseBtn}>✕</button>
          </div>

          <div style={styles.modalTripInfo}>
            <h3>{trip.name}</h3>
            <p>📅 {new Date(trip.date).toLocaleDateString('el-GR')}</p>
          </div>

          <div style={styles.modalTabs}>
            <button
                onClick={() => setActiveTab('confirmed')}
                style={{
                  ...styles.modalTab,
                  ...(activeTab === 'confirmed' ? styles.modalTabActive : {})
                }}
            >
              ✅ Επιβεβαιωμένοι ({confirmed.length})
            </button>
            <button
                onClick={() => setActiveTab('unconfirmed')}
                style={{
                  ...styles.modalTab,
                  ...(activeTab === 'unconfirmed' ? styles.modalTabActive : {})
                }}
            >
              ⏳ Μη Επιβεβαιωμένοι ({unconfirmed.length})
            </button>
          </div>

          <div style={styles.modalBody}>
            {activeTab === 'confirmed' ? (
                confirmed.length === 0 ? (
                    <p style={styles.modalEmpty}>Δεν υπάρχουν επιβεβαιωμένοι συμμετέχοντες</p>
                ) : (
                    <div style={styles.modalList}>
                      {confirmed.map((contact, idx) => (
                          <div key={contact._id} style={styles.modalListItem}>
                            <span style={styles.modalListNumber}>{idx + 1}.</span>
                            <div style={styles.modalListInfo}>
                      <span style={styles.modalListName}>
                        {contact.firstName} {contact.lastName}
                      </span>
                              {contact.phone && (
                                  <span style={styles.modalListPhone}>📞 {contact.phone}</span>
                              )}
                            </div>
                            <span style={styles.modalListStatus}>✅</span>
                          </div>
                      ))}
                    </div>
                )
            ) : (
                unconfirmed.length === 0 ? (
                    <p style={styles.modalEmpty}>Όλοι έχουν επιβεβαιώσει</p>
                ) : (
                    <div style={styles.modalList}>
                      {unconfirmed.map((contact, idx) => (
                          <div key={contact._id} style={styles.modalListItem}>
                            <span style={styles.modalListNumber}>{idx + 1}.</span>
                            <div style={styles.modalListInfo}>
                      <span style={styles.modalListName}>
                        {contact.firstName} {contact.lastName}
                      </span>
                              {contact.phone && (
                                  <span style={styles.modalListPhone}>📞 {contact.phone}</span>
                              )}
                            </div>
                            <span style={styles.modalListStatus}>⏳</span>
                          </div>
                      ))}
                    </div>
                )
            )}
          </div>
        </div>
      </div>
  );
};

const styles = {
  searchBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },
  searchInput: {
    flex: '2',
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    minWidth: '200px'
  },
  dateInputWrapper: {
    position: 'relative',
    flex: '1',
    minWidth: '150px'
  },
  dateInputWithIcon: {
    width: '100%',
    padding: '10px',
    paddingRight: '35px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  calendarIcon: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    pointerEvents: 'none',
    color: '#667eea'
  },
  searchBtn: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  resetBtn: {
    padding: '10px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
    fontSize: '18px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px',
    gap: '10px'
  },
  cardTitle: {
    margin: 0,
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold',
    flex: 1
  },
  badgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    alignItems: 'flex-end'
  },
  badge: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  cardBody: {
    marginBottom: '15px'
  },
  date: {
    color: '#555',
    fontSize: '15px',
    marginBottom: '8px'
  },
  locations: {
    color: '#777',
    fontSize: '14px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  detailsBtn: {
    padding: '8px 16px',
    backgroundColor: '#7950f2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  pdfBtn: {
    padding: '8px 16px',
    backgroundColor: '#339af0',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  editBtn: {
    padding: '8px 16px',
    backgroundColor: '#4c6ef5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  deleteBtn: {
    padding: '8px 16px',
    backgroundColor: '#e03131',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
  confirmDialog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  confirmActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  confirmYes: {
    padding: '10px 24px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  confirmNo: {
    padding: '10px 24px',
    backgroundColor: '#51cf66',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '2px solid #e9ecef'
  },
  modalTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#333'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTripInfo: {
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef'
  },
  modalTabs: {
    display: 'flex',
    borderBottom: '2px solid #e9ecef'
  },
  modalTab: {
    flex: 1,
    padding: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s'
  },
  modalTabActive: {
    color: '#667eea',
    borderBottomColor: '#667eea'
  },
  modalBody: {
    flex: 1,
    overflow: 'auto',
    padding: '20px'
  },
  modalEmpty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 20px',
    fontSize: '16px'
  },
  modalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  modalListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  modalListNumber: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: '16px',
    minWidth: '30px'
  },
  modalListInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  modalListName: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#333'
  },
  modalListPhone: {
    fontSize: '13px',
    color: '#777'
  },
  modalListStatus: {
    fontSize: '20px'
  }
};

export default TripList;