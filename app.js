import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your Firebase configuration from the screenshot
const firebaseConfig = {
  apiKey: "AIzaSyBtOgABQlrCH_9wfTQ7g9Bxhnn336vsKQI",
  authDomain: "tosm-3f264.firebaseapp.com",
  projectId: "tosm-3f264",
  storageBucket: "tosm-3f264.firebasestorage.app",
  messagingSenderId: "602705659676",
  appId: "1:602705659676:web:54705408856ea7e25edcd9",
  measurementId: "G-PYVW8G02YE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------- DOM ELEMENTS -----------------
const views = {
    auth: document.getElementById('auth-view'),
    dashboard: document.getElementById('dashboard-view')
};

const forms = {
    authForm: document.getElementById('auth-form'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    errorMsg: document.getElementById('auth-error'),
    logoutBtn: document.getElementById('logout-btn'),
    userEmail: document.getElementById('user-display-email')
};

const ui = {
    mapTabs: document.getElementById('map-tabs'),
    addTabBtn: document.getElementById('add-tab-btn'),
    mapModal: document.getElementById('map-modal'),
    newMapName: document.getElementById('new-map-name'),
    cancelMap: document.getElementById('cancel-map-btn'),
    saveMap: document.getElementById('save-map-btn'),
    
    currentMapTitle: document.getElementById('current-map-title'),
    addBossBtn: document.getElementById('add-boss-btn'),
    deleteMapBtn: document.getElementById('delete-map-btn'),
    bossList: document.getElementById('boss-list'),
    
    bossModal: document.getElementById('boss-modal'),
    newBossName: document.getElementById('new-boss-name'),
    newBossTime: document.getElementById('new-boss-time'),
    cancelBoss: document.getElementById('cancel-boss-btn'),
    saveBoss: document.getElementById('save-boss-btn')
};

// ----------------- APP STATE -----------------
let currentMapId = null;
let mapsUnsubscribe = null;
let bossesUnsubscribe = null;
let updateInterval = null;
let globalBossesData = [];

// ----------------- ROUTING / VIEWS -----------------
function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewName].classList.add('active');
}

// ----------------- AUTHENTICATION -----------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        switchView('dashboard');
        forms.userEmail.textContent = user.email;
        loadMaps(); // Start syncing data from database when logged in
    } else {
        switchView('auth');
        forms.authForm.reset();
        // Cleanup listeners when logged out
        if(mapsUnsubscribe) mapsUnsubscribe();
        if(bossesUnsubscribe) bossesUnsubscribe();
        if(updateInterval) clearInterval(updateInterval);
    }
});

// Login
forms.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eVal = forms.email.value;
    const pVal = forms.password.value;
    try {
        forms.errorMsg.textContent = "Logging in...";
        forms.loginBtn.disabled = true;
        await signInWithEmailAndPassword(auth, eVal, pVal);
        forms.errorMsg.textContent = "";
    } catch (error) {
        forms.errorMsg.textContent = error.message;
    } finally {
        forms.loginBtn.disabled = false;
    }
});

// Register
forms.registerBtn.addEventListener('click', async () => {
    const eVal = forms.email.value;
    const pVal = forms.password.value;
    if(!eVal || !pVal) {
        forms.errorMsg.textContent = "Enter email and password to register/login";
        return;
    }
    try {
        forms.errorMsg.textContent = "Registering...";
        await createUserWithEmailAndPassword(auth, eVal, pVal);
        forms.errorMsg.textContent = "";
    } catch (error) {
        forms.errorMsg.textContent = error.message;
    }
});

// Logout
forms.logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// ----------------- MAPS LOGIC -----------------
function loadMaps() {
    const q = query(collection(db, "maps"));
    mapsUnsubscribe = onSnapshot(q, (snapshot) => {
        ui.mapTabs.innerHTML = '';
        const maps = [];
        snapshot.forEach(doc => {
            maps.push({ id: doc.id, ...doc.data() });
        });

        maps.sort((a,b) => a.name.localeCompare(b.name)); // Sort Alphabetically

        maps.forEach(map => {
            const btn = document.createElement('div');
            btn.className = `tab ${currentMapId === map.id ? 'active-tab' : ''}`;
            btn.textContent = map.name;
            btn.onclick = () => selectMap(map.id, map.name);
            ui.mapTabs.appendChild(btn);
        });

        if(maps.length > 0 && !currentMapId) {
            selectMap(maps[0].id, maps[0].name);
        } else if (maps.length === 0) {
            ui.currentMapTitle.textContent = "No Maps Added Yet";
            ui.addBossBtn.style.display = 'none';
        }
    });
}

function selectMap(id, name) {
    currentMapId = id;
    ui.currentMapTitle.textContent = name;
    ui.addBossBtn.style.display = 'block';
    ui.deleteMapBtn.style.display = 'block';
    
    // update tab UI
    document.querySelectorAll('.tab').forEach(t => {
        if(t.textContent === name) t.classList.add('active-tab');
        else t.classList.remove('active-tab');
    });

    loadBosses(id);
}

// ----------------- BOSS LOGIC -----------------
function loadBosses(mapId) {
    if(bossesUnsubscribe) bossesUnsubscribe();
    if(updateInterval) clearInterval(updateInterval);

    const q = query(collection(db, `maps/${mapId}/bosses`));
    bossesUnsubscribe = onSnapshot(q, (snapshot) => {
        globalBossesData = [];
        snapshot.forEach(doc => {
            globalBossesData.push({ id: doc.id, ...doc.data() });
        });
        renderBossCards();
        // start UI timer update loop
        if(updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(renderBossCards, 1000); 
    });
}

function renderBossCards() {
    if(!globalBossesData || globalBossesData.length === 0) {
        ui.bossList.innerHTML = '<div class="empty-state">No bosses added to this map yet.</div>';
        return;
    }

    ui.bossList.innerHTML = '';
    const now = Date.now();

    globalBossesData.forEach(boss => {
        let timerText = "00:00:00";
        let isSpawned = false;

        if (boss.targetTime) {
            const remainingMeta = boss.targetTime - now;
            if (remainingMeta <= 0) {
                isSpawned = true;
                timerText = "SPAWNED!";
            } else {
                // Calculate hh:mm:ss
                const totalSeconds = Math.floor(remainingMeta / 1000);
                const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
                const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
                const s = (totalSeconds % 60).toString().padStart(2, '0');
                timerText = `${h}:${m}:${s}`;
            }
        } else {
             timerText = "Waiting...";
        }

        const card = document.createElement('div');
        card.className = 'boss-card';
        card.innerHTML = `
            <div class="boss-info">
                <h4>${boss.name}</h4>
                <p>Respawn: ${boss.respawnLengthMin} mins</p>
            </div>
            <div class="timer-display ${isSpawned ? 'spawned' : ''}">${timerText}</div>
            <div class="boss-actions">
                <button class="btn primary-btn sm-btn" onclick="killBoss('${boss.id}', ${boss.respawnLengthMin})">I Killed It</button>
                <button class="btn text-btn sm-btn" onclick="deleteBoss('${boss.id}')" style="color: var(--danger)" title="Remove Boss">X</button>
            </div>
        `;
        ui.bossList.appendChild(card);
    });
}

// Window scope function triggered by the inline HTML onclick
window.killBoss = async (bossId, respawnMins) => {
    if(!currentMapId) return;
    const targetTime = Date.now() + (respawnMins * 60 * 1000);
    const bossRef = doc(db, `maps/${currentMapId}/bosses`, bossId);
    await updateDoc(bossRef, {
        targetTime: targetTime
    });
};

window.deleteBoss = async (bossId) => {
    if(!currentMapId) return;
    if(confirm('Are you sure you want to remove this boss?')) {
        await deleteDoc(doc(db, `maps/${currentMapId}/bosses`, bossId));
    }
};

// ----------------- MODAL INTERACTIONS -----------------
// Maps Modal
ui.addTabBtn.onclick = () => ui.mapModal.classList.add('show');
ui.cancelMap.onclick = () => { ui.mapModal.classList.remove('show'); ui.newMapName.value = ''; };
ui.saveMap.onclick = async () => {
    const val = ui.newMapName.value.trim();
    if(val) {
        await addDoc(collection(db, "maps"), { name: val });
        ui.mapModal.classList.remove('show');
        ui.newMapName.value = '';
    }
};

ui.deleteMapBtn.onclick = async () => {
    if(!currentMapId) return;
    if(confirm('Are you sure you want to delete this map entirely? All bosses inside will be lost.')) {
        // Technically this leaves dangling bosses in Firestore logic unless deleted recursively,
        // but it removes it from UI, keeping it simple for the free tier for now.
        await deleteDoc(doc(db, "maps", currentMapId));
        currentMapId = null;
        ui.currentMapTitle.textContent = "Select a Map";
        ui.addBossBtn.style.display = 'none';
        ui.deleteMapBtn.style.display = 'none';
        ui.bossList.innerHTML = '<div class="empty-state">No map selected.</div>';
    }
};

// Boss Modal
ui.addBossBtn.onclick = () => ui.bossModal.classList.add('show');
ui.cancelBoss.onclick = () => { ui.bossModal.classList.remove('show'); ui.newBossName.value = ''; ui.newBossTime.value = ''; };
ui.saveBoss.onclick = async () => {
    const name = ui.newBossName.value.trim();
    const time = parseInt(ui.newBossTime.value);
    
    if(name && time && currentMapId) {
        await addDoc(collection(db, `maps/${currentMapId}/bosses`), {
            name: name,
            respawnLengthMin: time,
            targetTime: null 
        });
        ui.bossModal.classList.remove('show');
        ui.newBossName.value = '';
        ui.newBossTime.value = '';
    }
};
