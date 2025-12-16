// src/services/database.js
// Updated version with participant checklist and notes support

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

// Initialize databases
const tripsDB = new PouchDB('trips');
const contactsDB = new PouchDB('contacts');

// ============================================
// CONTACTS CRUD
// ============================================

export const addContact = async (contact) => {
    try {
        const doc = {
            _id: `contact_${Date.now()}`,
            ...contact,
            createdAt: new Date().toISOString()
        };
        return await contactsDB.put(doc);
    } catch (error) {
        console.error('Error adding contact:', error);
        throw error;
    }
};

export const getAllContacts = async () => {
    try {
        const result = await contactsDB.allDocs({ include_docs: true });
        return result.rows.map(row => row.doc);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }
};

export const updateContact = async (contact) => {
    try {
        return await contactsDB.put(contact);
    } catch (error) {
        console.error('Error updating contact:', error);
        throw error;
    }
};

export const deleteContact = async (contactId) => {
    try {
        const doc = await contactsDB.get(contactId);
        return await contactsDB.remove(doc);
    } catch (error) {
        console.error('Error deleting contact:', error);
        throw error;
    }
};

export const importContactsFromCSV = async (contacts) => {
    try {
        const docs = contacts.map(contact => ({
            _id: `contact_${Date.now()}_${Math.random()}`,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone,
            createdAt: new Date().toISOString()
        }));
        return await contactsDB.bulkDocs(docs);
    } catch (error) {
        console.error('Error importing contacts:', error);
        throw error;
    }
};

// ============================================
// TRIPS CRUD (with participant details)
// ============================================

export const addTrip = async (trip) => {
    try {
        // Convert participants to new format if needed
        const formattedParticipants = trip.participants.map(p => {
            if (typeof p === 'string') {
                // Old format: just contactId
                return { contactId: p, checked: true, notes: '' };
            }
            // New format: already has structure
            return p;
        });

        const doc = {
            _id: `trip_${Date.now()}`,
            name: trip.name,
            date: trip.date,
            locations: trip.locations,
            participants: formattedParticipants,
            status: 'upcoming',
            createdAt: new Date().toISOString()
        };
        return await tripsDB.put(doc);
    } catch (error) {
        console.error('Error adding trip:', error);
        throw error;
    }
};

export const getAllTrips = async () => {
    try {
        const result = await tripsDB.allDocs({ include_docs: true });
        return result.rows.map(row => migrateParticipantFormat(row.doc));
    } catch (error) {
        console.error('Error fetching trips:', error);
        return [];
    }
};

export const getUpcomingTrips = async () => {
    try {
        const result = await tripsDB.find({
            selector: { status: 'upcoming' }
        });
        return result.docs.map(doc => migrateParticipantFormat(doc));
    } catch (error) {
        console.error('Error fetching upcoming trips:', error);
        return [];
    }
};

export const getArchivedTrips = async () => {
    try {
        const result = await tripsDB.find({
            selector: { status: 'archived' }
        });
        return result.docs.map(doc => migrateParticipantFormat(doc));
    } catch (error) {
        console.error('Error fetching archived trips:', error);
        return [];
    }
};

export const updateTrip = async (trip) => {
    try {
        // Ensure participants are in correct format
        const formattedParticipants = trip.participants.map(p => {
            if (typeof p === 'string') {
                return { contactId: p, checked: true, notes: '' };
            }
            return {
                contactId: p.contactId,
                checked: p.checked !== undefined ? p.checked : true,
                notes: p.notes || ''
            };
        });

        const updatedTrip = {
            ...trip,
            participants: formattedParticipants
        };

        return await tripsDB.put(updatedTrip);
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
};

export const deleteTrip = async (tripId) => {
    try {
        const doc = await tripsDB.get(tripId);
        return await tripsDB.remove(doc);
    } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
    }
};

// Helper: Migrate old participant format to new format
const migrateParticipantFormat = (trip) => {
    if (!trip.participants || trip.participants.length === 0) {
        return trip;
    }

    // Check if already in new format
    if (typeof trip.participants[0] === 'object' && trip.participants[0].contactId) {
        return trip;
    }

    // Migrate from old format (array of strings) to new format
    trip.participants = trip.participants.map(p => ({
        contactId: p,
        checked: true,
        notes: ''
    }));

    return trip;
};

// ============================================
// PARTICIPANT MANAGEMENT
// ============================================

export const updateParticipantStatus = async (tripId, contactId, checked) => {
    try {
        const trip = await tripsDB.get(tripId);
        const participant = trip.participants.find(p => p.contactId === contactId);

        if (participant) {
            participant.checked = checked;
            await tripsDB.put(trip);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating participant status:', error);
        throw error;
    }
};

export const updateParticipantNotes = async (tripId, contactId, notes) => {
    try {
        const trip = await tripsDB.get(tripId);
        const participant = trip.participants.find(p => p.contactId === contactId);

        if (participant) {
            participant.notes = notes.substring(0, 500); // Limit to 500 chars
            await tripsDB.put(trip);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating participant notes:', error);
        throw error;
    }
};

// ============================================
// AUTO-ARCHIVE
// ============================================

export const autoArchiveTrips = async () => {
    try {
        const trips = await getUpcomingTrips();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneDayAgo = new Date(today);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        for (const trip of trips) {
            const tripDate = new Date(trip.date);
            tripDate.setHours(0, 0, 0, 0);

            if (tripDate < oneDayAgo) {
                trip.status = 'archived';
                await tripsDB.put(trip);
            }
        }
    } catch (error) {
        console.error('Error auto-archiving trips:', error);
    }
};

// ============================================
// SEARCH
// ============================================

export const searchTrips = async (searchTerm, startDate, endDate) => {
    try {
        const allTrips = await getAllTrips();
        return allTrips.filter(trip => {
            const matchesName = !searchTerm ||
                trip.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDateRange = (!startDate || new Date(trip.date) >= new Date(startDate)) &&
                (!endDate || new Date(trip.date) <= new Date(endDate));

            return matchesName && matchesDateRange;
        });
    } catch (error) {
        console.error('Error searching trips:', error);
        return [];
    }
};

export { tripsDB, contactsDB };