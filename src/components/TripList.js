// src/components/TripList.js
import React, { useState } from 'react';
import { deleteTrip, searchTrips, getAllContacts } from '../services/database';
import { generateTripPDF } from '../services/pdfService';

const TripList = ({ trips, onRefresh, onEdit, onManageParticipants, type }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredTrips, setFilteredTrips] = useState(trips);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    React.useEffect(() => {
        setFilteredTrips(trips);
    }, [trips]);

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
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.dateInput}
                    placeholder="Από ημερομηνία"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.dateInput}
                    placeholder="Έως ημερομηνία"
                />
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
                    {filteredTrips.map(trip => (
                        <div key={trip._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>{trip.name}</h3>
                                <div style={styles.badge}>
                                    {trip.participants?.length || 0} άτομα
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
                                <button
                                    onClick={() => handleGeneratePDF(trip)}
                                    style={styles.pdfBtn}
                                    title="Εξαγωγή σε PDF"
                                >
                                    📄 PDF
                                </button>

                                {type === 'upcoming' && (
                                    <>
                                        <button
                                            onClick={() => onManageParticipants(trip)}
                                            style={styles.manageBtn}
                                            title="Διαχείριση Παρουσιών & Σημειώσεων"
                                        >
                                            ✓ Συμμετέχοντες
                                        </button>
                                        <button
                                            onClick={() => onEdit(trip)}
                                            style={styles.editBtn}
                                        >
                                            ✏️ Επεξεργασία
                                        </button>
                                    </>
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
                    ))}
                </div>
            )}
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
    dateInput: {
        flex: '1',
        padding: '10px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        minWidth: '150px'
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
        marginBottom: '15px'
    },
    cardTitle: {
        margin: 0,
        color: '#333',
        fontSize: '20px',
        fontWeight: 'bold'
    },
    badge: {
        backgroundColor: '#51cf66',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold'
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
    manageBtn: {
        padding: '8px 16px',
        backgroundColor: '#51cf66',
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
    }
};

export default TripList;