# 📱 Πλήρης Οδηγός Εγκατάστασης - Trip Manager App

## 🔧 ΜΕΡΟΣ 1: Εγκατάσταση Dependencies (WSL Ubuntu)

### 1.1 Εγκατάσταση Node.js
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### 1.2 Εγκατάσταση Java JDK (για Android Studio)
```bash
sudo apt install -y openjdk-17-jdk

# Verify
java --version
```

---

## 🚀 ΜΕΡΟΣ 2: Δημιουργία Project

### 2.1 Δημιουργία React App
```bash
# Create project
npx create-react-app trip-manager
cd trip-manager

# Install dependencies
npm install pouchdb pouchdb-find react-router-dom
npm install jspdf jspdf-autotable papaparse
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 2.2 Αντιγραφή Αρχείων
Αντικαταστήστε τα παρακάτω αρχεία με τον κώδικα που σας έδωσα:

```
trip-manager/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── TripList.js
│   │   ├── TripForm.js
│   │   └── ContactsManager.js
│   ├── services/
│   │   └── database.js
│   ├── App.js
│   └── index.css
├── public/
│   └── index.html
├── package.json
└── capacitor.config.json
```

### 2.3 Αρχικοποίηση Capacitor
```bash
# Initialize Capacitor
npx cap init "Trip Manager" "com.tripmanager.app" --web-dir=build

# Add Android platform
npx cap add android
```

---

## 💻 ΜΕΡΟΣ 3: Testing Locally (Windows 11)

### 3.1 Start Development Server
```bash
# In WSL Ubuntu
cd trip-manager
npm start
```

Ανοίξτε browser στο: `http://localhost:3000`

### 3.2 Test Features
- ✅ Login με: `admin` / `admin123`
- ✅ Δημιουργία νέας εκδρομής
- ✅ Προσθήκη επαφών
- ✅ Import CSV
- ✅ Export PDF
- ✅ Αναζήτηση/Φιλτράρισμα

---

## 📱 ΜΕΡΟΣ 4: Build Android APK

### 4.1 Εγκατάσταση Android Studio

**ΣΤΑ WINDOWS (όχι WSL):**
1. Κατεβάστε Android Studio από: https://developer.android.com/studio
2. Εγκαταστήστε με default settings
3. Ανοίξτε Android Studio → SDK Manager
4. Εγκαταστήστε:
    - Android SDK Platform 33 (Android 13)
    - Android SDK Build-Tools
    - Android SDK Command-line Tools

### 4.2 Setup Environment Variables (Windows)

Προσθέστε στα System Environment Variables:

```
ANDROID_HOME=C:\Users\<YourUsername>\AppData\Local\Android\Sdk
```

Προσθέστε στο PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

### 4.3 Build React App
```bash
# In WSL Ubuntu
cd trip-manager
npm run build
```

### 4.4 Sync με Capacitor
```bash
npx cap sync android
```

### 4.5 Open σε Android Studio
```bash
npx cap open android
```

**Αυτό θα ανοίξει το Android Studio στα Windows!**

### 4.6 Build APK στο Android Studio

1. **Select Build Variant:**
    - Build → Select Build Variant → `release`

2. **Generate Signed APK:**
    - Build → Generate Signed Bundle / APK
    - Επιλέξτε: APK
    - Create new keystore (πρώτη φορά):
      ```
      Key store path: /path/to/your/keystore.jks
      Password: your-password
      Alias: trip-manager
      Validity: 25 years
      ```
    - Save keystore για μελλοντική χρήση!

3. **Build APK:**
    - Next → release → Finish
    - Περιμένετε το build (2-5 λεπτά)

4. **Locate APK:**
   ```
   trip-manager/android/app/release/app-release.apk
   ```

---

## 📲 ΜΕΡΟΣ 5: Εγκατάσταση σε Android Tablet

### 5.1 Μεταφορά APK

**Μέθοδος 1: USB**
```bash
# Enable USB Debugging στο tablet
# Settings → About Tablet → Tap Build Number 7 times
# Settings → Developer Options → Enable USB Debugging

# Connect tablet με USB
# In WSL/Windows terminal:
adb devices  # Verify connection
adb install app-release.apk
```

**Μέθοδος 2: File Transfer**
- Αντιγράψτε το `app-release.apk` σε USB stick ή SD card
- Εισάγετε στο tablet
- Ανοίξτε File Manager → Tap APK → Install
- Enable "Install from Unknown Sources" αν χρειαστεί

### 5.2 First Run
1. Ανοίξτε την εφαρμογή
2. Login: `admin` / `admin123`
3. Η εφαρμογή λειτουργεί **100% offline**!

---

## 🔄 ΜΕΡΟΣ 6: Updates & Maintenance

### 6.1 Κάνε Αλλαγές στον Κώδικα
```bash
# Edit source files
code src/components/Dashboard.js
```

### 6.2 Rebuild & Redeploy
```bash
npm run build
npx cap sync android
npx cap open android
# Build new APK in Android Studio
```

---

## 📊 ΜΕΡΟΣ 7: Sample CSV για Import

Δημιουργήστε ένα αρχείο `contacts.csv`:

```csv
firstName,lastName,phone
Γιάννης,Παπαδόπουλος,6912345678
Μαρία,Γεωργίου,6923456789
Νίκος,Αντωνίου,6934567890
```

Ή στα Αγγλικά headers:
```csv
Όνομα,Επώνυμο,Τηλέφωνο
Γιάννης,Παπαδόπουλος,6912345678
Μαρία,Γεωργίου,6923456789
```

---

## ⚙️ ΜΕΡΟΣ 8: Troubleshooting

### Πρόβλημα: Gradle Build Failed
```bash
# In android folder
cd trip-manager/android
./gradlew clean
./gradlew build
```

### Πρόβλημα: PouchDB δεν αποθηκεύει
- Ελέγξτε browser console για errors
- Clear browser cache
- Δοκιμάστε incognito mode

### Πρόβλημα: APK δεν εγκαθίσταται
- Enable "Unknown Sources" στο tablet
- Ελέγξτε αν υπάρχει παλιά έκδοση (uninstall first)
- Verify APK signature

### Πρόβλημα: App crashes on Android
```bash
# View Android logs
adb logcat | grep -i "TripManager"
```

---

## 🎯 ΜΕΡΟΣ 9: Production Checklist

✅ **Pre-Release:**
- [ ] Test όλα features locally
- [ ] Test σε διάφορα Android versions
- [ ] Test landscape orientation
- [ ] Verify offline functionality
- [ ] Test CSV import/export
- [ ] Check PDF generation

✅ **Security:**
- [ ] Άλλαξε default passwords στον κώδικα
- [ ] Enable ProGuard (minification)
- [ ] Store keystore safely

✅ **Performance:**
- [ ] Build με `--release` mode
- [ ] Optimize images
- [ ] Test με πολλά δεδομένα (100+ trips, 500+ contacts)

---

## 📞 Support & Resources

- **React Documentation:** https://react.dev
- **Capacitor Docs:** https://capacitorjs.com
- **PouchDB Docs:** https://pouchdb.com
- **Android Studio:** https://developer.android.com/studio

---

## 🎉 Ολοκλήρωση!

Τώρα έχετε μια **πλήρως λειτουργική offline Android εφαρμογή** για διαχείριση εκδρομών!

### Επόμενα Βήματα:
1. Test extensively
2. Customize για τις ανάγκες σας
3. Deploy σε tablet
4. Train users

**Καλή Επιτυχία! 🚀**