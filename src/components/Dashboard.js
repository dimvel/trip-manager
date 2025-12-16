// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import TripList from './TripList';
import TripForm from './TripForm';
import ContactsManager from './ContactsManager';
import { getUpcomingTrips, getArchivedTrips, autoArchiveTrips } from '../services/database';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showTripForm, setShowTripForm] = useState(false);
    const [showContacts, setShowContacts] = useState(false);
    const [upcomingTrips, setUpcomingTrips] = useState([]);
    const [archivedTrips, setArchivedTrips] = useState([]);
    const [editingTrip, setEditingTrip] = useState(null);

    useEffect(() => {
        loadTrips();
        // Auto-archive check on mount and every hour
        autoArchiveTrips().then(loadTrips);
        const interval = setInterval(() => {
            autoArchiveTrips().then(loadTrips);
        }, 3600000); // 1 hour

        return () => clearInterval(interval);
    }, []);

    const loadTrips = async () => {
        const upcoming = await getUpcomingTrips();
        const archived = await getArchivedTrips();
        setUpcomingTrips(upcoming);
        setArchivedTrips(archived);
    };

    const handleTripSaved = () => {
        setShowTripForm(false);
        setEditingTrip(null);
        loadTrips();
    };

    const handleEditTrip = (trip) => {
        setEditingTrip(trip);
        setShowTripForm(true);
    };

    const handleNewTrip = () => {
        setEditingTrip(null);
        setShowTripForm(true);
    };

    if (showContacts) {
        return (
            <ContactsManager
                onBack={() => setShowContacts(false)}
                user={user}
                onLogout={onLogout}
            />
        );
    }

    if (showTripForm) {
        return (
            <TripForm
                trip={editingTrip}
                onSave={handleTripSaved}
                onCancel={() => {
                    setShowTripForm(false);
                    setEditingTrip(null);
                }}
                user={user}
                onLogout={onLogout}
            />
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Διαχείριση Εκδρομών</h1>
                <div style={styles.headerRight}>
                    <span style={styles.username}>Καλώς ήρθες, {user.username}</span>
                    <button onClick={onLogout} style={styles.logoutBtn}>
                        Αποσύνδεση
                    </button>
                </div>
            </header>

            <div style={styles.actions}>
                <button onClick={handleNewTrip} style={styles.primaryBtn}>
                    + Νέα Εκδρομή
                </button>
                <button onClick={() => setShowContacts(true)} style={styles.secondaryBtn}>
                    Διαχείριση Επαφών
                </button>
            </div>

            <div style={styles.tabs}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'upcoming' ? styles.activeTab : {})
                    }}
                >
                    Επερχόμενες Εκδρομές ({upcomingTrips.length})
                </button>
                <button
                    onClick={() => setActiveTab('archived')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'archived' ? styles.activeTab : {})
                    }}
                >
                    Αρχείο Εκδρομών ({archivedTrips.length})
                </button>
            </div>

            <div style={styles.content}>
                {activeTab === 'upcoming' ? (
                    <TripList
                        trips={upcomingTrips}
                        onRefresh={loadTrips}
                        onEdit={handleEditTrip}
                        type="upcoming"
                    />
                ) : (
                    <TripList
                        trips={archivedTrips}
                        onRefresh={loadTrips}
                        onEdit={handleEditTrip}
                        type="archived"
                    />
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
        backgroundColor: '#ff6b6b',
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
    primaryBtn: {
        padding: '14px 28px',
        backgroundColor: '#51cf66',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(81,207,102,0.3)'
    },
    secondaryBtn: {
        padding: '14px 28px',
        backgroundColor: '#ff922b',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(255,146,43,0.3)'
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
    },
    tab: {
        padding: '12px 24px',
        backgroundColor: 'white',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        color: '#555',
        transition: 'all 0.3s'
    },
    activeTab: {
        backgroundColor: '#667eea',
        color: 'white',
        borderColor: '#667eea'
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minHeight: '400px'
    }
};

export default Dashboard;