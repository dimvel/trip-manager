// src/App.js
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { initializeDefaultUsers } from './services/auth';

function App() {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initializeDefaultUsers();

      // Check for stored session
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setIsInitialized(true);
    };

    initialize();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!isInitialized) {
    return (
        <div style={styles.loading}>
          <h2>Φόρτωση...</h2>
        </div>
    );
  }

  return (
      <div className="App">
        {user ? (
            <Dashboard user={user} onLogout={handleLogout} />
        ) : (
            <Login onLogin={handleLogin} />
        )}
      </div>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f7fa',
    color: '#667eea'
  }
};

export default App;