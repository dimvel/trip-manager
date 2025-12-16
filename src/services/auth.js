// src/services/auth.js
// Optional separate authentication service
// NOTE: This functionality is already included in database.js
// Use this only if you want to separate concerns

import PouchDB from 'pouchdb';

const usersDB = new PouchDB('users');

/**
 * Initialize default users on first app launch
 * Creates admin and guest users if database is empty
 */
export const initializeDefaultUsers = async () => {
    try {
        const existingUsers = await usersDB.allDocs();

        if (existingUsers.total_rows === 0) {
            await usersDB.bulkDocs([
                {
                    _id: 'user_admin',
                    username: 'admin',
                    password: 'admin123', // TODO: Hash passwords in production!
                    role: 'admin',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: 'user_guest',
                    username: 'guest',
                    password: 'guest123', // TODO: Hash passwords in production!
                    role: 'user',
                    createdAt: new Date().toISOString()
                }
            ]);

            console.log('✓ Default users created successfully');
            return true;
        } else {
            console.log('✓ Users already exist');
            return false;
        }
    } catch (error) {
        console.error('Error initializing default users:', error);
        throw error;
    }
};

/**
 * Authenticate user with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export const authenticateUser = async (username, password) => {
    try {
        // Find user with matching credentials
        const result = await usersDB.find({
            selector: {
                username: username.trim(),
                password: password
            }
        });

        if (result.docs.length > 0) {
            const user = result.docs[0];
            console.log(`✓ User authenticated: ${user.username}`);
            return {
                _id: user._id,
                username: user.username,
                role: user.role
            };
        } else {
            console.log('✗ Authentication failed: Invalid credentials');
            return null;
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
};

/**
 * Get user by username
 * @param {string} username - Username to search for
 * @returns {Object|null} User object or null
 */
export const getUserByUsername = async (username) => {
    try {
        const result = await usersDB.find({
            selector: { username: username.trim() }
        });

        return result.docs.length > 0 ? result.docs[0] : null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @returns {boolean} Success status
 */
export const updatePassword = async (userId, newPassword) => {
    try {
        const user = await usersDB.get(userId);
        user.password = newPassword; // TODO: Hash in production!
        user.updatedAt = new Date().toISOString();

        await usersDB.put(user);
        console.log('✓ Password updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating password:', error);
        return false;
    }
};

/**
 * Create new user
 * @param {Object} userData - User data (username, password, role)
 * @returns {Object} Created user
 */
export const createUser = async (userData) => {
    try {
        // Check if username already exists
        const existing = await getUserByUsername(userData.username);
        if (existing) {
            throw new Error('Username already exists');
        }

        const newUser = {
            _id: `user_${Date.now()}`,
            username: userData.username.trim(),
            password: userData.password, // TODO: Hash in production!
            role: userData.role || 'user',
            createdAt: new Date().toISOString()
        };

        await usersDB.put(newUser);
        console.log('✓ User created successfully');

        return {
            _id: newUser._id,
            username: newUser.username,
            role: newUser.role
        };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Get all users (admin only)
 * @returns {Array} Array of users
 */
export const getAllUsers = async () => {
    try {
        const result = await usersDB.allDocs({ include_docs: true });
        return result.rows.map(row => ({
            _id: row.doc._id,
            username: row.doc.username,
            role: row.doc.role,
            createdAt: row.doc.createdAt
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

/**
 * Delete user
 * @param {string} userId - User ID to delete
 * @returns {boolean} Success status
 */
export const deleteUser = async (userId) => {
    try {
        // Prevent deleting default admin
        if (userId === 'user_admin') {
            throw new Error('Cannot delete default admin user');
        }

        const user = await usersDB.get(userId);
        await usersDB.remove(user);
        console.log('✓ User deleted successfully');
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
};

/**
 * Validate user credentials format
 * @param {string} username - Username to validate
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with errors array
 */
export const validateCredentials = (username, password) => {
    const errors = [];

    if (!username || username.trim().length === 0) {
        errors.push('Το όνομα χρήστη είναι υποχρεωτικό');
    } else if (username.trim().length < 3) {
        errors.push('Το όνομα χρήστη πρέπει να έχει τουλάχιστον 3 χαρακτήρες');
    }

    if (!password || password.length === 0) {
        errors.push('Ο κωδικός είναι υποχρεωτικός');
    } else if (password.length < 6) {
        errors.push('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Hash password (stub for future implementation)
 * TODO: Implement with bcrypt or similar
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export const hashPassword = async (password) => {
    // For production, use bcryptjs:
    // import bcrypt from 'bcryptjs';
    // return await bcrypt.hash(password, 10);

    console.warn('WARNING: Password hashing not implemented! Use bcrypt in production.');
    return password; // NOT SECURE - placeholder only
};

/**
 * Verify password against hash (stub for future implementation)
 * TODO: Implement with bcrypt or similar
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} Match result
 */
export const verifyPassword = async (password, hash) => {
    // For production, use bcryptjs:
    // import bcrypt from 'bcryptjs';
    // return await bcrypt.compare(password, hash);

    return password === hash; // NOT SECURE - placeholder only
};

// Export the database instance if needed elsewhere
export { usersDB };

const authService = {
    initializeDefaultUsers,
    authenticateUser,
    getUserByUsername,
    updatePassword,
    createUser,
    getAllUsers,
    deleteUser,
    validateCredentials,
    hashPassword,
    verifyPassword
};

export default authService;