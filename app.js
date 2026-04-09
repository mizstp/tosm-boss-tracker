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
    15: [{id:"Jeromel Square",label:"Jeromel Square(115)"},{id:"Jonael Memorial Dist.",label:"Jonael Memorial Dist.(118)"},{id:"Taniel I Memorial Dist.",label:"Taniel I Memorial Dist.(120)"},{id:"Timerys Temple",label:"Timerys Temple(123)"}],
    14: [{id:"Neto Mori",label:"Neto Mori(105)"},{id:"Svarfingas Forest",label:"Svarfingas Forest(107)"},{id:"Radal Forest",label:"Radal Forest(109)"},{id:"Tevlin Caves Section 1",label:"Tevlin Caves Section 1(111)"},{id:"Tevlin Caves Section 2",label:"Tevlin Caves Section 2(113)"}],
    13: [{id:"Alemeth Forest",label:"Alemeth Forest(95)"},{id:"Barha Forest",label:"Barha Forest(98)"},{id:"Kalejimas Lounge",label:"Kalejimas Lounge(101)"},{id:"Investigation Room",label:"Investigation Room(103)"}],
    12: [{id:"Coastal Fortress",label:"Coastal Fortress(90)"},{id:"Dingofasil District",label:"Dingofasil District(91)"},{id:"Storage Quarter",label:"Storage Quarter(92)"},{id:"Fortress Battlegrounds",label:"Fortress Battlegrounds(93)"}],
    11: [{id:"Laukyme Swamp",label:"Laukyme Swamp(85)"},{id:"Tyla Monastery",label:"Tyla Monastery(86)"},{id:"Bellai Rainforest",label:"Bellai Rainforest(87)"},{id:"Zeraha",label:"Zeraha(88)"},{id:"Seir Rainforest",label:"Seir Rainforest(89)"}],
    10: [{id:"Penitence Route",label:"Penitence Route(80)"},{id:"Main Building",label:"Main Building(81)"},{id:"Grand Corridor",label:"Grand Corridor(82)"},{id:"Sanctuary",label:"Sanctuary(83)"}],
    9:  [{id:"Goddess Ancient Garden",label:"Goddess Ancient Garden(75)"},{id:"Fedimian Suburbs",label:"Fedimian Suburbs(76)"},{id:"Mage Tower 1F",label:"Mage Tower 1F(77)"},{id:"Mage Tower 2F",label:"Mage Tower 2F(78)"},{id:"Mage Tower 3F",label:"Mage Tower 3F(79)"}],
    8:  [{id:"Baron Allerno",label:"Baron Allerno(70)"},{id:"Aqueduct Bridge Area",label:"Aqueduct Bridge Area(70)"},{id:"Demon Prison District 1",label:"Demon Prison District 1(71)"},{id:"Demon Prison District 3",label:"Demon Prison District 3(72)"},{id:"Demon Prison District 4",label:"Demon Prison District 4(73)"},{id:"Demon Prison District 5",label:"Demon Prison District 5(74)"}],
    7:  [{id:"Rukas Plateau",label:"Rukas Plateau(60)"},{id:"King's Plateau",label:"King's Plateau(61)"},{id:"Zachariel Crossroads",label:"Zachariel Crossroads(62)"},{id:"Royal Mausoleum 1F",label:"Royal Mausoleum 1F(64)"},{id:"Royal Mausoleum 2F",label:"Royal Mausoleum 2F(66)"},{id:"Royal Mausoleum 3F",label:"Royal Mausoleum 3F(68)"}],
    6:  [{id:"Dina Bee Farm",label:"Dina Bee Farm(50)"},{id:"Vilna Forest",label:"Vilna Forest(52)"},{id:"Uskis Arable Land",label:"Uskis Arable Land(54)"},{id:"Spring Light Woods",label:"Spring Light Woods(56)"},{id:"Gate Route",label:"Gate Route(57)"},{id:"Sirdgela Forest",label:"Sirdgela Forest(58)"},{id:"Kvailas Forest",label:"Kvailas Forest(59)"},{id:"Origin Forest",label:"Origin Forest(60)"}],
    5:  [{id:"Karolis Springs",label:"Karolis Springs(40)"},{id:"Letas Stream",label:"Letas Stream(42)"},{id:"Delmore Hamlet",label:"Delmore Hamlet(44)"},{id:"Delmore Manor",label:"Delmore Manor(46)"},{id:"Delmore Outskirts",label:"Delmore Outskirts(48)"}],
    4:  [{id:"Veja Ravine",label:"Veja Ravine(30)"},{id:"Vieta Gorge",label:"Vieta Gorge(31)"},{id:"Cobalt Forest",label:"Cobalt Forest(32)"},{id:"Septyni Glen",label:"Septyni Glen(34)"},{id:"Pelke Shrine Ruins",label:"Pelke Shrine Ruins(36)"},{id:"Absenta Reservoir",label:"Absenta Reservoir(38)"}],
    3:  [{id:"Koru Jungle",label:"Koru Jungle(20)"},{id:"Knidos Jungle",label:"Knidos Jungle(21)"},{id:"Dadan Jungle",label:"Dadan Jungle(22)"},{id:"Novaha Assembly Hall",label:"Novaha Assembly Hall(24)"},{id:"Novaha Annex",label:"Novaha Annex(26)"},{id:"Novaha Institute",label:"Novaha Institute(28)"}],
    2:  [{id:"Srautas Gorge",label:"Srautas Gorge(10)"},{id:"Gele Plateau",label:"Gele Plateau(11)"},{id:"Nefritas Cliff",label:"Nefritas Cliff(12)"},{id:"Tenet Garden",label:"Tenet Garden(13)"},{id:"Tenet Church B1F",label:"Tenet Church B1F(15)"},{id:"Tenet Church 1F",label:"Tenet Church 1F(17)"},{id:"Tenet Church 2F",label:"Tenet Church 2F(19)"}],
    1:  [{id:"Siauliai W. Forest",label:"Siauliai W. Forest(1)"},{id:"Siauliai E. Forest",label:"Siauliai E. Forest(3)"},{id:"Lemprasa Pond",label:"Lemprasa Pond(5)"},{id:"Siauliai Miners Village",label:"Siauliai Miners Village(7)"},{id:"Crystal Mine",label:"Crystal Mine(9)"}]
};

const EP_GROUPS = {
    '14-15': [14, 15],
    '9-13':  [9, 10, 11, 12, 13],
    '5-8':   [5, 6, 7, 8],
    '1-4':   [1, 2, 3, 4]
};
let currentGroup = '14-15';
let currentEP = "15";
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
    groupTabs: document.getElementById('group-tabs'),
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
        if (currentUserPerms.view) {
            loadGroups();
            startGlobalListeners(currentGroup);
            loadMaps();
        }
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
        isFire = globalAllBosses.some(b => epMaps.some(m => m.id === b.mapId) && b.targetTime && (b.targetTime - now) <= FIVE_MINS);
    }

    return isFire ? ' <span style="color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);">🔥</span>' : '';
}

// Global listener to track all channels for fire icons (only active group)
function startGlobalListeners(group) {
    // Close existing listeners
    Object.values(globalMapListeners).forEach(unsub => unsub());
    globalMapListeners = {};
    globalAllBosses = [];

    const epKeys = EP_GROUPS[group] || [];
    epKeys.forEach(ep => {
        (EP_DATA[ep] || []).forEach(({ id: mapId }) => {
            const q = query(collection(db, `maps/${mapId}/bosses`));
            globalMapListeners[mapId] = onSnapshot(q, (snapshot) => {
                globalAllBosses = globalAllBosses.filter(b => b.mapId !== mapId);
                snapshot.forEach(docSnap => {
                    globalAllBosses.push({ id: docSnap.id, mapId: mapId, ...docSnap.data() });
                });
                updateTabIcons();
                updateStagePanel();
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
        const mId = t.getAttribute('data-map');
        const mLabel = t.getAttribute('data-map-label');
        if (!mId || !mLabel) return;
        const fire = getFireIconHTML(null, mId);
        if (t.innerHTML !== mLabel + fire) {
            t.innerHTML = mLabel + fire;
        }
    });
}

function updateStagePanel() {
    const list = document.getElementById('stage-sidebar-list');
    if (!list) return;
    const now = Date.now();

    const spawned = globalAllBosses.filter(b => b.targetTime && b.targetTime <= now);

    if (spawned.length === 0) {
        list.innerHTML = '<div class="empty-state" style="font-size:0.8rem;">No active stages</div>';
        return;
    }

    // Sort: highest stage first, then most recently spawned as tiebreak
    spawned.sort((a, b) => {
        const stageDiff = (b.stage ?? 1) - (a.stage ?? 1);
        return stageDiff !== 0 ? stageDiff : b.targetTime - a.targetTime;
    });

    list.innerHTML = spawned.map(b => {
        let mapLabel = b.mapId;
        for (const ep of Object.values(EP_DATA)) {
            const found = ep.find(m => m.id === b.mapId);
            if (found) { mapLabel = found.label; break; }
        }
        const stage = b.stage ?? 1;
        return `<div class="sidebar-item" onclick="navigateToMap('${b.mapId.replace(/'/g, "\\'")}')">
            <div class="sidebar-item-map">${mapLabel}</div>
            <div class="sidebar-item-meta">Ch.${b.name} &middot; Stage ${stage}</div>
        </div>`;
    }).join('');
}

// Sidebar toggle — PC defaults open, mobile defaults closed
let sidebarOpen = window.innerWidth > 768;

function applysidebar() {
    const sidebar = document.getElementById('stage-sidebar');
    const openBtn = document.getElementById('sidebar-open-btn');
    if (!sidebar || !openBtn) return;
    if (sidebarOpen) {
        sidebar.classList.remove('sidebar-collapsed');
        openBtn.classList.remove('visible');
    } else {
        sidebar.classList.add('sidebar-collapsed');
        openBtn.classList.add('visible');
    }
}

window.toggleSidebar = function() {
    sidebarOpen = !sidebarOpen;
    applysidebar();
};

// Apply initial sidebar state (module is deferred so DOM is already ready)
applysidebar();

window.navigateToMap = function(mapId) {
    const groupEPs = EP_GROUPS[currentGroup] || [];
    for (const ep of groupEPs) {
        const found = (EP_DATA[ep] || []).find(m => m.id === mapId);
        if (found) {
            selectEP(String(ep));
            selectMap(mapId);
            return;
        }
    }
};

function loadGroups() {
    ui.groupTabs.innerHTML = '';
    Object.keys(EP_GROUPS).forEach(g => {
        const btn = document.createElement('div');
        btn.className = `tab ${currentGroup === g ? 'active-tab' : ''}`;
        btn.setAttribute('data-group', g);
        btn.textContent = `EP ${g}`;
        btn.onclick = () => selectGroup(g);
        ui.groupTabs.appendChild(btn);
    });
}

function selectGroup(g) {
    currentGroup = g;
    Array.from(ui.groupTabs.children).forEach(t => {
        t.classList.toggle('active-tab', t.getAttribute('data-group') === g);
    });
    startGlobalListeners(g);
    loadMaps();
}

function loadMaps() {
    ui.epTabs.innerHTML = '';
    const groupEPs = EP_GROUPS[currentGroup] || [];
    const eps = groupEPs.map(String).sort((a, b) => parseInt(b) - parseInt(a));

    eps.forEach(ep => {
        const btn = document.createElement('div');
        btn.className = `tab ${currentEP === ep ? 'active-tab' : ''}`;
        btn.setAttribute('data-ep', ep);
        btn.innerHTML = `EP ${ep}` + getFireIconHTML(ep, null);
        btn.onclick = () => selectEP(ep);
        ui.epTabs.appendChild(btn);
    });

    if (!groupEPs.includes(parseInt(currentEP))) {
        selectEP(eps[0]);
    } else {
        selectEP(currentEP);
    }
}

function selectEP(epKey) {
    currentEP = epKey;
    // Update EP tabs visually
    Array.from(ui.epTabs.children).forEach(t => {
        if (t.getAttribute('data-ep') === String(epKey)) t.classList.add('active-tab');
        else t.classList.remove('active-tab');
    });

    // Render maps for this EP
    ui.mapTabs.innerHTML = '';
    const maps = EP_DATA[epKey];
    if (maps && maps.length > 0) {
        // Sort maps descending by reversing the array so later maps show up first
        const sortedMaps = maps.slice().reverse();
        sortedMaps.forEach(map => {
            const btn = document.createElement('div');
            btn.className = `tab`;
            btn.setAttribute('data-map', map.id);
            btn.setAttribute('data-map-label', map.label);
            btn.innerHTML = map.label + getFireIconHTML(null, map.id);
            btn.onclick = () => selectMap(map.id);
            ui.mapTabs.appendChild(btn);
        });
        selectMap(sortedMaps[0].id);
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
    // Find display label (with level number) from EP_DATA
    let mapLabel = name;
    for (const ep of Object.values(EP_DATA)) {
        const found = ep.find(m => m.id === name);
        if (found) { mapLabel = found.label; break; }
    }
    ui.currentMapTitle.textContent = mapLabel;

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
            actHtml += `<button class="btn text-btn sm-btn" id="stage-btn-${boss.id}" style="display:none;" title="Set Stage" onclick="setStage('${boss.id}', '${boss.name}')"><img src="pic/Stage.png" style="width:22px; height:22px; object-fit:contain; vertical-align:middle;"></button>`;
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
    updateStagePanel();
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
