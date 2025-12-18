// src/components/ContactsManager.js
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
    getAllContacts,
    addContact,
    updateContact,
    deleteContact,
    importContactsFromCSV
} from '../services/database';

const ContactsManager = ({ onBack, user, onLogout }) => {
    const [contacts, setContacts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        const allContacts = await getAllContacts();
        setContacts(allContacts);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!firstName || !lastName) {
            setError('Το όνομα και επώνυμο είναι υποχρεωτικά');
            return;
        }

        const contactData = { firstName, lastName, phone };

        try {
            if (editingContact) {
                await updateContact({ ...editingContact, ...contactData });
            } else {
                await addContact(contactData);
            }
            resetForm();
            loadContacts();
        } catch (err) {
            setError('Σφάλμα κατά την αποθήκευση');
        }
    };

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setPhone('');
        setEditingContact(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFirstName(contact.firstName);
        setLastName(contact.lastName);
        setPhone(contact.phone || '');
        setShowForm(true);
    };

    const handleDelete = async (contactId) => {
        try {
            await deleteContact(contactId);
            setShowDeleteConfirm(null);
            loadContacts();
        } catch (err) {
            setError('Σφάλμα κατά τη διαγραφή');
        }
    };

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                // Καθαρισμός headers - αφαίρεση whitespace και normalization
                return header.trim();
            },
            complete: async (results) => {
                console.log('CSV Parse Results:', results);

                if (results.errors && results.errors.length > 0) {
                    console.error('CSV Parse Errors:', results.errors);
                }

                if (!results.data || results.data.length === 0) {
                    setError('Το αρχείο είναι κενό ή δεν μπορεί να διαβαστεί');
                    return;
                }

                // Δοκίμασε διάφορα πιθανά ονόματα columns
                const validContacts = results.data
                    .filter(row => {
                        // Έλεγξε αν υπάρχει τουλάχιστον ένα όνομα
                        const hasFirstName = row.firstName || row.firstname || row.FirstName ||
                            row['Όνομα'] || row['Ονομα'] || row['ΟΝΟΜΑ'] ||
                            row['First Name'] || row['first name'];
                        const hasLastName = row.lastName || row.lastname || row.LastName ||
                            row['Επώνυμο'] || row['Επωνυμο'] || row['ΕΠΩΝΥΜΟ'] ||
                            row['Last Name'] || row['last name'];
                        return hasFirstName && hasLastName;
                    })
                    .map(row => {
                        // Βρες το firstName από διάφορα πιθανά ονόματα
                        const fName = row.firstName || row.firstname || row.FirstName ||
                            row['Όνομα'] || row['Ονομα'] || row['ΟΝΟΜΑ'] ||
                            row['First Name'] || row['first name'];

                        // Βρες το lastName από διάφορα πιθανά ονόματα
                        const lName = row.lastName || row.lastname || row.LastName ||
                            row['Επώνυμο'] || row['Επωνυμο'] || row['ΕΠΩΝΥΜΟ'] ||
                            row['Last Name'] || row['last name'];

                        // Βρες το phone από διάφορα πιθανά ονόματα
                        const ph = row.phone || row.Phone || row.PHONE ||
                            row['Τηλέφωνο'] || row['Τηλεφωνο'] || row['ΤΗΛΕΦΩΝΟ'] ||
                            row['Phone Number'] || row['phone number'] || '';

                        return {
                            firstName: (fName || '').toString().trim(),
                            lastName: (lName || '').toString().trim(),
                            phone: (ph || '').toString().trim()
                        };
                    })
                    .filter(c => c.firstName && c.lastName); // Κράτησε μόνο αυτές με όνομα και επώνυμο

                console.log('Valid Contacts:', validContacts);

                if (validContacts.length === 0) {
                    setError('Δεν βρέθηκαν έγκυρες επαφές στο αρχείο. Βεβαιωθείτε ότι το CSV έχει στήλες firstName/Όνομα και lastName/Επώνυμο');
                    return;
                }

                try {
                    await importContactsFromCSV(validContacts);
                    loadContacts();
                    alert(`Εισήχθησαν επιτυχώς ${validContacts.length} επαφές!`);
                } catch (err) {
                    console.error('Import error:', err);
                    setError('Σφάλμα κατά την εισαγωγή: ' + err.message);
                }
            },
            error: (error) => {
                console.error('Papa Parse Error:', error);
                setError('Σφάλμα ανάγνωσης αρχείου: ' + error.message);
            }
        });
        e.target.value = '';
    };

    const filteredContacts = contacts.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.phone && contact.phone.includes(searchTerm))
    );

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Διαχείριση Επαφών</h1>
                <div style={styles.headerRight}>
                    <span style={styles.username}>{user.username}</span>
                    <button onClick={onLogout} style={styles.logoutBtn}>
                        Αποσύνδεση
                    </button>
                </div>
            </header>

            <div style={styles.actions}>
                <button onClick={onBack} style={styles.backBtn}>
                    ← Πίσω
                </button>
                <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
                    + Νέα Επαφή
                </button>
                <label style={styles.importBtn}>
                    📥 Εισαγωγή CSV/Excel
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileImport}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            {/* Οδηγίες για CSV */}
            <div style={styles.csvInfo}>
                <strong>💡 Οδηγίες CSV:</strong><br/>
                Το αρχείο CSV πρέπει να έχει στήλες με ονόματα:<br/>
                <code>Όνομα, Επώνυμο, Τηλέφωνο</code>
            </div>

            {showForm && (
                <div style={styles.formContainer}>
                    <h2 style={styles.formTitle}>
                        {editingContact ? 'Επεξεργασία Επαφής' : 'Νέα Επαφή'}
                    </h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formRow}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Όνομα *</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    style={styles.input}
                                    placeholder="Όνομα"
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Επώνυμο *</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    style={styles.input}
                                    placeholder="Επώνυμο"
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Τηλέφωνο</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={styles.input}
                                    placeholder="Τηλέφωνο"
                                />
                            </div>
                        </div>
                        {error && <div style={styles.error}>{error}</div>}
                        <div style={styles.formActions}>
                            <button type="submit" style={styles.saveBtn}>
                                Αποθήκευση
                            </button>
                            <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                                Ακύρωση
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Αναζήτηση επαφών..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                <div style={styles.contactCount}>
                    Σύνολο: {filteredContacts.length} επαφές
                </div>
            </div>

            <div style={styles.tableContainer}>
                {filteredContacts.length === 0 ? (
                    <div style={styles.emptyState}>
                        Δεν υπάρχουν επαφές
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>Όνομα</th>
                            <th style={styles.th}>Επώνυμο</th>
                            <th style={styles.th}>Τηλέφωνο</th>
                            <th style={styles.th}>Ενέργειες</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredContacts.map(contact => (
                            <tr key={contact._id} style={styles.tr}>
                                <td style={styles.td}>{contact.firstName}</td>
                                <td style={styles.td}>{contact.lastName}</td>
                                <td style={styles.td}>{contact.phone || '-'}</td>
                                <td style={styles.td}>
                                    {showDeleteConfirm === contact._id ? (
                                        <div style={styles.confirmInline}>
                                            <span style={{marginRight: '10px'}}>Σίγουρα;</span>
                                            <button
                                                onClick={() => handleDelete(contact._id)}
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
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(contact)}
                                                style={styles.editBtnSmall}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(contact._id)}
                                                style={styles.deleteBtnSmall}
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
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
    actions: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },
    backBtn: {
        padding: '12px 24px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500'
    },
    addBtn: {
        padding: '12px 24px',
        backgroundColor: '#51cf66',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500'
    },
    importBtn: {
        padding: '12px 24px',
        backgroundColor: '#339af0',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500',
        display: 'inline-block'
    },
    csvInfo: {
        backgroundColor: '#e7f5ff',
        border: '1px solid #339af0',
        borderRadius: '8px',
        padding: '12px 15px',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#1971c2'
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    formTitle: {
        margin: '0 0 20px 0',
        color: '#333',
        fontSize: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        marginBottom: '6px',
        color: '#555',
        fontWeight: '500',
        fontSize: '14px'
    },
    input: {
        padding: '10px',
        border: '2px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '15px'
    },
    error: {
        backgroundColor: '#fee',
        color: '#c33',
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center'
    },
    formActions: {
        display: 'flex',
        gap: '10px'
    },
    saveBtn: {
        padding: '12px 30px',
        backgroundColor: '#51cf66',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    cancelBtn: {
        padding: '12px 30px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    searchContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
    },
    searchInput: {
        flex: 1,
        minWidth: '250px',
        padding: '12px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '15px'
    },
    contactCount: {
        color: '#667eea',
        fontWeight: 'bold',
        fontSize: '16px'
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        textAlign: 'left',
        padding: '15px',
        borderBottom: '2px solid #e0e0e0',
        color: '#555',
        fontWeight: 'bold',
        fontSize: '15px'
    },
    tr: {
        borderBottom: '1px solid #f0f0f0'
    },
    td: {
        padding: '15px',
        color: '#333',
        fontSize: '15px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#999',
        fontSize: '18px'
    },
    editBtnSmall: {
        padding: '6px 12px',
        backgroundColor: '#4c6ef5',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '8px',
        fontSize: '14px'
    },
    deleteBtnSmall: {
        padding: '6px 12px',
        backgroundColor: '#e03131',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    confirmInline: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    confirmYes: {
        padding: '6px 16px',
        backgroundColor: '#e03131',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold'
    },
    confirmNo: {
        padding: '6px 16px',
        backgroundColor: '#51cf66',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold'
    }
};

export default ContactsManager;