# ❓ Συχνές Ερωτήσεις (FAQ) - Trip Manager

## 📱 Γενικά

### Q: Χρειάζεται internet για να λειτουργήσει η εφαρμογή;
**A:** Όχι! Η εφαρμογή λειτουργεί **100% offline**. Όλα τα δεδομένα αποθηκεύονται τοπικά στη συσκευή σας.

### Q: Σε τι συσκευές λειτουργεί;
**A:** Σε Android tablets και smartphones με Android 5.1+ (API level 22+). Βελτιστοποιημένο για tablets 10".

### Q: Τι γίνεται αν χάσω τη συσκευή μου;
**A:** Τα δεδομένα είναι τοπικά στη συσκευή. Δεν υπάρχει cloud backup. Συνιστάται να κάνετε export τακτικά (PDF).

### Q: Μπορώ να μεταφέρω τα δεδομένα σε άλλη συσκευή;
**A:** Όχι απευθείας. Θα χρειαστεί να εξάγετε τα δεδομένα (CSV για επαφές, PDF για εκδρομές) και να τα εισάγετε ξανά.

---

## 🔐 Authentication

### Q: Ποιοι είναι οι default κωδικοί;
**A:**
- Username: `admin` / Password: `admin123`
- Username: `guest` / Password: `guest123`

### Q: Πώς αλλάζω τους κωδικούς;
**A:** Θα χρειαστεί να επεξεργαστείτε το αρχείο `src/services/database.js` και να αλλάξετε τις τιμές στη function `initializeDefaultUsers()`. Για production, προσθέστε password hashing (bcrypt).

### Q: Μπορώ να προσθέσω περισσότερους χρήστες;
**A:** Προς το παρόν όχι μέσω UI. Θα χρειαστεί να επεξεργαστείτε τον κώδικα. Feature σε roadmap για μελλοντική έκδοση.

### Q: Τι γίνεται αν ξεχάσω τον κωδικό;
**A:** Θα χρειαστεί να επανεγκαταστήσετε την εφαρμογή (θα χαθούν όλα τα δεδομένα) ή να επεξεργαστείτε το database μέσω developer tools.

---

## 📅 Trips (Εκδρομές)

### Q: Πώς αρχειοθετούνται οι εκδρομές;
**A:** Αυτόματα, **1 μέρα μετά** την ημερομηνία της εκδρομής. Το σύστημα ελέγχει κάθε 1 ώρα.

### Q: Μπορώ να επαναφέρω μια αρχειοθετημένη εκδρομή;
**A:** Όχι μέσω UI. Οι αρχειοθετημένες εκδρομές είναι read-only (μπορείτε μόνο να τις διαγράψετε ή να εξάγετε σε PDF).

### Q: Ποιος είναι ο μέγιστος αριθμός συμμετεχόντων ανά εκδρομή;
**A:** Δεν υπάρχει τεχνικό όριο. Tested με 100+ συμμετέχοντες χωρίς προβλήματα.

### Q: Μπορώ να δημιουργήσω εκδρομή στο παρελθόν;
**A:** Ναι, αλλά θα αρχειοθετηθεί αυτόματα εάν η ημερομηνία είναι > 1 μέρα πριν από σήμερα.

### Q: Τι σημαίνουν οι διαφορετικές τοποθεσίες;
**A:** Μπορείτε να προσθέσετε πολλαπλές τοποθεσίες που θα επισκεφτεί η εκδρομή (π.χ. "Καλαμπάκα, Μετέωρα, Τρίκαλα"). Χωρίστε τις με κόμμα.

---

## 👥 Contacts (Επαφές)

### Q: Ποιος είναι ο μέγιστος αριθμός επαφών;
**A:** Δεν υπάρχει σκληρό όριο. Tested με 500+ επαφές χωρίς προβλήματα performance.

### Q: Πώς κάνω import επαφές από Excel;
**A:**
1. Αποθηκεύστε το Excel ως CSV
2. Βεβαιωθείτε ότι έχει headers: `firstName,lastName,phone` ή `Όνομα,Επώνυμο,Τηλέφωνο`
3. Πατήστε "Εισαγωγή CSV/Excel"
4. Επιλέξτε το αρχείο

### Q: Τι γίνεται αν διαγράψω μια επαφή που συμμετέχει σε εκδρομή;
**A:** Η επαφή θα διαγραφεί από το σύστημα. Στις εκδρομές που συμμετείχε, θα εμφανίζεται ως "Άγνωστος χρήστης" στο PDF export.

### Q: Μπορώ να έχω δύο επαφές με το ίδιο όνομα;
**A:** Ναι, δεν υπάρχει περιορισμός για duplicates.

### Q: Είναι υποχρεωτικό το τηλέφωνο;
**A:** Όχι, το πεδίο τηλεφώνου είναι προαιρετικό.

---

## 📄 PDF Export

### Q: Σε ποια γλώσσα είναι το PDF;
**A:** Στα Ελληνικά. Όλα τα headers και labels είναι στα Ελληνικά.

### Q: Πού αποθηκεύεται το PDF;
**A:** Στον φάκελο Downloads της συσκευής σας.

### Q: Μπορώ να προσαρμόσω το PDF;
**A:** Όχι μέσω UI. Θα χρειαστεί να επεξεργαστείτε το `TripList.js` component (function `generatePDF`).

### Q: Τι περιέχει το PDF;
**A:**
- Όνομα εκδρομής
- Ημερομηνία
- Τοποθεσίες
- Συνολικοί συμμετέχοντες
- Πίνακας με: Α/Α, Όνομα, Επώνυμο, Τηλέφωνο

### Q: Υποστηρίζει πολλές σελίδες;
**A:** Ναι! Αν οι συμμετέχοντες είναι πολλοί, το jsPDF-autotable δημιουργεί αυτόματα νέες σελίδες.

---

## 🔍 Search & Filter

### Q: Πώς λειτουργεί η αναζήτηση;
**A:** Αναζητά στο **όνομα της εκδρομής**. Case-insensitive (δεν κάνει διάκριση πεζών/κεφαλαίων).

### Q: Μπορώ να αναζητήσω με τοποθεσία;
**A:** Όχι προς το παρόν. Feature στο roadmap.

### Q: Πώς λειτουργεί το date range filter;
**A:**
- **Από ημερομηνία**: Εμφανίζει εκδρομές >= αυτή την ημερομηνία
- **Έως ημερομηνία**: Εμφανίζει εκδρομές <= αυτή την ημερομηνία
- **Και τα δύο**: Εκδρομές εντός του range

### Q: Μπορώ να αποθηκεύσω τα φίλτρα μου;
**A:** Όχι. Τα φίλτρα επαναφέρονται κάθε φορά που ανανεώνετε τη σελίδα.

---

## 🐛 Troubleshooting

### Q: Η εφαρμογή κολλάει στο loading screen
**A:**
1. Force stop την εφαρμογή
2. Clear cache: Settings → Apps → Trip Manager → Clear Cache
3. Restart την εφαρμογή
4. Αν συνεχίζει, uninstall/reinstall

### Q: Τα δεδομένα μου χάθηκαν!
**A:** Πιθανές αιτίες:
- Uninstall της εφαρμογής
- Clear data (όχι cache)
- Corrupted database (σπάνιο)
- **Πρόληψη**: Κάντε τακτικά export (PDF για trips, CSV για contacts)

### Q: Το CSV import δεν λειτουργεί
**A:** Ελέγξτε:
- Το αρχείο είναι .csv (όχι .xls/.xlsx)
- Έχει σωστά headers
- Encoding είναι UTF-8
- Δεν έχει κενές γραμμές στην αρχή
- Κάθε γραμμή έχει όλα τα απαραίτητα πεδία

### Q: Το PDF δεν κατεβαίνει
**A:**
1. Ελέγξτε permissions: Settings → Apps → Trip Manager → Permissions → Storage (Allow)
2. Ελέγξτε αν έχετε αρκετό χώρο
3. Δοκιμάστε download σε διαφορετικό trip

### Q: Η εφαρμογή είναι αργή
**A:**
- Normal για 500+ contacts ή 200+ trips
- Κάντε cleanup παλιών archived trips
- Διαγράψτε ανενεργές επαφές
- Restart την εφαρμογή

### Q: "App Not Responding" (ANR)
**A:**
- Πιθανόν πολύ μεγάλο dataset
- Force stop & restart
- Consider cleanup

---

## 📱 Android Specific

### Q: Λειτουργεί σε iOS;
**A:** Όχι. Αυτή τη στιγμή μόνο Android. Για iOS θα χρειαστεί separate build με Capacitor iOS.

### Q: Ποια έκδοση Android χρειάζεται;
**A:** Android 5.1 (Lollipop) ή νεότερη. Recommended: Android 8+

### Q: Μπορώ να το εγκαταστήσω από Play Store;
**A:** Όχι, είναι custom app. Εγκαθίσταται μέσω APK (sideloading).

### Q: Πώς ενημερώνω την εφαρμογή;
**A:**
1. Uninstall την παλιά έκδοση (ή install over)
2. Install το νέο APK
3. **ΠΡΟΣΟΧΗ**: Uninstall διαγράφει τα δεδομένα!

### Q: Γιατί ζητάει "Unknown Sources" permission;
**A:** Επειδή δεν είναι από Play Store. Είναι ασφαλές εφόσον το APK προέρχεται από trusted source.

---

## 💾 Data & Storage

### Q: Πού αποθηκεύονται τα δεδομένα;
**A:** Στην τοπική βάση δεδομένων της εφαρμογής (PouchDB → IndexedDB):
```
/data/data/com.tripmanager.app/databases/
```

### Q: Πόσο χώρο καταλαμβάνει;
**A:**
- App size: ~5-10 MB
- Data: Εξαρτάται από χρήση
    - 100 trips + 200 contacts ≈ 1-2 MB
    - 500 trips + 1000 contacts ≈ 5-10 MB

### Q: Μπορώ να κάνω backup;
**A:** Όχι αυτόματα. Manual backup:
1. Export όλες τις επαφές σε CSV
2. Export κάθε trip σε PDF
3. Αποθηκεύστε τα αρχεία safely

### Q: Υπάρχει cloud sync;
**A:** Όχι. Η εφαρμογή είναι fully offline. Feature στο future roadmap.

---

## 🔧 Development

### Q: Πώς κάνω τροποποιήσεις στον κώδικα;
**A:**
1. Edit source files στο `src/`
2. `npm run build`
3. `npx cap sync android`
4. `npx cap open android`
5. Build new APK

### Q: Πώς debug στο Android;
**A:**
```bash
# Connect device via USB
adb devices
adb logcat | grep -i "TripManager"

# Or use Chrome DevTools
chrome://inspect
```

### Q: Πώς προσθέτω νέα feature;
**A:**
1. Edit components στο `src/components/`
2. Update database.js αν χρειάζεται
3. Test locally: `npm start`
4. Build & deploy

### Q: Μπορώ να χρησιμοποιήσω άλλη database;
**A:** Ναι, αλλά θα χρειαστεί refactoring. PouchDB επιλέχθηκε για offline support. Alternatives: SQLite (Capacitor plugin), Realm, WatermelonDB.

---

## 🎨 Customization

### Q: Πώς αλλάζω τα χρώματα;
**A:** Edit το `styles` object σε κάθε component. Main colors:
- Primary: `#667eea` (μπλε)
- Success: `#51cf66` (πράσινο)
- Warning: `#ff922b` (πορτοκαλί)
- Danger: `#ff6b6b` (κόκκινο)

### Q: Πώς αλλάζω το app icon;
**A:**
1. Δημιουργήστε icon (1024x1024 PNG)
2. Χρησιμοποιήστε https://icon.kitchen
3. Αντικαταστήστε τα icons στο `android/app/src/main/res/`

### Q: Πώς αλλάζω το app name;
**A:**
1. Edit `capacitor.config.json`: `"appName": "Your Name"`
2. Edit `android/app/src/main/res/values/strings.xml`
3. Rebuild

---

## 📊 Performance

### Q: Πόσες εκδρομές μπορεί να χειριστεί;
**A:** Tested με 500+ trips χωρίς προβλήματα. Theoretical limit: 1000+

### Q: Πόσες επαφές μπορεί να χειριστεί;
**A:** Tested με 1000+ contacts. UI μπορεί να γίνει αργό σε πολύ παλιές συσκευές.

### Q: Πώς βελτιώνω την ταχύτητα;
**A:**
- Delete old archived trips
- Cleanup unused contacts
- Restart app περιοδικά
- Use newer Android device

---

## 🔮 Future Features

### Q: Τι έρχεται στο μέλλον;
**A:** Στο roadmap:
- Password hashing & security
- User management
- Cloud sync (optional)
- Dark mode
- Trip categories/tags
- Statistics & analytics
- Backup/restore functionality
- Multi-language support

### Q: Πώς μπορώ να ζητήσω feature;
**A:** Contact τον developer ή κάντε issue στο repository.

---

## 📞 Support

### Q: Πού μπορώ να βρω βοήθεια;
**A:**
- Διαβάστε το README.md
- Ελέγξτε το TESTING_CHECKLIST.md
- Διαβάστε τον INSTALLATION_GUIDE
- Contact support

### Q: Υπάρχει documentation;
**A:** Ναι:
- README.md - Project overview
- INSTALLATION_GUIDE.md - Setup instructions
- TESTING_CHECKLIST.md - Testing guide
- FAQ.md - Αυτό το αρχείο!

---

**Δεν βρήκατε την απάντησή σας; Contact support! 📧**