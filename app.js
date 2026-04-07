import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, setDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { qrData } from "./bdata.js";

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

const AdminEmails = ["mizstpz@gmail.com", "flosslnw4@gmail.com"];

// ----------------- DOM ELEMENTS -----------------
const views = {
    auth: document.getElementById('auth-view'),
    dashboard: document.getElementById('dashboard-view')
};

const forms = {
    authForm: document.getElementById('auth-form'),
    googleLoginBtn: document.getElementById('google-login-btn'),
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
    saveBoss: document.getElementById('save-boss-btn'),
    
    donateBtn: document.getElementById('donate-btn'),
    donateModal: document.getElementById('donate-modal'),
    closeDonateBtn: document.getElementById('close-donate-btn'),

    adminBtn: document.getElementById('admin-btn'),
    adminModal: document.getElementById('admin-modal'),
    closeAdminBtn: document.getElementById('close-admin-btn'),
    tabLogs: document.getElementById('tab-logs'),
    tabBans: document.getElementById('tab-bans'),
    adminLogsContent: document.getElementById('admin-logs-content'),
    adminBansContent: document.getElementById('admin-bans-content'),
    adminLogsList: document.getElementById('admin-logs-list'),
    banEmailInput: document.getElementById('ban-email-input'),
    banUserBtn: document.getElementById('ban-user-btn'),
    bannedUsersList: document.getElementById('banned-users-list'),

    typeAbsolute: document.getElementById('type-absolute'),
    typeDuration: document.getElementById('type-duration'),
    timeInputLabel: document.getElementById('time-input-label')
};

// Time Type Toggles
if (ui.typeAbsolute && ui.typeDuration) {
    ui.typeAbsolute.addEventListener('change', () => {
        ui.timeInputLabel.textContent = "Target Time (24-Hour)";
        ui.newBossTime.placeholder = "E.g. 14:30";
    });
    ui.typeDuration.addEventListener('change', () => {
        ui.timeInputLabel.textContent = "Duration (HH:MM from now)";
        ui.newBossTime.placeholder = "E.g. 02:15";
    });
}

// ----------------- APP STATE -----------------
let currentMapId = null;
let mapsUnsubscribe = null;
let bossesUnsubscribe = null;
let updateInterval = null;
let globalBossesData = [];

// ----------------- AUDIT LOGS -----------------
async function logActivity(action, details) {
    if(!auth.currentUser) return;
    try {
        await addDoc(collection(db, "auditLogs"), {
            action: action,
            details: details,
            userEmail: auth.currentUser.email,
            timestamp: serverTimestamp()
        });
    } catch(e) { console.error("Failed to log activity:", e); }
}

// ----------------- ROUTING / VIEWS -----------------
function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewName].classList.add('active');
}

// ----------------- AUTHENTICATION -----------------
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Check if user is Banned
        const banDoc = await getDoc(doc(db, "bannedUsers", user.email.toLowerCase()));
        if(banDoc.exists()) {
            alert("Your account has been banned due to disturbance. Access Denied.");
            signOut(auth);
            return;
        }

        // Check if user is Admin
        const isAdmin = AdminEmails.includes(user.email.toLowerCase());
        ui.adminBtn.style.display = isAdmin ? 'block' : 'none';

        switchView('dashboard');
        forms.userEmail.textContent = user.email;
        loadMaps(); // Start syncing data from database when logged in
    } else {
        switchView('auth');
        // Cleanup listeners when logged out
        if(mapsUnsubscribe) mapsUnsubscribe();
        if(bossesUnsubscribe) bossesUnsubscribe();
        if(updateInterval) clearInterval(updateInterval);
    }
});

// Google Login
const provider = new GoogleAuthProvider();
forms.googleLoginBtn.addEventListener('click', async () => {
    try {
        forms.errorMsg.textContent = "Opening Google login...";
        forms.googleLoginBtn.disabled = true;
        await signInWithPopup(auth, provider);
        forms.errorMsg.textContent = "";
    } catch (error) {
        forms.errorMsg.textContent = error.message;
    } finally {
        forms.googleLoginBtn.disabled = false;
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
        updateInterval = setInterval(updateTimers, 1000); 
    });
}

function renderBossCards() {
    if(!globalBossesData || globalBossesData.length === 0) {
        ui.bossList.innerHTML = '<div class="empty-state">No channels added to this map yet.</div>';
        return;
    }

    ui.bossList.innerHTML = '';

    // pre-compute target times for sorting
    const nowSort = Date.now();
    globalBossesData.forEach(boss => {
        if (!boss.targetTime) {
            let sH = 0, sM = 0;
            if(boss.hhmmStr) {
                const p = boss.hhmmStr.split(':');
                sH = parseInt(p[0]) || 0;
                sM = parseInt(p[1]) || 0;
            } else if (boss.respawnLengthMin) {
                sH = Math.floor(boss.respawnLengthMin / 60);
                sM = boss.respawnLengthMin % 60;
            }
            const d = new Date();
            d.setHours(sH, sM, 0, 0);
            boss._sortTime = d.getTime();
        } else {
            boss._sortTime = boss.targetTime;
        }
    });

    // Sort: Started stages at the top, then upcoming stages
    globalBossesData.sort((a, b) => {
        const aSpawned = a._sortTime <= nowSort;
        const bSpawned = b._sortTime <= nowSort;
        if(aSpawned && !bSpawned) return -1;
        if(!aSpawned && bSpawned) return 1;
        return a._sortTime - b._sortTime;
    });

    globalBossesData.forEach(boss => {
        const card = document.createElement('div');
        card.className = 'boss-card';
        card.id = `boss-card-${boss.id}`;
        
        let sH="00", sM="00";
        if(boss.hhmmStr) {
            const p = boss.hhmmStr.split(':');
            sH = p[0].padStart(2, '0');
            sM = p[1].padStart(2, '0');
        } else if (boss.respawnLengthMin) {
            sH = Math.floor(boss.respawnLengthMin / 60).toString().padStart(2, '0');
            sM = (boss.respawnLengthMin % 60).toString().padStart(2, '0');
        }

        card.innerHTML = `
            <div class="boss-info">
                <h4>Channel ${boss.name}</h4>
                <p class="rule-text" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.2rem;">Respawn time: ${sH}:${sM}</p>
                <p class="spawn-time-text" style="color: var(--primary); font-weight: bold; margin-top: 4px; font-variant-numeric: tabular-nums; font-size: 1.1rem;"></p>
            </div>
            <div class="boss-actions">
                <button class="btn text-btn sm-btn" onclick="deleteBoss('${boss.id}')" style="color: var(--danger); font-size: 1.2rem; font-weight: bold;" title="Remove Channel">X</button>
            </div>
        `;
        ui.bossList.appendChild(card);
    });

    updateTimers();
}

function updateTimers() {
    const now = Date.now();
    globalBossesData.forEach(boss => {
        const card = document.getElementById(`boss-card-${boss.id}`);
        if(!card) return;

        const ruleText = card.querySelector('.rule-text');
        const spawnText = card.querySelector('.spawn-time-text');
        
        let sH="00", sM="00";
        if(boss.hhmmStr) {
            const p = boss.hhmmStr.split(':');
            sH = p[0].padStart(2, '0');
            sM = p[1].padStart(2, '0');
        } else if (boss.respawnLengthMin) {
            sH = Math.floor(boss.respawnLengthMin / 60).toString().padStart(2, '0');
            sM = (boss.respawnLengthMin % 60).toString().padStart(2, '0');
        }

        let isSpawned = false;
        let sText = "";
        let rText = `Respawn time: ${sH}:${sM}`;

        let targetEpoch = boss.targetTime;
        if(!targetEpoch) {
            const d = new Date();
            d.setHours(parseInt(sH));
            d.setMinutes(parseInt(sM));
            d.setSeconds(0);
            d.setMilliseconds(0);
            targetEpoch = d.getTime();
        }

        const TWO_HOURS = 2 * 60 * 60 * 1000;
        if (now - targetEpoch > TWO_HOURS) {
            if(!boss._deleting && currentMapId) {
                boss._deleting = true;
                deleteDoc(doc(db, `maps/${currentMapId}/bosses`, boss.id)).catch(console.error);
            }
            return;
        }

        const remainingMeta = targetEpoch - now;
        if (remainingMeta <= 0) {
            isSpawned = true;
            sText = "Stage start!!!";
        } else {
            const totalSeconds = Math.floor(remainingMeta / 1000);
            const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            sText = `Waiting in... ${h}:${m}:${s}`;
        }

        if (ruleText.textContent !== rText) {
             ruleText.textContent = rText;
        }
        if (spawnText.textContent !== sText) {
             spawnText.textContent = sText;
        }
        
        if (isSpawned) {
             spawnText.style.color = '#4ade80';
        } else {
             spawnText.style.color = 'var(--primary)';
        }
    });
}

window.deleteBoss = async (bossId) => {
    if(!currentMapId) return;
    if(confirm('Are you sure you want to remove this channel?')) {
        await deleteDoc(doc(db, `maps/${currentMapId}/bosses`, bossId));
        logActivity("Remove Channel", `Removed channel ID ${bossId} from map ID ${currentMapId}`);
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
        logActivity("Create Map", val);
        ui.mapModal.classList.remove('show');
        ui.newMapName.value = '';
    }
};

ui.deleteMapBtn.onclick = async () => {
    if(!currentMapId) return;
    if(confirm('Are you sure you want to delete this map entirely? All channels inside will be lost.')) {
        const deletedMapName = ui.currentMapTitle.textContent;
        // Technically this leaves dangling bosses in Firestore logic unless deleted recursively,
        // but it removes it from UI, keeping it simple for the free tier for now.
        await deleteDoc(doc(db, "maps", currentMapId));
        logActivity("Delete Map", deletedMapName);
        currentMapId = null;
        ui.currentMapTitle.textContent = "Select a Map";
        ui.addBossBtn.style.display = 'none';
        ui.deleteMapBtn.style.display = 'none';
        ui.bossList.innerHTML = '<div class="empty-state">No map selected.</div>';
    }
};

// Donate Modal
if(ui.donateBtn) {
    ui.donateBtn.onclick = () => {
        ui.donateModal.classList.add('show');
        const img = document.querySelector('.donate-qr');
        if (img && !img.src.includes('data:')) {
            const b64 = qrData.split('').reverse().join('');
            img.src = 'data:image/png;base64,' + b64;
        }
    };
    ui.closeDonateBtn.onclick = () => ui.donateModal.classList.remove('show');
}

// Boss Modal
ui.addBossBtn.onclick = () => ui.bossModal.classList.add('show');
ui.cancelBoss.onclick = () => { ui.bossModal.classList.remove('show'); ui.newBossName.value = ''; ui.newBossTime.value = ''; };

// Auto-format time input
ui.newBossTime.addEventListener('input', function(e) {
    if (e.inputType === 'deleteContentBackward') return;
    let val = this.value.replace(/[^\d]/g, '');
    
    if (ui.typeDuration.checked && val.length === 1) {
        // For Countdown, auto-prepend 0 for hours since max game respawn is 6 hrs
        val = '0' + val + ':';
    } else if (val.length >= 2) {
        val = val.substring(0, 2) + (val.length > 2 ? ':' + val.substring(2, 4) : ':');
    }
    
    this.value = val;
});

ui.saveBoss.onclick = async () => {
    const name = ui.newBossName.value.trim();
    const timeStr = ui.newBossTime.value.trim();
    
    if(name && timeStr.includes(':') && currentMapId) {
        const parts = timeStr.split(':');
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        const totalMin = (h * 60) + m;

        let targetEpoch = 0;
        const EIGHT_HOURS = 8 * 60 * 60 * 1000;
        let isDuration = ui.typeDuration.checked;
        let saveHhMmStr = "";

        if (isDuration) {
            targetEpoch = Date.now() + ((h * 60 * 60 * 1000) + (m * 60 * 1000));
            // Convert to absolute string for legacy fallback
            const resD = new Date(targetEpoch);
            saveHhMmStr = resD.getHours().toString().padStart(2,'0') + ":" + resD.getMinutes().toString().padStart(2,'0');

            if (targetEpoch > Date.now() + EIGHT_HOURS) {
                alert("Cannot track a countdown duration longer than 8 hours!");
                return;
            }
        } else {
            const nowd = new Date();
            targetEpoch = new Date(nowd.getFullYear(), nowd.getMonth(), nowd.getDate(), h, m, 0, 0).getTime();
            saveHhMmStr = timeStr;

            // Smart rollover for times typed near midnight
            if (targetEpoch < Date.now() - EIGHT_HOURS) targetEpoch += 24 * 60 * 60 * 1000;
            else if (targetEpoch > Date.now() + EIGHT_HOURS) targetEpoch -= 24 * 60 * 60 * 1000;

            if (Math.abs(targetEpoch - Date.now()) > EIGHT_HOURS) {
                alert("Cannot track a time that is more than 8 hours into the past or future!");
                return;
            }
        }

        await addDoc(collection(db, `maps/${currentMapId}/bosses`), {
            name: name,
            targetTime: targetEpoch,
            hhmmStr: saveHhMmStr,
            respawnLengthMin: totalMin 
        });
        logActivity("Add Channel", `Map [${ui.currentMapTitle.textContent}] Channel [${name}] | Time Set: ${saveHhMmStr}`);
        ui.bossModal.classList.remove('show');
        ui.newBossName.value = '';
        ui.newBossTime.value = '';
    } else {
        alert("Please enter a valid channel number and time in HH:MM format (like '02:30').");
    }
};

// ----------------- ADMIN UI LOGIC -----------------
let adminLogsUnsubscribe = null;
let adminBansUnsubscribe = null;

if (ui.adminBtn) {
    ui.adminBtn.onclick = () => {
        ui.adminModal.classList.add('show');
        loadAdminLogs();
        loadAdminBans();
    };

    ui.closeAdminBtn.onclick = () => {
        ui.adminModal.classList.remove('show');
        if (adminLogsUnsubscribe) adminLogsUnsubscribe();
        if (adminBansUnsubscribe) adminBansUnsubscribe();
    };

    ui.tabLogs.onclick = () => {
        ui.tabLogs.classList.add('active-tab');
        ui.tabBans.classList.remove('active-tab');
        ui.adminLogsContent.style.display = 'block';
        ui.adminBansContent.style.display = 'none';
    };

    ui.tabBans.onclick = () => {
        ui.tabBans.classList.add('active-tab');
        ui.tabLogs.classList.remove('active-tab');
        ui.adminBansContent.style.display = 'block';
        ui.adminLogsContent.style.display = 'none';
    };

    ui.banUserBtn.onclick = async () => {
        const emailToBan = ui.banEmailInput.value.trim().toLowerCase();
        if (emailToBan) {
            if (AdminEmails.includes(emailToBan)) {
                alert("Cannot ban another admin.");
                return;
            }
            if(confirm(`Are you sure you want to BAN ${emailToBan}?`)) {
                await setDoc(doc(db, "bannedUsers", emailToBan), { 
                    bannedAt: serverTimestamp(), 
                    bannedBy: auth.currentUser.email 
                });
                ui.banEmailInput.value = '';
            }
        }
    };
}

function loadAdminLogs() {
    ui.adminLogsList.innerHTML = "<li>Loading logs...</li>";
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50));
    adminLogsUnsubscribe = onSnapshot(q, (snapshot) => {
        ui.adminLogsList.innerHTML = '';
        if (snapshot.empty) {
             ui.adminLogsList.innerHTML = "<li>No recent logs.</li>";
             return;
        }
        snapshot.forEach(docSnap => {
             const d = docSnap.data();
             const timeStr = d.timestamp ? new Date(d.timestamp.toMillis()).toLocaleString() : "Just now";
             const li = document.createElement('li');
             li.style.marginBottom = "0.8rem";
             li.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
             li.style.paddingBottom = "0.5rem";
             li.innerHTML = `<strong style="color: var(--primary);">${d.userEmail || 'Unknown'}</strong> <span style="font-size: 0.75rem; color: var(--text-muted);">[${timeStr}]</span><br><span style="color: var(--text-main);">${d.action}</span>: <span style="color: var(--text-muted);">${d.details}</span>`;
             ui.adminLogsList.appendChild(li);
        });
    });
}

function loadAdminBans() {
    const q = query(collection(db, "bannedUsers"));
    adminBansUnsubscribe = onSnapshot(q, (snapshot) => {
        ui.bannedUsersList.innerHTML = '';
        if (snapshot.empty) {
             ui.bannedUsersList.innerHTML = "<li style='color: var(--text-muted);'>No banned users.</li>";
             return;
        }
        snapshot.forEach(docSnap => {
             const email = docSnap.id;
             const li = document.createElement('li');
             li.style.display = "flex";
             li.style.alignItems = "center";
             li.style.justifyContent = "space-between";
             li.style.marginBottom = "0.5rem";
             li.style.padding = "0.5rem";
             li.style.background = "rgba(15,23,42,0.6)";
             li.style.borderRadius = "6px";
             li.innerHTML = `<span style="word-break: break-all; margin-right: 1rem;">${email}</span> <button class="btn outline-btn sm-btn" style="color: var(--danger); border-color: var(--danger);" onclick="unbanUser('${email}')">Unban</button>`;
             ui.bannedUsersList.appendChild(li);
        });
    });
}

window.unbanUser = async (email) => {
    if(confirm(`Are you sure you want to unban ${email}? They will be able to log in again.`)) {
        await deleteDoc(doc(db, "bannedUsers", email));
    }
};
