# 🚀 Quick Reference Guide - Trip Manager

## 📋 Command Cheat Sheet

### Initial Setup
```bash
# Create project
npx create-react-app trip-manager && cd trip-manager

# Install dependencies
npm install pouchdb pouchdb-find react-router-dom jspdf jspdf-autotable papaparse @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init "Trip Manager" "com.tripmanager.app" --web-dir=build
npx cap add android
```

### Development
```bash
npm start              # Start dev server (http://localhost:3000)
npm run build          # Build for production
npm test               # Run tests
```

### Capacitor Commands
```bash
npx cap sync           # Sync web assets to native projects
npx cap sync android   # Sync to Android only
npx cap copy android   # Copy web assets without sync
npx cap open android   # Open in Android Studio
npx cap update         # Update Capacitor dependencies
```

### Android Debug
```bash
adb devices                          # List connected devices
adb install app-release.apk         # Install APK
adb uninstall com.tripmanager.app   # Uninstall app
adb logcat                          # View logs
adb logcat | grep -i "TripManager"  # Filtered logs
```

---

## 🔑 Default Credentials

```
Admin User:
  Username: admin
  Password: admin123

Guest User:
  Username: guest
  Password: guest123
```

---

## 📁 Project Structure

```
trip-manager/
├── src/
│   ├── components/
│   │   ├── Login.js              # Authentication UI
│   │   ├── Dashboard.js          # Main dashboard
│   │   ├── TripList.js           # Display & manage trips
│   │   ├── TripForm.js           # Create/edit trip form
│   │   └── ContactsManager.js    # Contact management
│   ├── services/
│   │   └── database.js           # PouchDB operations
│   ├── App.js                    # Root component
│   ├── index.js                  # Entry point
│   └── index.css                 # Global styles
├── android/                      # Native Android project
├── public/
├── build/                        # Production build output
├── capacitor.config.json         # Capacitor configuration
└── package.json                  # Dependencies
```

---

## 🎨 Color Palette

```css
Primary Blue:   #667eea
Success Green:  #51cf66
Warning Orange: #ff922b
Danger Red:     #ff6b6b
Gray:           #95a5a6
Background:     #f5f7fa
Text Dark:      #333
Text Light:     #777
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: 'user_admin',
  username: string,
  password: string,
  role: 'admin' | 'user'
}
```

### Contacts Collection
```javascript
{
  _id: 'contact_[timestamp]',
  firstName: string,
  lastName: string,
  phone: string (optional),
  createdAt: ISO date string
}
```

### Trips Collection
```javascript
{
  _id: 'trip_[timestamp]',
  name: string,
  date: YYYY-MM-DD,
  locations: string[],
  participants: contactId[],
  status: 'upcoming' | 'archived',
  createdAt: ISO date string
}
```

---

## 🔧 Key Functions Reference

### Database Operations

```javascript
// Auth
authenticateUser(username, password) → user | null

// Contacts
addContact(contact) → Promise
getAllContacts() → Promise<Contact[]>
updateContact(contact) → Promise
deleteContact(contactId) → Promise
importContactsFromCSV(contacts) → Promise

// Trips
addTrip(trip) → Promise
getAllTrips() → Promise<Trip[]>
getUpcomingTrips() → Promise<Trip[]>
getArchivedTrips() → Promise<Trip[]>
updateTrip(trip) → Promise
deleteTrip(tripId) → Promise
searchTrips(searchTerm, startDate, endDate) → Promise<Trip[]>
autoArchiveTrips() → Promise
```

---

## 📄 CSV Import Format

### Option 1: English Headers
```csv
firstName,lastName,phone
John,Doe,1234567890
Jane,Smith,9876543210
```

### Option 2: Greek Headers
```csv
Όνομα,Επώνυμο,Τηλέφωνο
Γιάννης,Παπαδόπουλος,6912345678
Μαρία,Γεωργίου,6923456789
```

**Rules:**
- UTF-8 encoding
- Phone is optional
- No empty rows
- Headers must match exactly

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | `rm -rf node_modules && npm install` |
| Capacitor sync error | `npx cap sync android` |
| Gradle error | `cd android && ./gradlew clean` |
| APK won't install | Enable "Unknown Sources" |
| Data lost | Uninstall removes data (no cloud backup) |
| CSV import fails | Check encoding (UTF-8) and headers |
| PDF not downloading | Check storage permissions |
| App slow | Clear old archived trips |

---

## 📱 Android Build Quick Steps

1. **Build React:**
   ```bash
   npm run build
   ```

2. **Sync Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Open Android Studio:**
   ```bash
   npx cap open android
   ```

4. **In Android Studio:**
    - Wait for Gradle sync
    - Build → Select Build Variant → **release**
    - Build → Generate Signed Bundle/APK
    - Select APK → Create/Select keystore
    - Build → Finish

5. **Find APK:**
   ```
   android/app/release/app-release.apk
   ```

6. **Install:**
   ```bash
   adb install android/app/release/app-release.apk
   ```

---

## ⚙️ Configuration Files

### capacitor.config.json
```json
{
  "appId": "com.tripmanager.app",
  "appName": "Trip Manager",
  "webDir": "build",
  "bundledWebRuntime": false
}
```

### package.json (key scripts)
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "cap:sync": "npx cap sync",
    "cap:open": "npx cap open android",
    "android": "npm run build && npx cap sync && npx cap open android"
  }
}
```

---

## 🎯 Feature Checklist

### Core Features
- [x] Login/Logout
- [x] Create/Edit/Delete Trips
- [x] Create/Edit/Delete Contacts
- [x] Auto-archive trips
- [x] Search & filter
- [x] CSV import
- [x] PDF export
- [x] Offline functionality
- [x] Greek language UI

### UI Features
- [x] Responsive design
- [x] Tablet optimized (10")
- [x] Landscape orientation
- [x] Touch-friendly buttons
- [x] Confirmation dialogs
- [x] Error messages
- [x] Loading states

---

## 📊 Performance Benchmarks

| Metric | Target | Tested |
|--------|--------|--------|
| App startup | < 2s | ✓ |
| Login | < 500ms | ✓ |
| Dashboard load | < 1s | ✓ |
| Search results | < 500ms | ✓ |
| PDF generation | < 2s | ✓ |
| Max contacts | 1000+ | ✓ |
| Max trips | 500+ | ✓ |

---

## 🔐 Security Notes

⚠️ **IMPORTANT for Production:**

1. **Hash passwords:**
   ```bash
   npm install bcryptjs
   ```
   ```javascript
   import bcrypt from 'bcryptjs';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Change default passwords** in `database.js`

3. **Secure keystore:**
    - Store in safe location
    - Backup securely
    - Never commit to git

4. **Enable ProGuard** (code obfuscation):
   In `android/app/build.gradle`:
   ```gradle
   buildTypes {
     release {
       minifyEnabled true
       proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
     }
   }
   ```

---

## 📚 Documentation Links

- **React:** https://react.dev
- **Capacitor:** https://capacitorjs.com
- **PouchDB:** https://pouchdb.com
- **jsPDF:** https://github.com/parallax/jsPDF
- **Papa Parse:** https://www.papaparse.com
- **Android Studio:** https://developer.android.com/studio

---

## 🎓 Quick Troubleshooting Decision Tree

```
Problem → Check this → Then this
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build fails
  → Check Node version (18+)
  → npm install
  → Clear node_modules

Capacitor sync fails
  → Check Capacitor installed
  → npx cap sync android
  → Check capacitor.config.json

APK won't install
  → Check Android version (5.1+)
  → Enable Unknown Sources
  → Check signature

App crashes
  → Check adb logcat
  → Clear app cache
  → Reinstall app

Data lost
  → Check if app was uninstalled
  → No cloud backup (expected)
  → Restore from CSV/PDF exports

CSV import fails
  → Check file encoding (UTF-8)
  → Verify headers
  → Check for empty rows

PDF not downloading
  → Check storage permission
  → Check available space
  → Try different trip

App slow
  → Too much data (500+ trips?)
  → Clear archived trips
  → Restart app
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All features tested
- [ ] No console errors
- [ ] Default passwords changed
- [ ] Build variant set to **release**
- [ ] Keystore created & backed up
- [ ] APK signed
- [ ] Version number updated

### Post-Deployment
- [ ] APK installed successfully
- [ ] App opens without crash
- [ ] Login works
- [ ] Core features work
- [ ] Offline functionality verified
- [ ] User training completed
- [ ] Documentation provided

---

## 💡 Pro Tips

1. **Regular Exports:** Export data weekly (CSV + PDF)
2. **Cleanup:** Delete old archived trips monthly
3. **Testing:** Test on target device before deployment
4. **Backups:** Keep multiple copies of keystore
5. **Monitoring:** Check app regularly for crashes
6. **Updates:** Test updates thoroughly before deploying
7. **Documentation:** Keep this guide handy

---

## 📞 Quick Support

**Before asking for help, check:**
1. This quick reference
2. FAQ.md
3. README.md
4. TESTING_CHECKLIST.md
5. Console logs (`adb logcat`)

**Still stuck?** Gather:
- Android version
- App version
- Error message (screenshot)
- Steps to reproduce
- Device model

---

**Last Updated:** December 2024
**Version:** 1.0.0

---

🎉 **You're all set! Happy Trip Managing!** 🚀