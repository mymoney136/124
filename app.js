const { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } = React;

// --- Firebase SDKs (using a global object for simplicity in this environment) ---
// Note: In a real build process, you'd use imports.
const { initializeApp } = window.firebase.app;
const { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, updateProfile } = window.firebase.auth;
const { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, onSnapshot, deleteDoc } = window.firebase.firestore;
const { getStorage, ref, uploadBytes, getDownloadURL } = window.firebase.storage;

// Your web app's Firebase configuration - ALREADY FILLED IN
const firebaseConfig = {
  apiKey: "AIzaSyCAkTramEw9xQsKDJafmKPTRaoQMyxl_88",
  authDomain: "my-money-site-177b1.firebaseapp.com",
  projectId: "my-money-site-177b1",
  storageBucket: "my-money-site-177b1.firebasestorage.app",
  messagingSenderId: "1001673216101",
  appId: "1:1001673216101:web:1135329ea119260a89b68c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const firebaseServices = {
    auth, db, storage,
    signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously,
    updateProfile, doc, setDoc, getDoc, collection, addDoc, query, onSnapshot,
    deleteDoc, ref, uploadBytes, getDownloadURL
};


// --- Helper Functions & Constants ---
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

// --- Translations & Currency Data ---
const translations = {
    en: { "login": "Login", "signup": "Sign Up", "login_with_google": "Login with Google", "continue_as_guest": "Continue as Guest", "username": "Username", "email": "Email", "password": "Password", "confirm_password": "Confirm Password", "logout": "Logout", "welcome": "Welcome", "guest": "Guest", "please_login": "Please log in to continue", "dashboard": "Dashboard", "total_balance": "Total Balance", "budget_overview": "Budget Overview", "daily_allowance": "Daily Allowance", "spent_today": "Spent Today", "remaining": "Remaining", "savings_goals": "Savings Goals", "goal": "Goal", "progress": "Progress", "recent_transactions": "Recent Transactions", "add_transaction": "Add Transaction", "income": "Income", "expense": "Expense", "amount": "Amount", "description": "Description", "date": "Date", "add": "Add", "no_transactions": "No transactions yet.", "settings": "Settings", "display_settings": "Display Settings", "theme": "Theme", "light": "Light", "dark": "Dark", "transparent_mode": "Transparent Mode", "on": "On", "off": "Off", "background_image": "Background Image", "from_url": "From URL", "paste_image_url": "Paste image URL", "upload_from_computer": "Upload from Computer", "primary_color": "Primary Color", "font": "Font", "budget_settings": "Budget Settings", "total_budget": "Total Budget", "start_date": "Start Date", "end_date": "End Date", "currency": "Currency", "tips_settings": "Tips Settings", "show_tips": "Show Tips", "save_changes": "Save Changes", "settings_saved": "Settings saved successfully!", "settings_save_error": "Error saving settings.", "add_savings_goal": "Add Savings Goal", "goal_name": "Goal Name (e.g., New Laptop)", "goal_amount": "Goal Amount", "target_date": "Target Date", "notifications": "Notifications", "enable_notifications": "Enable Notifications", "notification_test_success": "Test notification sent! Check your device.", "notification_test_fail": "Could not send test notification. Please ensure permissions are granted.", "no_notifications": "No new notifications.", "tip_welcome_guest": "Welcome! We recommend signing up or logging in. This will save all your data and allow you to access it from any device.", "tip_background": "Pro Tip: Visit Display Settings to add a background image. The transparent mode looks amazing with a background!", "tip_savings_goal": "Set a savings goal! The app will automatically help you budget for it.", "all_rights_reserved": "All Rights Reserved", "close": "Close" },
    he: { "login": "התחברות", "signup": "הרשמה", "login_with_google": "התחברות עם גוגל", "continue_as_guest": "המשך כאורח", "username": "שם משתמש", "email": "אימייל", "password": "סיסמה", "confirm_password": "אימות סיסמה", "logout": "התנתקות", "welcome": "ברוך הבא", "guest": "אורח", "please_login": "אנא התחבר כדי להמשיך", "dashboard": "לוח מחוונים", "total_balance": "יתרה כוללת", "budget_overview": "סקירת תקציב", "daily_allowance": "קצבה יומית", "spent_today": "הוצאות היום", "remaining": "נותר", "savings_goals": "יעדי חיסכון", "goal": "יעד", "progress": "התקדמות", "recent_transactions": "פעולות אחרונות", "add_transaction": "הוספת פעולה", "income": "הכנסה", "expense": "הוצאה", "amount": "סכום", "description": "תיאור", "date": "תאריך", "add": "הוסף", "no_transactions": "אין עדיין פעולות.", "settings": "הגדרות", "display_settings": "הגדרות תצוגה", "theme": "ערכת נושא", "light": "בהיר", "dark": "כהה", "transparent_mode": "מצב שקוף", "on": "פעיל", "off": "כבוי", "background_image": "תמונת רקע", "from_url": "מכתובת אינטרנט", "paste_image_url": "הדבק קישור לתמונה", "upload_from_computer": "העלאה מהמחשב", "primary_color": "צבע ראשי", "font": "גופן", "budget_settings": "הגדרות תקציב", "total_budget": "תקציב כולל", "start_date": "תאריך התחלה", "end_date": "תאריך סיום", "currency": "מטבע", "tips_settings": "הגדרות טיפים", "show_tips": "הצג טיפים", "save_changes": "שמור שינויים", "settings_saved": "ההגדרות נשמרו בהצלחה!", "settings_save_error": "שגיאה בשמירת ההגדרות.", "add_savings_goal": "הוסף יעד חיסכון", "goal_name": "שם היעד (למשל, מחשב נייד חדש)", "goal_amount": "סכום היעד", "target_date": "תאריך יעד", "notifications": "התראות", "enable_notifications": "הפעל התראות", "notification_test_success": "התראת בדיקה נשלחה! בדוק את מכשירך.", "notification_test_fail": "לא ניתן היה לשלוח התראת בדיקה. אנא ודא שהרשאות ניתנו.", "no_notifications": "אין התראות חדשות.", "tip_welcome_guest": "ברוכים הבאים! מומלץ להירשם או להתחבר. כך כל הנתונים יישמרו ותוכלו לגשת אליהם מכל מכשיר.", "tip_background": "טיפ מקצועי: בקרו בהגדרות התצוגה כדי להוסיף תמונת רקע. מצב שקוף נראה מדהים עם רקע!", "tip_savings_goal": "הגדירו יעד חיסכון! האפליקציה תעזור לכם אוטומטית לתכנן את התקציב עבורו.", "all_rights_reserved": "כל הזכויות שמורות", "close": "סגור" }
};
const currencies = { "USD": { "name": "United States Dollar", "symbol": "$" }, "EUR": { "name": "Euro", "symbol": "€" }, "JPY": { "name": "Japanese Yen", "symbol": "¥" }, "GBP": { "name": "British Pound Sterling", "symbol": "£" }, "ILS": { "name": "Israeli New Sheqel", "symbol": "₪" }, "AUD": { "name": "Australian Dollar", "symbol": "A$" }, "CAD": { "name": "Canadian Dollar", "symbol": "C$" }, "CHF": { "name": "Swiss Franc", "symbol": "CHF" }, "CNY": { "name": "Chinese Yuan", "symbol": "¥" }, "INR": { "name": "Indian Rupee", "symbol": "₹" }, "RUB": { "name": "Russian Ruble", "symbol": "₽" }, "CZK": { "name": "Czech Koruna", "symbol": "Kč" } };

// --- Context for Global State ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [settings, setSettings] = useState({ lang: 'he', theme: 'dark', transparentMode: true, backgroundUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80', primaryColor: '#3b82f6', font: 'Inter', currency: 'ILS', showTips: true });
    const [transactions, setTransactions] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [budget, setBudget] = useState({ total: 10000, startDate: new Date().toISOString().split('T')[0], endDate: '' });
    
    useEffect(() => {
        const { onAuthStateChanged, doc, getDoc } = firebaseServices;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                setIsGuest(user.isAnonymous);
                if (!user.isAnonymous) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        setSettings(prev => ({ ...prev, ...docSnap.data().settings }));
                        setBudget(prev => ({ ...prev, ...docSnap.data().budget }));
                    }
                }
            } else {
                setUser(null);
                setIsGuest(false);
                setTransactions([]);
                setSavingsGoals([]);
            }
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && !isGuest) {
            const { query, collection, onSnapshot } = firebaseServices;
            const transQuery = query(collection(db, 'users', user.uid, 'transactions'));
            const unsubTrans = onSnapshot(transQuery, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTransactions(data);
            });
            const goalsQuery = query(collection(db, 'users', user.uid, 'savingsGoals'));
            const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSavingsGoals(data);
            });
            return () => { unsubTrans(); unsubGoals(); };
        } else if (isGuest) {
            // For guests, data is already local, so no need to fetch.
        } else {
            setTransactions([]);
            setSavingsGoals([]);
        }
    }, [user, isGuest]);

    const updateSetting = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        if (user && !isGuest) {
            const { doc, setDoc } = firebaseServices;
            await setDoc(doc(db, 'users', user.uid), { settings: newSettings }, { merge: true });
        }
    };

    const updateBudget = async (newBudget) => {
        setBudget(newBudget);
        if (user && !isGuest) {
            const { doc, setDoc } = firebaseServices;
            await setDoc(doc(db, 'users', user.uid), { budget: newBudget }, { merge: true });
        }
    };

    const addTransaction = async (transaction) => {
        if (user && !isGuest) {
            const { collection, addDoc } = firebaseServices;
            await addDoc(collection(db, 'users', user.uid, 'transactions'), transaction);
        } else {
            setTransactions(prev => [...prev, { ...transaction, id: `guest-${Date.now()}` }]);
        }
    };

    const addSavingsGoal = async (goal) => {
        if (user && !isGuest) {
            const { collection, addDoc } = firebaseServices;
            await addDoc(collection(db, 'users', user.uid, 'savingsGoals'), goal);
        } else {
            setSavingsGoals(prev => [...prev, { ...goal, id: `guest-${Date.now()}` }]);
        }
    };

    const deleteSavingsGoal = async (id) => {
        if (user && !isGuest) {
            const { doc, deleteDoc } = firebaseServices;
            await deleteDoc(doc(db, 'users', user.uid, 'savingsGoals', id));
        } else {
            setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
        }
    };

    const t = useCallback((key) => translations[settings.lang]?.[key] || key, [settings.lang]);

    return (
        <AppContext.Provider value={{ user, isGuest, authReady, settings, transactions, savingsGoals, budget, updateSetting, updateBudget, t, addTransaction, addSavingsGoal, deleteSavingsGoal }}>
            {children}
        </AppContext.Provider>
    );
};

const useAppContext = () => useContext(AppContext);

// --- UI Components ---
function GlassCard({ children, className = '' }) {
    const { settings } = useAppContext();
    const baseStyle = 'border rounded-2xl shadow-lg transition-all duration-300';
    const glassStyle = settings.transparentMode ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-gray-800/80 border-gray-700';
    const lightStyle = settings.theme === 'light' ? 'bg-white/80 border-gray-200 text-gray-800' : glassStyle;
    return <div className={`${baseStyle} ${lightStyle} ${className}`}>{children}</div>;
}

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    const { settings } = useAppContext();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                <GlassCard className="p-0 overflow-hidden">
                    <div className={`flex justify-between items-center p-4 border-b ${settings.theme === 'light' ? 'border-gray-200' : 'border-white/20'}`}>
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
                </GlassCard>
            </div>
        </div>
    );
}

function Toast({ message, isVisible, setIsVisible }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => setIsVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, setIsVisible]);
    if (!isVisible) return null;
    return <div className="fixed top-5 left-5 z-50 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">{message}</div>;
}

function Tip({ id, message, onDismiss }) {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(id), 500);
        }, 25000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);
    return (
        <div className={`fixed top-5 right-5 z-50 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <GlassCard className="p-4 flex items-start gap-3 max-w-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm">{message}</p>
                <button onClick={() => setIsVisible(false)} className="p-1 rounded-full hover:bg-white/10 -mt-1 -mr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </GlassCard>
        </div>
    );
}

function Header() {
    const { user, isGuest, t, settings, updateSetting } = useAppContext();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const handleLogout = async () => await firebaseServices.signOut(auth);
    return (
        <React.Fragment>
            <header className="fixed top-0 left-0 right-0 z-30 p-4">
                <GlassCard className="flex items-center justify-between p-2 px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{color: settings.primaryColor}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
                            <h1 className="text-xl font-bold">MyMoney</h1>
                        </div>
                        {user && <span className="text-sm opacity-80 hidden md:block">{t('welcome')}, {user.displayName || user.email || (isGuest && t('guest'))}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={settings.lang} onChange={(e) => updateSetting('lang', e.target.value)} className={`bg-transparent border-none focus:ring-0 ${settings.theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                            <option value="en" className="text-black">EN</option>
                            <option value="he" className="text-black">HE</option>
                        </select>
                        {user ? (
                            <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold bg-red-500/50 hover:bg-red-500/80 rounded-lg transition-colors">{t('logout')}</button>
                        ) : (
                            <button onClick={() => setAuthModalOpen(true)} className="px-4 py-2 text-sm font-semibold bg-blue-500/50 hover:bg-blue-500/80 rounded-lg transition-colors">{t('login')} / {t('signup')}</button>
                        )}
                    </div>
                </GlassCard>
            </header>
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </React.Fragment>
    );
}

function AuthModal({ isOpen, onClose }) {
    const { t } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleGoogleLogin = async () => {
        const provider = new firebaseServices.GoogleAuthProvider();
        try {
            await firebaseServices.signInWithPopup(auth, provider);
            onClose();
        } catch (error) { setError(error.message); }
    };
    
    const handleGuestLogin = async () => {
        try {
            await firebaseServices.signInAnonymously(auth);
            onClose();
        } catch (error) { setError(error.message); }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        if (isLogin) {
            try {
                await firebaseServices.signInWithEmailAndPassword(auth, email, password);
                onClose();
            } catch (error) { setError(error.message); }
        } else {
            if (password !== confirmPassword) { setError("Passwords do not match."); return; }
            try {
                const userCredential = await firebaseServices.createUserWithEmailAndPassword(auth, email, password);
                await firebaseServices.updateProfile(userCredential.user, { displayName: username });
                onClose();
            } catch (error) { setError(error.message); }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? t('login') : t('signup')}>
            <div className="flex flex-col gap-4">
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                    {!isLogin && <input type="text" placeholder={t('username')} value={username} onChange={(e) => setUsername(e.target.value)} required className="p-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400" />}
                    <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required className="p-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} required className="p-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    {!isLogin && <input type="password" placeholder={t('confirm_password')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="p-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400" />}
                    <button type="submit" className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">{isLogin ? t('login') : t('signup')}</button>
                </form>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <div className="flex items-center gap-4"><hr className="flex-grow border-white/20" /><span className="text-sm opacity-70">OR</span><hr className="flex-grow border-white/20" /></div>
                <button onClick={handleGoogleLogin} className="p-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.02C43.41 39.4 46.98 32.68 46.98 24.55z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.02c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                    {t('login_with_google')}
                </button>
                <button onClick={handleGuestLogin} className="p-3 bg-gray-500/50 hover:bg-gray-500/70 rounded-lg font-semibold transition-colors">{t('continue_as_guest')}</button>
                <p className="text-center text-sm">{isLogin ? "Don't have an account?" : "Already have an account?"}<button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-blue-400 hover:underline ml-1">{isLogin ? t('signup') : t('login')}</button></p>
            </div>
        </Modal>
    );
}

function Settings() {
    const { settings, updateSetting, t, user, budget, updateBudget } = useAppContext();
    const [toastVisible, setToastVisible] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('display');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        const { ref, uploadBytes, getDownloadURL } = firebaseServices;
        const storageRef = ref(storage, `backgrounds/${user.uid}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        updateSetting('backgroundUrl', downloadURL);
        setToastVisible(true);
    };

    const debouncedUpdateUrl = useCallback(debounce((url) => updateSetting('backgroundUrl', url), 1000), [updateSetting]);

    const SettingRow = ({ label, children }) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3 border-b border-white/10">
            <label className="font-semibold text-lg">{label}</label>
            <div className="flex items-center gap-2">{children}</div>
        </div>
    );

    return (
        <div className="p-4">
            <div className="flex border-b border-white/20 mb-4">
                <button onClick={() => setActiveTab('display')} className={`px-4 py-2 text-lg ${activeTab === 'display' ? 'border-b-2 font-bold' : 'opacity-70'}`} style={{borderColor: activeTab === 'display' ? settings.primaryColor : 'transparent'}}>{t('display_settings')}</button>
                <button onClick={() => setActiveTab('budget')} className={`px-4 py-2 text-lg ${activeTab === 'budget' ? 'border-b-2 font-bold' : 'opacity-70'}`} style={{borderColor: activeTab === 'budget' ? settings.primaryColor : 'transparent'}}>{t('budget_settings')}</button>
                <button onClick={() => setActiveTab('tips')} className={`px-4 py-2 text-lg ${activeTab === 'tips' ? 'border-b-2 font-bold' : 'opacity-70'}`} style={{borderColor: activeTab === 'tips' ? settings.primaryColor : 'transparent'}}>{t('tips_settings')}</button>
            </div>
            {activeTab === 'display' && (
                <div className="flex flex-col gap-4">
                    <SettingRow label={t('theme')}><button onClick={() => updateSetting('theme', 'light')} className={`px-4 py-2 rounded-lg ${settings.theme === 'light' ? 'bg-white text-black' : 'bg-white/10'}`}>{t('light')}</button><button onClick={() => updateSetting('theme', 'dark')} className={`px-4 py-2 rounded-lg ${settings.theme === 'dark' ? 'bg-black text-white' : 'bg-white/10'}`}>{t('dark')}</button></SettingRow>
                    <SettingRow label={t('transparent_mode')}><button onClick={() => updateSetting('transparentMode', !settings.transparentMode)} className={`px-4 py-2 rounded-lg ${settings.transparentMode ? 'bg-blue-500' : 'bg-white/10'}`}>{settings.transparentMode ? t('on') : t('off')}</button></SettingRow>
                    <SettingRow label={t('primary_color')}><input type="color" value={settings.primaryColor} onChange={(e) => updateSetting('primaryColor', e.target.value)} className="w-10 h-10 rounded-full border-none cursor-pointer bg-transparent" /></SettingRow>
                    <SettingRow label={t('font')}><select value={settings.font} onChange={(e) => updateSetting('font', e.target.value)} className="bg-white/10 p-2 rounded-lg border-none text-white"><option className="text-black" value="Inter">Inter</option><option className="text-black" value="Roboto">Roboto</option><option className="text-black" value="Open Sans">Open Sans</option></select></SettingRow>
                    <div className="flex flex-col gap-2 py-3"><label className="font-semibold text-lg">{t('background_image')}</label><div className="flex flex-col sm:flex-row gap-2"><input type="text" placeholder={t('paste_image_url')} defaultValue={settings.backgroundUrl} onChange={(e) => debouncedUpdateUrl(e.target.value)} className="flex-grow p-2 bg-white/10 rounded-lg border border-white/20" /><button onClick={() => fileInputRef.current.click()} className="p-2 bg-white/20 rounded-lg">{t('upload_from_computer')}</button><input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" /></div></div>
                </div>
            )}
            {activeTab === 'budget' && (
                <div className="flex flex-col gap-4">
                    <SettingRow label={t('total_budget')}><input type="number" value={budget.total} onChange={(e) => updateBudget({ ...budget, total: parseFloat(e.target.value)})} className="p-2 bg-white/10 rounded-lg w-40 text-right" /></SettingRow>
                    <SettingRow label={t('start_date')}><input type="date" value={budget.startDate} onChange={(e) => updateBudget({ ...budget, startDate: e.target.value })} className="p-2 bg-white/10 rounded-lg" /></SettingRow>
                    <SettingRow label={t('end_date')}><input type="date" value={budget.endDate} onChange={(e) => updateBudget({ ...budget, endDate: e.target.value })} className="p-2 bg-white/10 rounded-lg" /></SettingRow>
                    <SettingRow label={t('currency')}><select value={settings.currency} onChange={(e) => updateSetting('currency', e.target.value)} className="p-2 bg-white/10 rounded-lg text-white">{Object.keys(currencies).map(code => <option className="text-black" key={code} value={code}>{code} - {currencies[code].name}</option>)}</select></SettingRow>
                </div>
            )}
            {activeTab === 'tips' && <SettingRow label={t('show_tips')}><button onClick={() => updateSetting('showTips', !settings.showTips)} className={`px-4 py-2 rounded-lg ${settings.showTips ? 'bg-blue-500' : 'bg-white/10'}`}>{settings.showTips ? t('on') : t('off')}</button></SettingRow>}
            <Toast message={t('settings_saved')} isVisible={toastVisible} setIsVisible={setToastVisible} />
        </div>
    );
}

function Dashboard() {
    const { t, settings, transactions, savingsGoals, budget } = useAppContext();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const currencySymbol = currencies[settings.currency]?.symbol || '$';
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const totalBalance = totalIncome - totalExpense;
    const today = new Date().toISOString().split('T')[0];
    const spentToday = transactions.filter(t => t.type === 'expense' && t.date === today).reduce((acc, t) => acc + t.amount, 0);
    const dailyAllowance = useMemo(() => {
        if (!budget.total || !budget.startDate || !budget.endDate) return 0;
        const start = new Date(budget.startDate);
        const end = new Date(budget.endDate);
        if (start > end) return 0;
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays <= 0 ? budget.total : (budget.total / diffDays);
    }, [budget]);
    return (
        <main className="p-4 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <GlassCard className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{t('budget_overview')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div><p className="text-sm opacity-70">{t('daily_allowance')}</p><p className="text-3xl font-bold" style={{color: settings.primaryColor}}>{currencySymbol}{dailyAllowance.toFixed(2)}</p></div>
                        <div><p className="text-sm opacity-70">{t('spent_today')}</p><p className="text-3xl font-bold text-red-400">{currencySymbol}{spentToday.toFixed(2)}</p></div>
                        <div><p className="text-sm opacity-70">{t('remaining')}</p><p className="text-3xl font-bold text-green-400">{currencySymbol}{(dailyAllowance - spentToday).toFixed(2)}</p></div>
                    </div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{t('recent_transactions')}</h2><button onClick={() => setIsAddTransactionOpen(true)} className="px-4 py-2 text-sm font-semibold rounded-lg" style={{backgroundColor: settings.primaryColor}}>{t('add_transaction')}</button></div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">{transactions.length > 0 ? [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).map(tx => <div key={tx.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg"><div><p className="font-semibold text-lg">{tx.description}</p><p className="text-sm opacity-70">{new Date(tx.date).toLocaleDateString(settings.lang)}</p></div><p className={`text-xl font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}</p></div>) : <p className="text-center opacity-70 py-8">{t('no_transactions')}</p>}</div>
                </GlassCard>
            </div>
            <div className="flex flex-col gap-6">
                <GlassCard className="p-6"><p className="text-sm opacity-70">{t('total_balance')}</p><p className="text-4xl font-bold">{currencySymbol}{totalBalance.toFixed(2)}</p></GlassCard>
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{t('savings_goals')}</h2><button onClick={() => setIsAddGoalOpen(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-2xl" style={{backgroundColor: settings.primaryColor}}>+</button></div>
                    <div className="space-y-4">{savingsGoals.map(goal => { const spentOnGoal = transactions.filter(t => t.type === 'income' && t.description.toLowerCase().includes(goal.name.toLowerCase())).reduce((sum, t) => sum + t.amount, 0); const progress = Math.min((spentOnGoal / goal.amount) * 100, 100); return (<div key={goal.id}><div className="flex justify-between items-baseline"><p className="font-semibold">{goal.name}</p><p className="text-sm opacity-80">{currencySymbol}{spentOnGoal.toFixed(2)} / {currencySymbol}{goal.amount.toFixed(2)}</p></div><div className="w-full bg-white/10 rounded-full h-2.5 mt-1"><div className="h-2.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: settings.primaryColor }}></div></div></div>); })}</div>
                </GlassCard>
            </div>
            <div className="fixed bottom-4 right-4 z-40"><button onClick={() => setIsSettingsOpen(true)} className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg animate-pulse" style={{backgroundColor: settings.primaryColor}}><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button></div>
            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title={t('settings')}><Settings /></Modal>
            <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} />
            <AddSavingsGoalModal isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} />
        </main>
    );
}

function AddTransactionModal({ isOpen, onClose }) {
    const { t, addTransaction } = useAppContext();
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const handleSubmit = async (e) => { e.preventDefault(); if (!amount || !description) return; await addTransaction({ type, amount: parseFloat(amount), description, date }); setAmount(''); setDescription(''); onClose(); };
    return (<Modal isOpen={isOpen} onClose={onClose} title={t('add_transaction')}><form onSubmit={handleSubmit} className="flex flex-col gap-4"><div className="flex gap-2"><button type="button" onClick={() => setType('income')} className={`flex-1 p-3 rounded-lg font-semibold ${type === 'income' ? 'bg-green-500' : 'bg-white/10'}`}>{t('income')}</button><button type="button" onClick={() => setType('expense')} className={`flex-1 p-3 rounded-lg font-semibold ${type === 'expense' ? 'bg-red-500' : 'bg-white/10'}`}>{t('expense')}</button></div><input type="number" placeholder={t('amount')} value={amount} onChange={e => setAmount(e.target.value)} required className="p-3 bg-white/10 rounded-lg" /><input type="text" placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} required className="p-3 bg-white/10 rounded-lg" /><input type="date" value={date} onChange={e => setDate(e.target.value)} required className="p-3 bg-white/10 rounded-lg" /><button type="submit" className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">{t('add')}</button></form></Modal>);
}

function AddSavingsGoalModal({ isOpen, onClose }) {
    const { t, addSavingsGoal } = useAppContext();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const handleSubmit = async (e) => { e.preventDefault(); if (!name || !amount || !targetDate) return; await addSavingsGoal({ name, amount: parseFloat(amount), targetDate }); setName(''); setAmount(''); setTargetDate(''); onClose(); };
    return (<Modal isOpen={isOpen} onClose={onClose} title={t('add_savings_goal')}><form onSubmit={handleSubmit} className="flex flex-col gap-4"><input type="text" placeholder={t('goal_name')} value={name} onChange={e => setName(e.target.value)} required className="p-3 bg-white/10 rounded-lg" /><input type="number" placeholder={t('goal_amount')} value={amount} onChange={e => setAmount(e.target.value)} required className="p-3 bg-white/10 rounded-lg" /><input type="date" placeholder={t('target_date')} value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="p-3 bg-white/10 rounded-lg" /><button type="submit" className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">{t('add')}</button></form></Modal>);
}

function TipManager() {
    const { settings, t, isGuest } = useAppContext();
    const [activeTips, setActiveTips] = useState([]);
    useEffect(() => {
        if (!settings.showTips) { setActiveTips([]); return; }
        const tipsToShow = [];
        if (isGuest) { tipsToShow.push({ id: 'guest_login', message: t('tip_welcome_guest') }); }
        if (!settings.backgroundUrl || settings.backgroundUrl.includes('unsplash')) { tipsToShow.push({ id: 'background', message: t('tip_background') }); }
        tipsToShow.push({ id: 'savings', message: t('tip_savings_goal') });
        let i = 0;
        const interval = setInterval(() => { if (i < tipsToShow.length) { setActiveTips(prev => [...prev.filter(t => t.id !== tipsToShow[i].id), tipsToShow[i]]); i++; } else { clearInterval(interval); } }, 5000);
        return () => clearInterval(interval);
    }, [settings.showTips, isGuest, t, settings.backgroundUrl]);
    const dismissTip = (id) => setActiveTips(prev => prev.filter(tip => tip.id !== id));
    return <div>{activeTips.map(tip => <Tip key={tip.id} id={tip.id} message={tip.message} onDismiss={dismissTip} />)}</div>;
}

function AppContent() {
    const { settings, user, authReady, t } = useAppContext();
    useEffect(() => {
        document.documentElement.lang = settings.lang;
        document.documentElement.dir = settings.lang === 'he' ? 'rtl' : 'ltr';
        document.body.className = '';
        document.body.classList.add(settings.theme);
        document.body.style.fontFamily = `'${settings.font}', sans-serif`;
        document.body.style.setProperty('--primary-color', settings.primaryColor);
    }, [settings]);
    const backgroundStyle = { backgroundImage: `url(${settings.backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' };
    if (!authReady) return <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">טוען...</div>;
    return (
        <div style={backgroundStyle} className="min-h-screen transition-colors duration-300">
            <div className={`absolute inset-0 w-full h-full ${settings.theme === 'light' ? 'bg-gray-100/50' : 'bg-black/50'}`}></div>
            <div className={`relative z-10 ${settings.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                <Header />
                {user ? <Dashboard /> : <div className="h-screen flex items-center justify-center"><p className="text-2xl font-bold">{t('please_login')}</p></div>}
                <TipManager />
                <footer className="fixed bottom-0 left-0 right-0 p-2 text-center text-xs opacity-50">&copy; {new Date().getFullYear()} MyMoney. {t('all_rights_reserved')}.</footer>
            </div>
        </div>
    );
}

function App() {
    return (<AppProvider><AppContent /></AppProvider>);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
