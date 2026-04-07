import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, orderBy, limit, deleteField } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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

const EP_DATA = {
    13: ["Alemeth Forest", "Barha Forest", "Kalejimas Lounge", "Investigation Room"],
    12: ["Coastal Fortress", "Dingofasil District", "Storage Quarter", "Fortress Battlegrounds"],
    11: ["Laukyme Swamp", "Tyla Monastery", "Bellai Rainforest", "Zeraha", "Seir Rainforest"],
    10: ["Penitence Route", "Main Building", "Grand Corridor", "Sanctuary"],
    9: ["Goddess Ancient Garden", "Fedimian", "Fedimian Suburbs", "Mage Tower 1F", "Mage Tower 2F", "Mage Tower 3F"],
    8: ["Baron Allerno", "Aqueduct Bridge Area", "Demon Prison District 1", "Demon Prison District 3", "Demon Prison District 4", "Demon Prison District 5", "Gindari Gorge"],
    7: ["Rukas Plateau", "King's Plateau", "Zachariel Crossroads", "Mocia Forest", "Royal Mausoleum 1F", "Royal Mausoleum 2F", "Royal Mausoleum 3F"],
    6: ["Dina Bee Farm", "Vilna Forest", "Uskis Arable Land", "Spring Light Woods", "Gate Route", "Sirdgela Forest", "Kvailas Forest", "Origin Forest"],
    5: ["Karolis Springs", "Letas Stream", "Delmore Hamlet", "Delmore Manor", "Delmore Outskirts", "Pilgrim Road"],
    4: ["Veja Ravine", "Vieta Gorge", "Cobalt Forest", "Septyni Glen", "Pelke Shrine Ruins", "Absenta Reservoir", "Tenants Farm"],
    3: ["Koru Jungle", "Knidos Jungle", "Dadan Jungle", "Novaha Assembly Hall", "Novaha Annex", "Novaha Institute", "Mirkiti Farm"],
    2: ["Srautas Gorge", "Gele Plateau", "Nefritas Cliff", "Tenet Garden", "Tenet Church B1F", "Tenet Church 1F", "Tenet Church 2F"],
    1: ["Klaipeda", "Siauliai W. Forest", "Siauliai E. Forest", "Lemprasa Pond", "Siauliai Miners Village", "Crystal Mine"]
};

let currentEP = "13";
let editingBossId = null;

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
    epTabs: document.getElementById('ep-tabs'),
    mapTabs: document.getElementById('map-tabs'),

    currentMapTitle: document.getElementById('current-map-title'),
    addBossBtn: document.getElementById('add-boss-btn'),
    bossList: document.getElementById('boss-list'),

    notiBtn: document.getElementById('noti-btn'),

    bossModal: document.getElementById('boss-modal'),
    newBossName: document.getElementById('new-boss-name'),
    newBossTime: document.getElementById('new-boss-time'),
    cancelBoss: document.getElementById('cancel-boss-btn'),
    saveBoss: document.getElementById('save-boss-btn'),

    stageModal: document.getElementById('stage-modal'),
    stageModalTitle: document.getElementById('stage-modal-title'),
    stageInput: document.getElementById('stage-input'),
    cancelStage: document.getElementById('cancel-stage-btn'),
    saveStage: document.getElementById('save-stage-btn'),

    donateBtn: document.getElementById('donate-btn'),
    donateModal: document.getElementById('donate-modal'),
    closeDonateBtn: document.getElementById('close-donate-btn'),

    adminBtn: document.getElementById('admin-btn'),
    adminModal: document.getElementById('admin-modal'),
    closeAdminBtn: document.getElementById('close-admin-btn'),

    tabLogs: document.getElementById('tab-logs'),
    tabMembers: document.getElementById('tab-members'),
    tabRoles: document.getElementById('tab-roles'),
    adminLogsContent: document.getElementById('admin-logs-content'),
    adminMembersContent: document.getElementById('admin-members-content'),
    adminRolesContent: document.getElementById('admin-roles-content'),

    adminLogsTbody: document.getElementById('admin-logs-tbody'),
    adminMembersTbody: document.getElementById('admin-members-tbody'),
    clearLogsBtn: document.getElementById('clear-logs-btn'),

    newRoleName: document.getElementById('new-role-name'),
    permView: document.getElementById('perm-view'),
    permAdmin: document.getElementById('perm-admin'),
    permCreate: document.getElementById('perm-create'),
    permDelChannel: document.getElementById('perm-del-channel'),
    permDelAll: document.getElementById('perm-del-all'),
    noAccessPanel: document.getElementById('no-access-panel'),
    mainContent: document.getElementById('main-content'),
    saveRoleBtn: document.getElementById('save-role-btn'),
    rolesList: document.getElementById('roles-list'),

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

// Permissions state
let currentUserPerms = { view: false, admin: false, create: false, delete_channel: false, delete_all: false };

// ----------------- AUDIT LOGS -----------------
async function logActivity(action, details) {
    if (!auth.currentUser) return;
    try {
        await addDoc(collection(db, "auditLogs"), {
            action: action,
            details: details,
            userEmail: auth.currentUser.email,
            timestamp: serverTimestamp()
        });
    } catch (e) { console.error("Failed to log activity:", e); }
}

// ----------------- ROUTING / VIEWS -----------------
function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewName].classList.add('active');
}

// ----------------- AUTHENTICATION -----------------
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uEmail = user.email.toLowerCase();

        let currentRoleId = null;
        const memRef = doc(db, "members", uEmail);
        const memDoc = await getDoc(memRef);

        if (memDoc.exists()) {
            currentRoleId = memDoc.data().roleId;
        }

        // Track user in 'members' (no auto role assignment)
        await setDoc(memRef, { email: user.email, lastLogin: serverTimestamp() }, { merge: true });

        // Resolve Permissions
        let perms = { view: false, admin: false, create: false, delete_channel: false, delete_all: false };
        if (AdminEmails.includes(uEmail)) {
            perms = { view: true, admin: true, create: true, delete_channel: true, delete_all: true };
        } else {
            if (currentRoleId) {
                const roleDoc = await getDoc(doc(db, "roles", currentRoleId));
                if (roleDoc.exists()) {
                    const rp = roleDoc.data();
                    if (rp.view) perms.view = true;
                    if (rp.admin) perms.admin = true;
                    if (rp.create) perms.create = true;
                    if (rp.delChannel) perms.delete_channel = true;
                    if (rp.delAll) perms.delete_all = true;
                }
            }
        }
        currentUserPerms = perms;

        // Apply visual access
        ui.adminBtn.style.display = currentUserPerms.admin ? 'block' : 'none';
        ui.noAccessPanel.style.display = currentUserPerms.view ? 'none' : 'block';
        ui.mainContent.style.display = currentUserPerms.view ? 'block' : 'none';

        switchView('dashboard');
        forms.userEmail.textContent = user.email;
        if (currentUserPerms.view) loadMaps();
    } else {
        switchView('auth');
        // Cleanup listeners when logged out
        if (mapsUnsubscribe) mapsUnsubscribe();
        if (bossesUnsubscribe) bossesUnsubscribe();
        if (updateInterval) clearInterval(updateInterval);

        // Cleanup all background listeners
        Object.values(globalMapListeners).forEach(unsub => unsub());
        globalMapListeners = {};
        globalAllBosses = [];
        notifiedBosses = {};
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

// ----------------- NOTIFICATIONS -----------------
if (ui.notiBtn) {
    if (Notification.permission === 'granted') {
        ui.notiBtn.style.color = '#10b981';
        ui.notiBtn.style.borderColor = '#10b981';
        ui.notiBtn.textContent = '🔔 Notis On';
    }
    ui.notiBtn.onclick = () => {
        if (Notification.permission === 'granted') {
            alert('Notifications are already enabled!');
            return;
        }
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                ui.notiBtn.style.color = '#10b981';
                ui.notiBtn.style.borderColor = '#10b981';
                ui.notiBtn.textContent = '🔔 Notis On';
                new Notification('TOSM Tracker', { body: 'Notifications enabled successfully!' });
            } else {
                alert('Notification permission was denied.');
            }
        });
    };
}
let notifiedBosses = {};

// ----------------- MAPS LOGIC -----------------
let globalMapListeners = {};
let globalAllBosses = []; // Flat array of all bosses across the game

// Helper to check if a map or EP is "On Fire" (5 mins before spawn OR spawned)
function getFireIconHTML(epKey = null, mapName = null) {
    const now = Date.now();
    const FIVE_MINS = 5 * 60 * 1000;

    let isFire = false;

    if (mapName) {
        // Check specific map (within 5 mins of spawning OR already spawned)
        isFire = globalAllBosses.some(b => b.mapId === mapName && b.targetTime && (b.targetTime - now) <= FIVE_MINS);
    } else if (epKey) {
        // Check all maps in EP
        const epMaps = EP_DATA[epKey] || [];
        isFire = globalAllBosses.some(b => epMaps.includes(b.mapId) && b.targetTime && (b.targetTime - now) <= FIVE_MINS);
    }

    return isFire ? ' <span style="color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);">🔥</span>' : '';
}

// Global listener to track all channels for fire icons
function startGlobalListeners() {
    if (Object.keys(globalMapListeners).length > 0) return; // Already started

    Object.keys(EP_DATA).forEach(ep => {
        EP_DATA[ep].forEach(mapId => {
            const q = query(collection(db, `maps/${mapId}/bosses`));
            globalMapListeners[mapId] = onSnapshot(q, (snapshot) => {
                // Remove old bosses for this map
                globalAllBosses = globalAllBosses.filter(b => b.mapId !== mapId);

                snapshot.forEach(docSnap => {
                    globalAllBosses.push({ id: docSnap.id, mapId: mapId, ...docSnap.data() });
                });

                // Triggers an update to the Tabs HTML
                updateTabIcons();
            });
        });
    });
}

function updateTabIcons() {
    if (!auth.currentUser || !currentEP) return;

    // Update EP tabs
    Array.from(ui.epTabs.children).forEach(t => {
        const epNum = t.getAttribute('data-ep');
        if (!epNum) return;
        const text = `EP ${epNum}`;
        const fire = getFireIconHTML(epNum, null);
        if (t.innerHTML !== text + fire) {
            t.innerHTML = text + fire;
        }
    });

    // Update Map tabs
    Array.from(ui.mapTabs.children).forEach(t => {
        const mName = t.getAttribute('data-map');
        if (!mName) return;
        const fire = getFireIconHTML(null, mName);
        if (t.innerHTML !== mName + fire) {
            t.innerHTML = mName + fire;
        }
    });
}

function loadMaps() {
    startGlobalListeners();
    ui.epTabs.innerHTML = '';
    const eps = Object.keys(EP_DATA).sort((a, b) => parseInt(b) - parseInt(a)); // Descending EP

    eps.forEach(ep => {
        const btn = document.createElement('div');
        btn.className = `tab ${currentEP === ep ? 'active-tab' : ''}`;
        btn.setAttribute('data-ep', ep);
        btn.innerHTML = `EP ${ep}` + getFireIconHTML(ep, null);
        btn.onclick = () => selectEP(ep);
        ui.epTabs.appendChild(btn);
    });

    selectEP(eps[0]); // Auto select newest EP
}

function selectEP(epKey) {
    currentEP = epKey;
    // Update EP tabs visually
    Array.from(ui.epTabs.children).forEach(t => {
        if (t.textContent === `EP ${epKey}`) t.classList.add('active-tab');
        else t.classList.remove('active-tab');
    });

    // Render maps for this EP
    ui.mapTabs.innerHTML = '';
    const maps = EP_DATA[epKey];
    if (maps && maps.length > 0) {
        // Sort maps descending by reversing the array so later maps show up first
        const sortedMaps = maps.slice().reverse();
        sortedMaps.forEach(mapName => {
            const btn = document.createElement('div');
            btn.className = `tab`;
            btn.setAttribute('data-map', mapName);
            btn.innerHTML = mapName + getFireIconHTML(null, mapName);
            btn.onclick = () => selectMap(mapName);
            ui.mapTabs.appendChild(btn);
        });
        selectMap(sortedMaps[0]);
    } else {
        ui.mapTabs.innerHTML = '<div class="empty-state" style="padding:0; margin:0; font-size: 0.85rem;">No maps here yet</div>';
        currentMapId = null;
        ui.currentMapTitle.textContent = "Select a Map";
        ui.addBossBtn.style.display = 'none';
        ui.bossList.innerHTML = '<div class="empty-state">No map selected.</div>';
    }
}

function selectMap(name) {
    // We use the full Map Name directly as the currentMapId!
    currentMapId = name;
    ui.currentMapTitle.textContent = name;

    // UI perms apply
    ui.addBossBtn.style.display = currentUserPerms.create ? 'block' : 'none';

    // update tab UI
    Array.from(ui.mapTabs.children).forEach(t => {
        if (t.getAttribute('data-map') === name) t.classList.add('active-tab');
        else t.classList.remove('active-tab');
    });
    loadBosses(name);
}

// ----------------- BOSS LOGIC -----------------
function loadBosses(mapId) {
    if (bossesUnsubscribe) bossesUnsubscribe();
    if (updateInterval) clearInterval(updateInterval);

    const q = query(collection(db, `maps/${mapId}/bosses`));
    bossesUnsubscribe = onSnapshot(q, (snapshot) => {
        globalBossesData = [];
        snapshot.forEach(doc => {
            globalBossesData.push({ id: doc.id, ...doc.data() });
        });
        renderBossCards();
        // start UI timer update loop
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(updateTimers, 1000);
    });
}

function renderBossCards() {
    if (!globalBossesData || globalBossesData.length === 0) {
        ui.bossList.innerHTML = '<div class="empty-state">No channels added to this map yet.</div>';
        return;
    }

    ui.bossList.innerHTML = '';

    // pre-compute target times for sorting
    const nowSort = Date.now();
    globalBossesData.forEach(boss => {
        if (!boss.targetTime) {
            let sH = 0, sM = 0;
            if (boss.hhmmStr) {
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
        if (aSpawned && !bSpawned) return -1;
        if (!aSpawned && bSpawned) return 1;
        return a._sortTime - b._sortTime;
    });

    globalBossesData.forEach(boss => {
        const card = document.createElement('div');
        card.className = 'boss-card';
        card.id = `boss-card-${boss.id}`;

        let sH = "00", sM = "00";
        if (boss.hhmmStr) {
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
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'boss-actions';
        let actHtml = '';
        if (currentUserPerms.create) {
            actHtml += `<button class="btn text-btn sm-btn" id="stage-btn-${boss.id}" style="display:none; color: #f97316; font-size: 1.2rem;" title="Set Stage" onclick="setStage('${boss.id}', '${boss.name}')">📊</button>`;
            actHtml += `<button class="btn text-btn sm-btn" style="color: var(--primary); font-size: 1.2rem; margin-right: 0.5rem;" title="Reset Timer" onclick="editBoss('${boss.id}', '${boss.name}')">⏱️</button>`;
        }
        if (currentUserPerms.delete_all || currentUserPerms.delete_channel) {
            actHtml += `<button class="btn text-btn sm-btn" onclick="deleteBoss('${boss.id}', '${boss.name}')" style="color: var(--danger); font-size: 1.2rem; font-weight: bold;" title="Remove Channel">X</button>`;
        }
        if (actHtml) {
            actionsDiv.innerHTML = actHtml;
            card.appendChild(actionsDiv);
        }

        ui.bossList.appendChild(card);
    });

    updateTimers();
}

function updateTimers() {
    const now = Date.now();
    globalBossesData.forEach(boss => {
        const card = document.getElementById(`boss-card-${boss.id}`);
        if (!card) return;

        const ruleText = card.querySelector('.rule-text');
        const spawnText = card.querySelector('.spawn-time-text');

        let sH = "00", sM = "00";
        if (boss.hhmmStr) {
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
        if (!targetEpoch) {
            const d = new Date();
            d.setHours(parseInt(sH));
            d.setMinutes(parseInt(sM));
            d.setSeconds(0);
            d.setMilliseconds(0);
            targetEpoch = d.getTime();
        }

        const TWO_HOURS = 2 * 60 * 60 * 1000;
        if (now - targetEpoch > TWO_HOURS) {
            if (!boss._deleting && currentMapId) {
                boss._deleting = true;
                deleteDoc(doc(db, `maps/${currentMapId}/bosses`, boss.id)).catch(console.error);
            }
            return;
        }

        const remainingMeta = targetEpoch - now;

        // Notify if it just spawned (within the last 2 minutes, and not already notified for this exact targetTime)
        if (remainingMeta <= 0 && remainingMeta > -120000) {
            if (notifiedBosses[boss.id] !== targetEpoch && Notification.permission === 'granted') {
                new Notification('TOSM Boss Spawned!', {
                    body: `Channel ${boss.name} in ${currentMapId} has entered Stage Start!!!`,
                    icon: 'favicon.ico'
                });
                notifiedBosses[boss.id] = targetEpoch;
            }
        }

        if (remainingMeta <= 0) {
            isSpawned = true;

            // Auto-init stage to 1 on first spawn
            if ((boss.stage === undefined || boss.stage === null) && !boss._stageInit && currentMapId) {
                boss._stageInit = true;
                updateDoc(doc(db, `maps/${currentMapId}/bosses`, boss.id), { stage: 1 }).catch(console.error);
            }

            const elapsedSeconds = Math.floor(Math.abs(remainingMeta) / 1000);
            const eh = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
            const em = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
            const es = (elapsedSeconds % 60).toString().padStart(2, '0');
            const stageNum = boss.stage ?? 1;
            const stageBadge = `<span style="font-size: 0.85rem; margin-left: 0.5rem; background: rgba(249,115,22,0.15); color: #f97316; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(249,115,22,0.4);">Stage ${stageNum}</span>`;
            sText = `<span style="color: #4ade80;">Stage start!!!</span> <span style="font-size: 0.85rem; margin-left: 0.5rem; background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.3);">Elapsed: ${eh}:${em}:${es}</span>${stageBadge}`;

            const stageBtn = document.getElementById(`stage-btn-${boss.id}`);
            if (stageBtn) stageBtn.style.display = 'inline-flex';
        } else {
            const stageBtn = document.getElementById(`stage-btn-${boss.id}`);
            if (stageBtn) stageBtn.style.display = 'none';
            const totalSeconds = Math.floor(remainingMeta / 1000);
            const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            sText = `<span style="color: var(--text-muted);">Waiting in...</span> <span style="color: var(--primary); margin-left: 0.25rem;">${h}:${m}:${s}</span>`;
        }

        if (ruleText.textContent !== rText) {
            ruleText.textContent = rText;
        }
        if (spawnText.innerHTML !== sText) {
            spawnText.innerHTML = sText;
        }
    });

    // Also trigger update for Tabs so Fire Icons appear dynamically
    updateTabIcons();
}

window.deleteBoss = async (bossId, bossName) => {
    if (!currentUserPerms.delete_channel && !currentUserPerms.delete_all) {
        alert("You do not have permission to delete channels.");
        return;
    }
    if (!currentMapId) return;
    if (confirm('Are you sure you want to remove this channel?')) {
        await deleteDoc(doc(db, `maps/${currentMapId}/bosses`, bossId));
        logActivity("Remove Channel", `Removed channel [${bossName}] from map [${ui.currentMapTitle.textContent}]`);
    }
};

let stagingBossId = null;

window.setStage = (bossId, channelName) => {
    stagingBossId = bossId;
    ui.stageModalTitle.textContent = `Set Stage — Ch. ${channelName}`;
    ui.stageInput.value = '';
    ui.stageModal.classList.add('show');
};

ui.cancelStage.onclick = () => {
    ui.stageModal.classList.remove('show');
    stagingBossId = null;
};

ui.saveStage.onclick = async () => {
    const val = parseFloat(ui.stageInput.value);
    if (isNaN(val) || val < 1 || val > 5) {
        alert('Stage must be between 1 and 5.');
        return;
    }
    const rounded = Math.round(val * 10) / 10;
    await updateDoc(doc(db, `maps/${currentMapId}/bosses`, stagingBossId), { stage: rounded });
    logActivity("Set Stage", `Map [${ui.currentMapTitle.textContent}] Channel stage set to ${rounded}`);
    ui.stageModal.classList.remove('show');
    stagingBossId = null;
};

window.editBoss = (bossId, channelName) => {
    if (!currentUserPerms.create) return;
    editingBossId = bossId;
    ui.bossModal.querySelector('h3').textContent = `Reset Respawn: Ch. ${channelName}`;
    ui.newBossName.value = channelName;
    ui.newBossName.disabled = true;
    ui.newBossName.parentElement.style.display = 'none';
    resetBossModal();
    ui.bossModal.classList.add('show');
};

// ----------------- MODAL INTERACTIONS -----------------
const resetBossModal = () => {
    ui.typeDuration.checked = true;
    ui.timeInputLabel.textContent = "Duration (HH:MM from now)";
    ui.newBossTime.placeholder = "E.g. 02:15";
    ui.newBossTime.value = '';
};

ui.addBossBtn.onclick = () => {
    editingBossId = null;
    ui.bossModal.querySelector('h3').textContent = "Add New Channel";
    ui.newBossName.disabled = false;
    ui.newBossName.parentElement.style.display = 'flex';
    ui.newBossName.value = '';
    resetBossModal();
    ui.bossModal.classList.add('show');
};

// Donate Modal
if (ui.donateBtn) {
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

ui.cancelBoss.onclick = () => { ui.bossModal.classList.remove('show'); ui.newBossName.value = ''; resetBossModal(); };

ui.stageInput.addEventListener('input', function (e) {
    if (e.inputType === 'deleteContentBackward') return;
    let val = this.value.replace(/[^\d.]/g, '');
    const digits = val.replace(/\./g, '');
    if (digits.length === 1 && !val.includes('.')) {
        val = digits + '.';
    }
    this.value = val;
});

// Auto-format time input
ui.newBossTime.addEventListener('input', function (e) {
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
    if (!currentUserPerms.create) {
        alert("You do not have permission to create channels.");
        return;
    }
    const name = ui.newBossName.value.trim();

    const timeStr = ui.newBossTime.value.trim();

    if (name && timeStr.includes(':') && currentMapId) {
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
            saveHhMmStr = resD.getHours().toString().padStart(2, '0') + ":" + resD.getMinutes().toString().padStart(2, '0');

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

        if (editingBossId) {
            await updateDoc(doc(db, `maps/${currentMapId}/bosses`, editingBossId), {
                targetTime: targetEpoch,
                hhmmStr: saveHhMmStr,
                respawnLengthMin: totalMin,
                stage: deleteField()
            });
            logActivity("Reset Timer", `Map [${ui.currentMapTitle.textContent}] Channel [${name}] | New Time: ${saveHhMmStr}`);
        } else {
            await addDoc(collection(db, `maps/${currentMapId}/bosses`), {
                name: name,
                targetTime: targetEpoch,
                hhmmStr: saveHhMmStr,
                respawnLengthMin: totalMin
            });
            logActivity("Add Channel", `Map [${ui.currentMapTitle.textContent}] Channel [${name}] | Time Set: ${saveHhMmStr}`);
        }
        ui.bossModal.classList.remove('show');
        editingBossId = null;
        ui.newBossName.value = '';
        ui.newBossTime.value = '';
    } else {
        alert("Please enter a valid channel number and time in HH:MM format (like '02:30').");
    }
};

// ----------------- ADMIN UI LOGIC (RBAC) -----------------
let adminLogsUnsubscribe = null;
let adminMembersUnsubscribe = null;
let adminRolesUnsubscribe = null;

let globalRolesList = [];

// Tab Display Helper
function switchAdminTab(showId) {
    ui.adminLogsContent.style.display = 'none';
    ui.adminMembersContent.style.display = 'none';
    ui.adminRolesContent.style.display = 'none';
    ui.tabLogs.classList.remove('active-tab');
    ui.tabMembers.classList.remove('active-tab');
    ui.tabRoles.classList.remove('active-tab');

    if (showId === 'logs') { ui.adminLogsContent.style.display = 'block'; ui.tabLogs.classList.add('active-tab'); }
    if (showId === 'members') { ui.adminMembersContent.style.display = 'block'; ui.tabMembers.classList.add('active-tab'); }
    if (showId === 'roles') { ui.adminRolesContent.style.display = 'block'; ui.tabRoles.classList.add('active-tab'); }
}

if (ui.adminBtn) {
    ui.adminBtn.onclick = () => {
        ui.adminModal.classList.add('show');
        loadAdminRoles(); // Fetch roles first so members dropdown has data mapped
        loadAdminLogs();
    };

    ui.closeAdminBtn.onclick = () => {
        ui.adminModal.classList.remove('show');
        if (adminLogsUnsubscribe) adminLogsUnsubscribe();
        if (adminMembersUnsubscribe) adminMembersUnsubscribe();
        if (adminRolesUnsubscribe) adminRolesUnsubscribe();
    };

    ui.tabLogs.onclick = () => switchAdminTab('logs');
    ui.tabMembers.onclick = () => switchAdminTab('members');
    ui.tabRoles.onclick = () => switchAdminTab('roles');

    // Clear Logs Button
    ui.clearLogsBtn.onclick = async () => {
        if (!confirm('Delete all audit logs? This cannot be undone.')) return;
        const snapshot = await getDocs(collection(db, "auditLogs"));
        const deletes = snapshot.docs.map(d => deleteDoc(doc(db, "auditLogs", d.id)));
        await Promise.all(deletes);
    };

    // Save Role Button
    ui.saveRoleBtn.onclick = async () => {
        const rName = ui.newRoleName.value.trim();
        if (!rName) { alert("Need Role Name"); return; }

        await setDoc(doc(collection(db, "roles")), {
            name: rName,
            view: ui.permView.checked,
            admin: ui.permAdmin.checked,
            create: ui.permCreate.checked,
            delChannel: ui.permDelChannel.checked,
            delAll: ui.permDelAll.checked
        });
        ui.newRoleName.value = '';
        ui.permView.checked = false;
        ui.permAdmin.checked = false;
        ui.permCreate.checked = false;
        ui.permDelChannel.checked = false;
        ui.permDelAll.checked = false;
    };
}

function loadAdminRoles() {
    const q = query(collection(db, "roles"));
    adminRolesUnsubscribe = onSnapshot(q, (snapshot) => {
        ui.rolesList.innerHTML = '';
        globalRolesList = [];
        snapshot.forEach(docSnap => {
            const r = { id: docSnap.id, ...docSnap.data() };
            globalRolesList.push(r);

            let permsText = [];
            if (r.view) permsText.push("View");
            if (r.admin) permsText.push("Admin Dashboard");
            if (r.create) permsText.push("Create");
            if (r.delChannel) permsText.push("Delete Channel");
            if (r.delAll) permsText.push("Delete Everything");

            const li = document.createElement('li');
            li.style.marginBottom = "0.6rem";
            li.style.padding = "0.5rem";
            li.style.background = "rgba(255,255,255,0.05)";
            li.style.borderRadius = "4px";
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            li.innerHTML = `
                <div>
                   <strong style="color:var(--primary);">${r.name}</strong><br>
                   <span style="color:var(--text-muted); font-size: 0.75rem;">${permsText.join(', ') || 'No Permissions'}</span>
                </div>
                <button class="btn text-btn sm-btn" style="color: var(--danger); padding:0;" onclick="deleteRole('${r.id}')">Delete</button>
             `;
            ui.rolesList.appendChild(li);
        });
        loadAdminMembers(); // Once roles are loaded, render Members (so dropdown selects have roles)
    });
}

function loadAdminLogs() {
    ui.adminLogsTbody.innerHTML = "<tr><td colspan='3' style='padding: 0.8rem;'>Loading...</td></tr>";
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(60));
    adminLogsUnsubscribe = onSnapshot(q, (snapshot) => {
        ui.adminLogsTbody.innerHTML = '';
        if (snapshot.empty) {
            ui.adminLogsTbody.innerHTML = "<tr><td colspan='3' style='padding: 0.8rem;'>No recent logs.</td></tr>";
            return;
        }
        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const timeStr = d.timestamp ? new Date(d.timestamp.toMillis()).toLocaleString() : "Now";
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
            tr.innerHTML = `
                <td style="padding: 0.5rem; color:var(--text-main);">${d.userEmail || 'Unknown'}</td>
                <td style="padding: 0.5rem; color:var(--text-muted);">${d.action} <span style="font-size:0.75rem">(${d.details})</span></td>
                <td style="padding: 0.5rem; color:var(--text-muted); font-size:0.75rem;">${timeStr}</td>
             `;
            ui.adminLogsTbody.appendChild(tr);
        });
    });
}

function loadAdminMembers() {
    const q = query(collection(db, "members"));
    if (adminMembersUnsubscribe) adminMembersUnsubscribe();
    adminMembersUnsubscribe = onSnapshot(q, (snapshot) => {
        ui.adminMembersTbody.innerHTML = '';
        if (snapshot.empty) {
            ui.adminMembersTbody.innerHTML = "<tr><td colspan='2' style='padding: 0.8rem;'>No members found.</td></tr>";
            return;
        }
        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const email = docSnap.id;
            let roleOptionsHTML = `<option value="">-- No Permissions --</option>`;
            globalRolesList.forEach(r => {
                const sel = (d.roleId === r.id) ? "selected" : "";
                roleOptionsHTML += `<option value="${r.id}" ${sel}>${r.name}</option>`;
            });

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";

            // Superadmin badge override
            let selectBlock = `<select onchange="updateMemberRole('${email}', this.value)" style="background:rgba(15,23,42,0.8); color:white; padding:0.4rem; border-radius:4px; border:1px solid var(--card-border); max-width: 150px;">${roleOptionsHTML}</select>`;
            if (AdminEmails.includes(email)) {
                selectBlock = `<span style="color:#f59e0b; font-weight:bold;">Super Admin (Locked)</span>`;
            }

            tr.innerHTML = `
                <td style="padding: 0.8rem; color:var(--text-main); word-break: break-all;">${email}</td>
                <td style="padding: 0.8rem;">${selectBlock}</td>
             `;
            ui.adminMembersTbody.appendChild(tr);
        });
    });
}

window.deleteRole = async (roleId) => {
    if (confirm("Delete this role entirely? Members assigned to this role will lose their special permissions.")) {
        await deleteDoc(doc(db, "roles", roleId));
    }
};

window.updateMemberRole = async (email, roleId) => {
    // Empty value = remove role entirely (back to basic authenticated user)
    await updateDoc(doc(db, "members", email), { roleId: roleId });
};
