# 🚀 Trip Manager - Offline Android App

Πλήρης εφαρμογή διαχείρισης εκδρομών για Android tablets/phones που λειτουργεί **100% offline**.

## 📋 Χαρακτηριστικά

### ✨ Core Features
- 🔐 **Σύστημα Login/Logout** με προκαθορισμένους χρήστες
- 📅 **Διαχείριση Εκδρομών:**
    - Δημιουργία, επεξεργασία, διαγραφή
    - Αυτόματη αρχειοθέτηση μετά την ημερομηνία
    - Επερχόμενες & Αρχειοθετημένες εκδρομές
- 👥 **Κεντρική Λίστα Επαφών:**
    - CRUD operations (Create, Read, Update, Delete)
    - Import από CSV/Excel
    - Επιλογή συμμετεχόντων ανά εκδρομή
- 🔍 **Αναζήτηση & Φιλτράρισμα:**
    - Αναζήτηση με κείμενο
    - Φιλτράρισμα με date range
- 📄 **Export PDF:**
    - Αναφορά ανά εκδρομή με συμμετέχοντες
- 🌐 **100% Offline λειτουργία**
- 📱 **Responsive Design** (Tablet 10" optimized)

### 🎨 UI/UX
- Ελληνική διεπαφή
- Σύγχρονο, καθαρό design
- Χρωματική παλέτα: Μπλε (#667eea), Πράσινο (#51cf66), Πορτοκαλί (#ff922b)
- Landscape orientation για tablets

---

## 🏗️ Αρχιτεκτονική

### Tech Stack
```
┌─────────────────────────────────────┐
│         React JS 18.x               │
│   (UI Components & State)           │
├─────────────────────────────────────┤
│       Capacitor 5.x                 │
│   (Native Android Bridge)           │
├─────────────────────────────────────┤
│         PouchDB 8.x                 │
│   (Offline NoSQL Database)          │
├─────────────────────────────────────┤
│    jsPDF + Papa Parse               │
│   (PDF Export + CSV Import)         │
└─────────────────────────────────────┘
```

### Δομή Database (PouchDB)

**usersDB:**
```javascript
{
  _id: 'user_admin',
  username: 'admin',
  password: 'admin123',  // TODO: Hash in production
  role: 'admin'
}
```

**contactsDB:**
```javascript
{
  _id: 'contact_1234567890',
  firstName: 'Γιάννης',
  lastName: 'Παπαδόπουλος',
  phone: '6912345678',
  createdAt: '2025-01-15T10:30:00.000Z'
}
```

**tripsDB:**
```javascript
{
  _id: 'trip_1234567890',
  name: 'Εκδρομή Μετέωρα',
  date: '2025-02-20',
  locations: ['Καλαμπάκα', 'Μετέωρα'],
  participants: ['contact_123', 'contact_456'],
  status: 'upcoming' | 'archived',
  createdAt: '2025-01-15T10:30:00.000Z'
}
```

### Component Hierarchy
```
App.js
├── Login.js
└── Dashboard.js
    ├── TripList.js
    │   └── PDF Export
    ├── TripForm.js
    │   └── Contact Selector
    └── ContactsManager.js
        └── CSV Import
```

---

## 🔄 Data Flow

### Authentication Flow
```
User Input → authenticateUser() → PouchDB Query → 
Set User State → Store in localStorage → Render Dashboard
```

### Trip Creation Flow
```
User Input → Validate → addTrip() → PouchDB.put() → 
Refresh UI → Navigate to Dashboard
```

### Auto-Archive Flow
```
App Mount → setInterval(1 hour) → autoArchiveTrips() →
Check all upcoming trips → If date < today-1 → 
Update status to 'archived' → PouchDB.put()
```

### CSV Import Flow
```
File Input → Papa Parse → Validate rows →
Filter valid contacts → bulkDocs() → PouchDB → 
Refresh UI → Show success message
```

---

## 📁 Project Structure

```
trip-manager/
├── android/                 # Capacitor Android project
│   └── app/
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml
│               └── res/
├── src/
│   ├── components/
│   │   ├── Login.js         # Authentication
│   │   ├── Dashboard.js     # Main dashboard
│   │   ├── TripList.js      # Display trips
│   │   ├── TripForm.js      # Create/Edit trips
│   │   └── ContactsManager.js  # Manage contacts
│   ├── services/
│   │   └── database.js      # PouchDB operations
│   ├── App.js               # Root component
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
├── public/
│   ├── index.html
│   └── manifest.json
├── capacitor.config.json    # Capacitor config
├── package.json             # Dependencies
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- WSL Ubuntu (για Windows)
- Android Studio (για APK build)

### Installation
```bash
# 1. Clone/Create project
npx create-react-app trip-manager
cd trip-manager

# 2. Install dependencies
npm install pouchdb pouchdb-find react-router-dom
npm install jspdf jspdf-autotable papaparse
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Copy source files (provided in artifacts)

# 4. Initialize Capacitor
npx cap init "Trip Manager" "com.tripmanager.app" --web-dir=build
npx cap add android

# 5. Run locally
npm start  # Opens http://localhost:3000
```

### Build APK
```bash
# 1. Build React app
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio:
#    - Select Build → Generate Signed Bundle/APK
#    - Choose APK → Create keystore → Build
```

---

## 🔐 Default Users

```
Username: admin
Password: admin123

Username: guest
Password: guest123
```

⚠️ **ΠΡΟΣΟΧΗ:** Σε production, αλλάξτε τους κωδικούς και προσθέστε hashing!

---

## 📊 Database Operations

### Key Functions

**Authentication:**
```javascript
authenticateUser(username, password)
```

**Contacts:**
```javascript
addContact(contact)
getAllContacts()
updateContact(contact)
deleteContact(contactId)
importContactsFromCSV(contacts)
```

**Trips:**
```javascript
addTrip(trip)
getAllTrips()
getUpcomingTrips()
getArchivedTrips()
updateTrip(trip)
deleteTrip(tripId)
searchTrips(searchTerm, startDate, endDate)
autoArchiveTrips()
```

---

## 🎯 Features Roadmap

### ✅ Implemented
- [x] Login/Logout system
- [x] CRUD operations για trips
- [x] CRUD operations για contacts
- [x] Auto-archive trips
- [x] Search & filter
- [x] CSV import
- [x] PDF export
- [x] Offline functionality
- [x] Responsive design

### 🔜 Future Enhancements
- [ ] Password hashing (bcrypt)
- [ ] User management (add/remove users)
- [ ] Trip categories/tags
- [ ] Statistics & analytics
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Backup/restore functionality
- [ ] Cloud sync option (optional)

---

## 🐛 Troubleshooting

### Common Issues

**1. PouchDB not persisting data**
```javascript
// Check browser support
if (!window.indexedDB) {
  console.error('IndexedDB not supported');
}
```

**2. Capacitor build fails**
```bash
cd android
./gradlew clean
./gradlew build
```

**3. APK won't install**
- Enable "Unknown Sources" on device
- Check Android version compatibility (min SDK 22)
- Verify APK signature

**4. CSV import fails**
- Ensure headers: firstName, lastName, phone
- OR Greek headers: Όνομα, Επώνυμο, Τηλέφωνο
- Check CSV encoding (UTF-8)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Development

### Run Development Server
```bash
npm start
```

### Build Production
```bash
npm run build
```

### Test on Android
```bash
npm run android
```

### View Logs
```bash
adb logcat | grep -i "TripManager"
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📞 Support

For issues or questions:
- Check documentation
- Review troubleshooting section
- Open GitHub issue

---

**Developed with ❤️ for offline trip management**