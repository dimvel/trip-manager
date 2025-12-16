// src/components/TripForm.js
import React, { useState, useEffect } from 'react';
import { addTrip, updateTrip, getAllContacts } from '../services/database';

const TripForm = ({ trip, onSave, onCancel, user, onLogout }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [locations, setLocations] = useState('');
    const [participants, setParticipants] = useState([]);
    const [allContacts, setAllContacts] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const contactsPerPage = 10;
    const maxContacts = 1000;

    useEffect(() => {
        loadContacts();
        if (trip) {
            setName(trip.name);
            setDate(trip.date);
            setLocations(trip.locations.join(', '));
            setParticipants(trip.participants || []);
        }
    }, [trip]);

    const loadContacts = async () => {
        const contacts = await getAllContacts();
        setAllContacts(contacts);
    };

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
            participants,
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
            setError('Σφάλμα κατά την αποθήκευση');
        }
    };

    const toggleParticipant = (contactId) => {
        if (participants.includes(contactId)) {
            setParticipants(participants.filter(id => id !== contactId));
        } else {
            setParticipants([...participants, contactId]);
        }
    };

    // Pagination logic
    const displayedContacts = allContacts.slice(0, maxContacts);

    const totalPages = Math.ceil(displayedContacts.length / contactsPerPage);

    const paginatedContacts = displayedContacts.slice(
        (currentPage - 1) * contactsPerPage,
        currentPage * contactsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate page numbers to display (show max 10 page buttons)
    const getPageNumbers = () => {
        const maxPageButtons = 10;
        if (totalPages <= maxPageButtons) {
            return [...Array(totalPages)].map((_, i) => i + 1);
        }

        const halfButtons = Math.floor(maxPageButtons / 2);
        let startPage = Math.max(1, currentPage - halfButtons);
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage < maxPageButtons - 1) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        return [...Array(endPage - startPage + 1)].map((_, i) => startPage + i);
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>
                    {trip ? 'Επεξεργασία Εκδρομής' : 'Νέα Εκδρομή'}
                </h1>
                <div style={styles.headerRight}>
                    <span style={styles.username}>{user.username}</span>
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
                        <h2 style={styles.sectionTitle}>
                            Συμμετέχοντες ({participants.length} επιλεγμένοι)
                        </h2>

                        {allContacts.length === 0 ? (
                            <p style={styles.noContacts}>
                                Δεν υπάρχουν διαθέσιμες επαφές. Προσθέστε επαφές πρώτα από τη Διαχείριση Επαφών.
                            </p>
                        ) : (
                            <>
                                {allContacts.length > maxContacts && (
                                    <div style={styles.limitWarning}>
                                        ⚠️ Εμφανίζονται οι πρώτες {maxContacts} επαφές από {allContacts.length} συνολικά
                                    </div>
                                )}

                                <div style={styles.contactsGrid}>
                                    {paginatedContacts.map(contact => (
                                        <div
                                            key={contact._id}
                                            onClick={() => toggleParticipant(contact._id)}
                                            style={{
                                                ...styles.contactCard,
                                                ...(participants.includes(contact._id) ? styles.selectedContact : {})
                                            }}
                                        >
                                            <div style={styles.checkbox}>
                                                {participants.includes(contact._id) ? '✓' : ''}
                                            </div>
                                            <div>
                                                <div style={styles.contactName}>
                                                    {contact.firstName} {contact.lastName}
                                                </div>
                                                {contact.phone && (
                                                    <div style={styles.contactPhone}>{contact.phone}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div style={styles.pagination}>
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            style={{
                                                ...styles.pageBtn,
                                                ...(currentPage === 1 ? styles.pageBtnDisabled : {})
                                            }}
                                        >
                                            ⏮️ Πρώτη
                                        </button>

                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={{
                                                ...styles.pageBtn,
                                                ...(currentPage === 1 ? styles.pageBtnDisabled : {})
                                            }}
                                        >
                                            ← Προηγούμενη
                                        </button>

                                        <div style={styles.pageNumbers}>
                                            {getPageNumbers().map(pageNum => (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    style={{
                                                        ...styles.pageNumber,
                                                        ...(currentPage === pageNum ? styles.pageNumberActive : {})
                                                    }}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                ...styles.pageBtn,
                                                ...(currentPage === totalPages ? styles.pageBtnDisabled : {})
                                            }}
                                        >
                                            Επόμενη →
                                        </button>

                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                ...styles.pageBtn,
                                                ...(currentPage === totalPages ? styles.pageBtnDisabled : {})
                                            }}
                                        >
                                            Τελευταία ⏭️
                                        </button>
                                    </div>
                                )}

                                <div style={styles.pageInfo}>
                                    Σελίδα {currentPage} από {totalPages} •
                                    Εμφάνιση {((currentPage - 1) * contactsPerPage) + 1}-{Math.min(currentPage * contactsPerPage, displayedContacts.length)} από {displayedContacts.length} επαφές
                                    {participants.length > 0 && ` • ${participants.length} επιλεγμένοι`}
                                </div>
                            </>
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
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        padding: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '20px 30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
    },
    title: {
        margin: 0,
        color: '#667eea',
        fontSize: '28px'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    username: {
        color: '#555',
        fontSize: '16px'
    },
    logoutBtn: {
        padding: '10px 20px',
        backgroundColor: '#e03131',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '1000px',
        margin: '0 auto'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
    },
    section: {
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '25px'
    },
    sectionTitle: {
        color: '#333',
        fontSize: '20px',
        marginBottom: '20px',
        fontWeight: 'bold'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#555',
        fontWeight: '500',
        fontSize: '15px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '15px',
        boxSizing: 'border-box'
    },
    dateInputWrapper: {
        position: 'relative',
        width: '100%'
    },
    dateInput: {
        width: '100%',
        padding: '12px',
        paddingRight: '40px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '15px',
        boxSizing: 'border-box',
        cursor: 'pointer'
    },
    calendarIcon: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '20px',
        pointerEvents: 'none'
    },
    noContacts: {
        padding: '30px',
        textAlign: 'center',
        color: '#999',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    contactsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
    },
    contactCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '15px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: 'white'
    },
    selectedContact: {
        borderColor: '#51cf66',
        backgroundColor: '#e7fcef'
    },
    checkbox: {
        width: '24px',
        height: '24px',
        border: '2px solid #51cf66',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#51cf66',
        fontWeight: 'bold',
        fontSize: '16px',
        flexShrink: 0
    },
    contactName: {
        fontWeight: '600',
        color: '#333',
        fontSize: '15px'
    },
    contactPhone: {
        fontSize: '13px',
        color: '#777',
        marginTop: '4px'
    },
    error: {
        backgroundColor: '#fee',
        color: '#c33',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: '500'
    },
    actions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        paddingTop: '10px'
    },
    saveBtn: {
        padding: '14px 40px',
        backgroundColor: '#51cf66',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(81,207,102,0.3)'
    },
    cancelBtn: {
        padding: '14px 40px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'
    },
    limitWarning: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontSize: '14px',
        textAlign: 'center'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '15px',
        gap: '10px',
        flexWrap: 'wrap'
    },
    pageBtn: {
        padding: '10px 20px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    pageBtnDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed'
    },
    pageNumbers: {
        display: 'flex',
        gap: '5px',
        flexWrap: 'wrap'
    },
    pageNumber: {
        padding: '8px 12px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    pageNumberActive: {
        backgroundColor: '#667eea',
        color: 'white'
    },
    pageInfo: {
        textAlign: 'center',
        color: '#777',
        fontSize: '14px',
        marginTop: '10px'
    }
};

export default TripForm;