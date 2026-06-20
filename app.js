import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, orderBy, limit, deleteField } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
    17: [{id:"Teresh Forest",label:"Teresh Forest(135)"},{id:"Sausys District 10",label:"Sausys District 10(138)"},{id:"Valandis District 3",label:"Valandis District 3(140)"},{id:"Valandis District 91",label:"Valandis District 91(143)"}],
    16: [{id:"ชายฝั่ง Catacombs",label:"ชายฝั่ง Catacombs(125)"},{id:"ชายฝั่ง Aiteo",label:"ชายฝั่ง Aiteo(128)"},{id:"ชายฝั่ง Epherotao",label:"ชายฝั่ง Epherotao(130)"},{id:"พื้นที่ Ranko 22",label:"พื้นที่ Ranko 22(133)"}],
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
    '13-17': [13, 14, 15, 16, 17],
    '9-12':  [9, 10, 11, 12],
    '5-8':   [5, 6, 7, 8],
    '1-4':   [1, 2, 3, 4]
};

const NAV_STORAGE_KEY = 'tosm-navigation';

function loadNavigationState() {
    try {
        return JSON.parse(localStorage.getItem(NAV_STORAGE_KEY)) || {};
    } catch (error) {
        console.warn('Could not restore navigation state:', error);
        return {};
    }
}

const savedNavigation = loadNavigationState();
let currentGroup = EP_GROUPS[savedNavigation.group] ? savedNavigation.group : '13-17';
let currentEP = EP_GROUPS[currentGroup].includes(Number(savedNavigation.ep))
    ? String(savedNavigation.ep)
    : String(EP_GROUPS[currentGroup][EP_GROUPS[currentGroup].length - 1]);
let preferredMapId = savedNavigation.mapId || null;
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
    navSelectionPath: document.getElementById('nav-selection-path'),

    currentMapTitle: document.getElementById('current-map-title'),
    addBossBtn: document.getElementById('add-boss-btn'),
    insertChannelBtn: document.getElementById('insert-channel-btn'),
    insertChannelModal: document.getElementById('insert-channel-modal'),
    insertChannelInput: document.getElementById('insert-channel-input'),
    cancelInsertBtn: document.getElementById('cancel-insert-btn'),
    saveInsertBtn: document.getElementById('save-insert-btn'),
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
let bossLoadGeneration = 0;
const urlParams = new URLSearchParams(window.location.search);
const IS_LOCAL_PREVIEW = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && urlParams.get('preview') === '1';
const previewBossesByMap = new Map();

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

function getPreviewBosses(mapId) {
    if (!previewBossesByMap.has(mapId)) {
        const now = Date.now();
        const mapSeed = Array.from(mapId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const channelBase = (mapSeed % 20) + 1;
        const minuteOffset = (mapSeed % 9) + 1;
        previewBossesByMap.set(mapId, [
            { id: `${mapId}-upcoming`, name: String(channelBase), targetTime: now + (70 + minuteOffset) * 60 * 1000, respawnLengthMin: 135 },
            { id: `${mapId}-soon`, name: String(channelBase + 1), targetTime: now + minuteOffset * 30 * 1000, respawnLengthMin: 135 },
            { id: `${mapId}-spawned`, name: String(channelBase + 2), targetTime: now - (8 + minuteOffset) * 60 * 1000, respawnLengthMin: 135, stage: 1 + ((mapSeed % 30) / 10) }
        ]);
    }
    return previewBossesByMap.get(mapId);
}

function refreshPreviewMap() {
    if (!IS_LOCAL_PREVIEW || !currentMapId) return;
    globalBossesData = getPreviewBosses(currentMapId);
    globalAllBosses = globalAllBosses
        .filter(boss => boss.mapId !== currentMapId)
        .concat(globalBossesData.map(boss => ({ ...boss, mapId: currentMapId })));
    renderBossCards();
}

function initializeLocalPreview() {
    currentUserPerms = { view: true, admin: false, create: true, delete_channel: true, delete_all: false };
    ui.adminBtn.style.display = 'none';
    ui.noAccessPanel.style.display = 'none';
    ui.mainContent.style.display = 'flex';
    document.getElementById('app').classList.add('full-width');
    forms.userEmail.textContent = 'Local preview';
    forms.logoutBtn.textContent = 'Use Login';
    switchView('dashboard');
    loadGroups();
    startGlobalListeners(currentGroup);
    loadMaps();
}

// ----------------- AUTHENTICATION -----------------
if (IS_LOCAL_PREVIEW) {
    queueMicrotask(initializeLocalPreview);
} else {
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
        ui.mainContent.style.display = currentUserPerms.view ? 'flex' : 'none';
        document.getElementById('app').classList.add('full-width');

        switchView('dashboard');
        forms.userEmail.textContent = user.email;
        if (currentUserPerms.view) {
            loadGroups();
            startGlobalListeners(currentGroup);
            loadMaps();
        }
    } else {
        switchView('auth');
        document.getElementById('app').classList.remove('full-width');
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
}

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
    if (IS_LOCAL_PREVIEW) {
        window.location.search = '';
        return;
    }
    signOut(auth);
});

// ----------------- NOTIFICATIONS -----------------
if (ui.notiBtn) {
    if (Notification.permission === 'granted') {
        ui.notiBtn.classList.add('notifications-enabled');
        ui.notiBtn.title = 'Boss spawn notifications enabled';
        ui.notiBtn.setAttribute('aria-label', 'Boss spawn notifications enabled');
    }
    ui.notiBtn.onclick = () => {
        if (Notification.permission === 'granted') {
            alert('Notifications are already enabled!');
            return;
        }
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                ui.notiBtn.classList.add('notifications-enabled');
                ui.notiBtn.title = 'Boss spawn notifications enabled';
                ui.notiBtn.setAttribute('aria-label', 'Boss spawn notifications enabled');
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

    return isFire ? ' <span class="activity-mark" title="Spawn active or due soon" aria-label="Spawn active or due soon"></span>' : '';
}

// Global listener to track all channels for fire icons (only active group)
function startGlobalListeners(group) {
    // Close existing listeners
    Object.values(globalMapListeners).forEach(unsub => unsub());
    globalMapListeners = {};
    globalAllBosses = [];

    const epKeys = EP_GROUPS[group] || [];
    if (IS_LOCAL_PREVIEW) {
        const previewMapIds = epKeys
            .flatMap(ep => (EP_DATA[ep] || []).map(map => map.id))
            .slice(0, 2);
        globalAllBosses = previewMapIds.flatMap(mapId => (
            getPreviewBosses(mapId).map(boss => ({ ...boss, mapId }))
        ));
        updateTabIcons();
        updateStagePanel();
        return;
    }

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
    if ((!auth.currentUser && !IS_LOCAL_PREVIEW) || !currentEP) return;

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
        const stageMeta = b.awaitingReset ? 'Awaiting reset' : `Stage ${stage}`;
        return `<button type="button" class="sidebar-item" onclick="navigateToMap('${b.mapId.replace(/'/g, "\\'")}')">
            <div class="sidebar-item-map">${mapLabel}</div>
            <div class="sidebar-item-meta">Ch.${b.name} &middot; ${stageMeta}</div>
        </button>`;
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
        openBtn.setAttribute('aria-expanded', 'true');
    } else {
        sidebar.classList.add('sidebar-collapsed');
        openBtn.classList.add('visible');
        openBtn.setAttribute('aria-expanded', 'false');
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
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `tab ${currentGroup === g ? 'active-tab' : ''}`;
        btn.setAttribute('data-group', g);
        btn.setAttribute('aria-pressed', String(currentGroup === g));
        btn.textContent = `EP ${g}`;
        btn.onclick = () => selectGroup(g);
        ui.groupTabs.appendChild(btn);
    });
}

function selectGroup(g) {
    currentGroup = g;
    Array.from(ui.groupTabs.children).forEach(t => {
        const isActive = t.getAttribute('data-group') === g;
        t.classList.toggle('active-tab', isActive);
        t.setAttribute('aria-pressed', String(isActive));
    });
    startGlobalListeners(g);
    loadMaps();
}

function loadMaps() {
    ui.epTabs.innerHTML = '';
    const groupEPs = EP_GROUPS[currentGroup] || [];
    const eps = groupEPs.map(String).sort((a, b) => parseInt(b) - parseInt(a));

    eps.forEach(ep => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `tab ${currentEP === ep ? 'active-tab' : ''}`;
        btn.setAttribute('data-ep', ep);
        btn.setAttribute('aria-pressed', String(currentEP === ep));
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
        const isActive = t.getAttribute('data-ep') === String(epKey);
        t.classList.toggle('active-tab', isActive);
        t.setAttribute('aria-pressed', String(isActive));
    });

    // Render maps for this EP
    ui.mapTabs.innerHTML = '';
    const maps = EP_DATA[epKey];
    if (maps && maps.length > 0) {
        // Sort maps descending by reversing the array so later maps show up first
        const sortedMaps = maps.slice().reverse();
        sortedMaps.forEach(map => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `tab`;
            btn.setAttribute('data-map', map.id);
            btn.setAttribute('data-map-label', map.label);
            btn.setAttribute('aria-pressed', 'false');
            btn.innerHTML = map.label + getFireIconHTML(null, map.id);
            btn.onclick = () => selectMap(map.id);
            ui.mapTabs.appendChild(btn);
        });
        const preferredMap = sortedMaps.find(map => map.id === preferredMapId);
        preferredMapId = null;
        selectMap(preferredMap?.id || sortedMaps[0].id);
    } else {
        ui.mapTabs.innerHTML = '<div class="empty-state" style="padding:0; margin:0; font-size: 0.85rem;">No maps here yet</div>';
        currentMapId = null;
        ui.currentMapTitle.textContent = "Select a Map";
        ui.navSelectionPath.textContent = `EP ${currentEP} · No maps available`;
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
    ui.navSelectionPath.textContent = `EP ${currentEP} · ${mapLabel}`;

    // UI perms apply
    ui.addBossBtn.style.display = currentUserPerms.create ? 'inline-flex' : 'none';
    ui.insertChannelBtn.style.display = currentUserPerms.create ? 'inline-flex' : 'none';

    // update tab UI
    Array.from(ui.mapTabs.children).forEach(t => {
        const isActive = t.getAttribute('data-map') === name;
        t.classList.toggle('active-tab', isActive);
        t.setAttribute('aria-pressed', String(isActive));
    });
    try {
        localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify({
            group: currentGroup,
            ep: currentEP,
            mapId: currentMapId
        }));
    } catch (error) {
        console.warn('Could not save navigation state:', error);
    }
    loadBosses(name);
}

// ----------------- BOSS LOGIC -----------------
function loadBosses(mapId) {
    const loadGeneration = ++bossLoadGeneration;

    if (bossesUnsubscribe) {
        bossesUnsubscribe();
        bossesUnsubscribe = null;
    }
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }

    // Never leave the previous map's channels visible while the next snapshot loads.
    globalBossesData = [];
    ui.bossList.innerHTML = '<div class="empty-state loading-state">Loading channels...</div>';

    if (IS_LOCAL_PREVIEW) {
        globalBossesData = getPreviewBosses(mapId);
        refreshPreviewMap();
        updateInterval = setInterval(updateTimers, 1000);
        return;
    }

    const q = query(collection(db, `maps/${mapId}/bosses`));
    bossesUnsubscribe = onSnapshot(q, (snapshot) => {
        // Ignore a late response from a map the user has already left.
        if (currentMapId !== mapId || loadGeneration !== bossLoadGeneration) return;

        globalBossesData = [];
        snapshot.forEach(doc => {
            globalBossesData.push({ id: doc.id, ...doc.data() });
        });
        renderBossCards();
        // start UI timer update loop
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(updateTimers, 1000);
    }, (error) => {
        if (currentMapId !== mapId || loadGeneration !== bossLoadGeneration) return;
        console.error(`Failed to load channels for ${mapId}:`, error);
        globalBossesData = [];
        ui.bossList.innerHTML = '<div class="empty-state error-state">Could not load channels. Try selecting the map again.</div>';
    });
}

function createBossAction(label, title, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `boss-action-btn ${className}`;
    button.textContent = label;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.addEventListener('click', onClick);
    return button;
}

function getRespawnRuleText(boss) {
    if (Number.isFinite(Number(boss.respawnLengthMin)) && Number(boss.respawnLengthMin) >= 0) {
        const totalMinutes = Number(boss.respawnLengthMin);
        const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
        const minutes = Math.floor(totalMinutes % 60).toString().padStart(2, '0');
        return `Respawn time: ${hours}:${minutes}`;
    }

    if (boss.hhmmStr) {
        const [hours = '00', minutes = '00'] = boss.hhmmStr.split(':');
        return `Respawn time: ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    return 'Respawn time: 00:00';
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
        card.className = 'boss-card is-upcoming';
        card.id = `boss-card-${boss.id}`;

        card.innerHTML = `
            <div class="boss-glance">
                <div class="boss-channel" aria-hidden="true">
                    <span>CH</span>
                    <strong class="boss-channel-number"></strong>
                </div>
                <div class="boss-timer" aria-live="off">
                    <div class="timer-meta-row">
                        <span class="timer-label">Spawns in</span>
                        <span class="stage-badge" hidden></span>
                    </div>
                    <strong class="spawn-time-text">--:--:--</strong>
                </div>
                <div class="boss-info">
                    <div class="boss-title-row">
                        <h4 class="boss-channel-title"></h4>
                        <span class="boss-status">Scheduled</span>
                    </div>
                    <p class="rule-text">${getRespawnRuleText(boss)}</p>
                </div>
            </div>
        `;

        card.querySelector('.boss-channel-number').textContent = boss.name;
        card.querySelector('.boss-channel-title').textContent = `Channel ${boss.name}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'boss-actions';
        if (currentUserPerms.create) {
            const stageButton = createBossAction('Stage', 'Set boss stage', 'stage-action', () => {
                window.setStage(boss.id, boss.name);
            });
            stageButton.id = `stage-btn-${boss.id}`;
            stageButton.hidden = true;
            actionsDiv.appendChild(stageButton);

            const defeatedButton = createBossAction('Defeated', 'Mark boss defeated and wait for a new respawn time', 'defeated-action', () => {
                window.toggleBossDefeated(boss.id, boss.name);
            });
            defeatedButton.id = `defeated-btn-${boss.id}`;
            defeatedButton.hidden = true;
            actionsDiv.appendChild(defeatedButton);

            actionsDiv.appendChild(createBossAction('Reset', 'Reset channel timer', 'reset-action', () => {
                window.editBoss(boss.id, boss.name);
            }));
        }
        if (currentUserPerms.delete_all || currentUserPerms.delete_channel) {
            actionsDiv.appendChild(createBossAction('Remove', 'Remove channel', 'remove-action', () => {
                window.deleteBoss(boss.id, boss.name);
            }));
        }
        if (actionsDiv.children.length > 0) {
            card.appendChild(actionsDiv);
        }

        ui.bossList.appendChild(card);
    });

    updateTimers();
}

function checkGlobalNotifications() {
    if (Notification.permission !== 'granted') return;
    const now = Date.now();
    globalAllBosses.forEach(boss => {
        if (!boss.targetTime) return;
        const remaining = boss.targetTime - now;
        if (remaining > 0 || remaining < -120000) return;
        const key = `${boss.mapId}::${boss.id}`;
        if (notifiedBosses[key] === boss.targetTime) return;
        notifiedBosses[key] = boss.targetTime;
        let mapLabel = boss.mapId;
        for (const ep of Object.values(EP_DATA)) {
            const found = ep.find(m => m.id === boss.mapId);
            if (found) { mapLabel = found.label; break; }
        }
        new Notification('TOSM Boss Spawned!', {
            body: `Channel ${boss.name} in ${mapLabel} has entered Stage Start!!!`,
            icon: 'favicon.ico'
        });
    });
}

function updateTimers() {
    const now = Date.now();
    checkGlobalNotifications();
    globalBossesData.forEach(boss => {
        const card = document.getElementById(`boss-card-${boss.id}`);
        if (!card) return;

        const ruleText = card.querySelector('.rule-text');
        const spawnText = card.querySelector('.spawn-time-text');
        const timerLabel = card.querySelector('.timer-label');
        const statusBadge = card.querySelector('.boss-status');
        const stageBadge = card.querySelector('.stage-badge');

        let sH = "00", sM = "00";
        if (boss.hhmmStr) {
            const p = boss.hhmmStr.split(':');
            sH = p[0].padStart(2, '0');
            sM = p[1].padStart(2, '0');
        } else if (boss.respawnLengthMin) {
            sH = Math.floor(boss.respawnLengthMin / 60).toString().padStart(2, '0');
            sM = (boss.respawnLengthMin % 60).toString().padStart(2, '0');
        }

        let sText = "";
        let rText = getRespawnRuleText(boss);

        let targetEpoch = boss.targetTime;
        if (!targetEpoch) {
            const d = new Date();
            d.setHours(parseInt(sH));
            d.setMinutes(parseInt(sM));
            d.setSeconds(0);
            d.setMilliseconds(0);
            targetEpoch = d.getTime();
        }

        const stageBtn = document.getElementById(`stage-btn-${boss.id}`);
        const defeatedBtn = document.getElementById(`defeated-btn-${boss.id}`);

        if (boss.awaitingReset) {
            const waitingSince = Number(boss.defeatedAt) || targetEpoch;
            const waitingSeconds = Math.max(0, Math.floor((now - waitingSince) / 1000));
            const wh = Math.floor(waitingSeconds / 3600).toString().padStart(2, '0');
            const wm = Math.floor((waitingSeconds % 3600) / 60).toString().padStart(2, '0');
            const ws = (waitingSeconds % 60).toString().padStart(2, '0');
            const stageNum = boss.stage ?? 1;

            card.classList.remove('is-upcoming', 'is-soon', 'is-spawned');
            card.classList.add('is-awaiting-reset');
            statusBadge.textContent = 'Awaiting reset';
            timerLabel.textContent = 'Defeated';
            stageBadge.textContent = `Stage ${stageNum}`;
            stageBadge.hidden = false;
            ruleText.textContent = 'Boss defeated · Enter the next respawn when ready';
            spawnText.textContent = `${wh}:${wm}:${ws}`;

            if (stageBtn) stageBtn.hidden = true;
            if (defeatedBtn) {
                defeatedBtn.hidden = false;
                defeatedBtn.textContent = 'Undo';
                defeatedBtn.title = 'Undo defeated state';
                defeatedBtn.setAttribute('aria-label', `Undo defeated state for channel ${boss.name}`);
            }
            return;
        }

        const TWO_HOURS = 2 * 60 * 60 * 1000;
        if (now - targetEpoch > TWO_HOURS) {
            if (!boss._deleting && currentMapId) {
                boss._deleting = true;
                if (IS_LOCAL_PREVIEW) {
                    previewBossesByMap.set(
                        currentMapId,
                        getPreviewBosses(currentMapId).filter(item => item.id !== boss.id)
                    );
                    refreshPreviewMap();
                } else {
                    deleteDoc(doc(db, `maps/${currentMapId}/bosses`, boss.id)).catch(console.error);
                }
            }
            return;
        }

        const remainingMeta = targetEpoch - now;


        if (remainingMeta <= 0) {
            // Auto-init stage to 1 on first spawn
            if ((boss.stage === undefined || boss.stage === null) && !boss._stageInit && currentMapId) {
                boss._stageInit = true;
                if (IS_LOCAL_PREVIEW) {
                    boss.stage = 1;
                } else {
                    updateDoc(doc(db, `maps/${currentMapId}/bosses`, boss.id), { stage: 1 }).catch(console.error);
                }
            }

            const elapsedSeconds = Math.floor(Math.abs(remainingMeta) / 1000);
            const eh = Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0');
            const em = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0');
            const es = (elapsedSeconds % 60).toString().padStart(2, '0');
            const stageNum = boss.stage ?? 1;
            sText = `${eh}:${em}:${es}`;

            card.classList.remove('is-upcoming', 'is-soon');
            card.classList.add('is-spawned');
            statusBadge.textContent = 'Spawned';
            timerLabel.textContent = 'Elapsed';
            stageBadge.textContent = `Stage ${stageNum}`;
            stageBadge.hidden = false;

            if (stageBtn) stageBtn.hidden = false;
            if (defeatedBtn) {
                defeatedBtn.hidden = false;
                defeatedBtn.textContent = 'Defeated';
                defeatedBtn.title = 'Mark boss defeated and wait for a new respawn time';
                defeatedBtn.setAttribute('aria-label', `Mark channel ${boss.name} boss defeated`);
            }
        } else {
            const isSoon = remainingMeta <= 5 * 60 * 1000;
            if (stageBtn) stageBtn.hidden = true;
            if (defeatedBtn) defeatedBtn.hidden = true;
            const totalSeconds = Math.floor(remainingMeta / 1000);
            const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            sText = `${h}:${m}:${s}`;

            card.classList.remove('is-spawned', 'is-soon', 'is-upcoming');
            card.classList.add(isSoon ? 'is-soon' : 'is-upcoming');
            statusBadge.textContent = isSoon ? 'Spawning soon' : 'Scheduled';
            timerLabel.textContent = 'Spawns in';
            stageBadge.hidden = true;
        }

        if (ruleText.textContent !== rText) {
            ruleText.textContent = rText;
        }
        if (spawnText.textContent !== sText) {
            spawnText.textContent = sText;
        }
    });

    // Also trigger update for Tabs so Fire Icons appear dynamically
    updateTabIcons();
    updateStagePanel();
}

window.toggleBossDefeated = async (bossId, bossName) => {
    if (!currentUserPerms.create || !currentMapId) return;

    const mapId = currentMapId;
    const boss = globalBossesData.find(item => item.id === bossId);
    if (!boss) return;

    const markDefeated = !boss.awaitingReset;
    const actionButton = document.getElementById(`defeated-btn-${bossId}`);
    if (actionButton) {
        actionButton.disabled = true;
        actionButton.textContent = 'Saving...';
    }

    if (IS_LOCAL_PREVIEW) {
        if (markDefeated) {
            boss.awaitingReset = true;
            boss.defeatedAt = Date.now();
        } else {
            delete boss.awaitingReset;
            delete boss.defeatedAt;
        }
        refreshPreviewMap();
        return;
    }

    try {
        await updateDoc(doc(db, `maps/${mapId}/bosses`, bossId), {
            awaitingReset: markDefeated ? true : deleteField(),
            defeatedAt: markDefeated ? Date.now() : deleteField()
        });
        logActivity(
            markDefeated ? 'Mark Defeated' : 'Undo Defeated',
            `Map [${ui.currentMapTitle.textContent}] Channel [${bossName}]`
        );
    } catch (error) {
        console.error('Could not update defeated state:', error);
        alert('Could not update the boss state. Please try again.');
    } finally {
        if (actionButton?.isConnected) actionButton.disabled = false;
    }
};

window.deleteBoss = async (bossId, bossName) => {
    if (!currentUserPerms.delete_channel && !currentUserPerms.delete_all) {
        alert("You do not have permission to delete channels.");
        return;
    }
    if (!currentMapId) return;
    if (confirm('Are you sure you want to remove this channel?')) {
        if (IS_LOCAL_PREVIEW) {
            previewBossesByMap.set(
                currentMapId,
                getPreviewBosses(currentMapId).filter(boss => boss.id !== bossId)
            );
            refreshPreviewMap();
            return;
        }
        await deleteDoc(doc(db, `maps/${currentMapId}/bosses`, bossId));
        logActivity("Remove Channel", `Removed channel [${bossName}] from map [${ui.currentMapTitle.textContent}]`);
    }
};

// ----------------- INSERT CHANNEL (SHIFT) -----------------
async function shiftChannels(insertAtNum) {
    if (!currentMapId || !currentUserPerms.create) return;

    const toShift = globalBossesData
        .filter(b => Number(b.name) >= insertAtNum)
        .sort((a, b) => Number(b.name) - Number(a.name)); // descending to avoid collisions

    if (toShift.length === 0) return;

    if (IS_LOCAL_PREVIEW) {
        toShift.forEach(boss => {
            const newNum = Number(boss.name) + 1;
            boss.name = String(newNum);
            boss.id = `channel-${newNum}`;
        });
        refreshPreviewMap();
        return;
    }

    for (const boss of toShift) {
        const newNum = Number(boss.name) + 1;
        const newDocId = `channel-${newNum}`;
        const newData = { name: String(newNum) };
        if (boss.targetTime != null) newData.targetTime = boss.targetTime;
        if (boss.hhmmStr != null) newData.hhmmStr = boss.hhmmStr;
        if (boss.respawnLengthMin != null) newData.respawnLengthMin = boss.respawnLengthMin;
        if (boss.stage != null) newData.stage = boss.stage;
        if (boss.awaitingReset != null) newData.awaitingReset = boss.awaitingReset;
        if (boss.defeatedAt != null) newData.defeatedAt = boss.defeatedAt;
        await setDoc(doc(db, `maps/${currentMapId}/bosses`, newDocId), newData);
        await deleteDoc(doc(db, `maps/${currentMapId}/bosses`, boss.id));
    }
    logActivity("Insert Channel", `Map [${ui.currentMapTitle.textContent}] inserted at Ch.${insertAtNum}, shifted ${toShift.length} channel(s) up`);
}

ui.insertChannelBtn.onclick = () => {
    ui.insertChannelInput.value = '';
    ui.insertChannelModal.classList.add('show');
    ui.insertChannelInput.focus();
};

ui.cancelInsertBtn.onclick = () => ui.insertChannelModal.classList.remove('show');

ui.saveInsertBtn.onclick = async () => {
    const num = parseInt(ui.insertChannelInput.value, 10);
    if (!Number.isInteger(num) || num < 1) {
        alert('Enter a valid channel number (positive whole number).');
        ui.insertChannelInput.focus();
        return;
    }
    ui.saveInsertBtn.disabled = true;
    ui.saveInsertBtn.textContent = 'Shifting...';
    try {
        await shiftChannels(num);
        ui.insertChannelModal.classList.remove('show');
    } finally {
        ui.saveInsertBtn.disabled = false;
        ui.saveInsertBtn.textContent = 'Shift Channels';
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
    if (IS_LOCAL_PREVIEW) {
        const boss = getPreviewBosses(currentMapId).find(item => item.id === stagingBossId);
        if (boss) boss.stage = rounded;
        refreshPreviewMap();
        ui.stageModal.classList.remove('show');
        stagingBossId = null;
        return;
    }
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
    ui.donateBtn.onclick = async () => {
        ui.donateModal.classList.add('show');
        const img = document.querySelector('.donate-qr');
        if (img && !img.src.includes('data:')) {
            img.setAttribute('aria-busy', 'true');
            try {
                const { qrData } = await import('./bdata.js');
                const b64 = qrData.split('').reverse().join('');
                img.src = 'data:image/png;base64,' + b64;
            } catch (error) {
                console.error('Unable to load support QR code:', error);
            } finally {
                img.removeAttribute('aria-busy');
            }
        }
    };
    ui.closeDonateBtn.onclick = () => ui.donateModal.classList.remove('show');
}

ui.cancelBoss.onclick = () => { ui.bossModal.classList.remove('show'); ui.newBossName.value = ''; resetBossModal(); };

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (ui.insertChannelModal.classList.contains('show')) {
        ui.insertChannelModal.classList.remove('show');
    } else if (ui.adminModal.classList.contains('show')) {
        ui.adminModal.classList.remove('show');
        if (adminLogsUnsubscribe) adminLogsUnsubscribe();
        if (adminMembersUnsubscribe) adminMembersUnsubscribe();
        if (adminRolesUnsubscribe) adminRolesUnsubscribe();
    } else if (ui.stageModal.classList.contains('show')) {
        ui.stageModal.classList.remove('show');
        stagingBossId = null;
    } else if (ui.bossModal.classList.contains('show')) {
        ui.bossModal.classList.remove('show');
        ui.newBossName.value = '';
        resetBossModal();
    } else if (ui.donateModal && ui.donateModal.classList.contains('show')) {
        ui.donateModal.classList.remove('show');
    }
});

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

function normalizeChannelNumber(value) {
    const channelNumber = Number(value);
    if (!Number.isInteger(channelNumber) || channelNumber < 1) return null;
    return String(channelNumber);
}

ui.saveBoss.onclick = async () => {
    if (!currentUserPerms.create) {
        alert("You do not have permission to create channels.");
        return;
    }
    const name = normalizeChannelNumber(ui.newBossName.value.trim());

    if (!name) {
        alert('Channel number must be a positive whole number.');
        ui.newBossName.focus();
        return;
    }

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

        const channelDocumentId = `channel-${name}`;
        let existingChannel = null;

        if (!editingBossId) {
            existingChannel = globalBossesData.find(boss => normalizeChannelNumber(boss.name) === name) || null;

            // Also check the deterministic document in case another user created it
            // after this client's latest snapshot.
            if (!existingChannel && !IS_LOCAL_PREVIEW) {
                const channelSnapshot = await getDoc(doc(db, `maps/${currentMapId}/bosses`, channelDocumentId));
                if (channelSnapshot.exists()) {
                    existingChannel = { id: channelSnapshot.id, ...channelSnapshot.data() };
                }
            }

            if (existingChannel) {
                const shouldReplace = confirm(
                    `Channel ${name} already exists on this map. Replace its current timer with this new time?`
                );
                if (!shouldReplace) return;
            }
        }

        const targetBossId = editingBossId || existingChannel?.id || null;

        if (IS_LOCAL_PREVIEW) {
            if (targetBossId) {
                const boss = getPreviewBosses(currentMapId).find(item => item.id === targetBossId);
                if (boss) {
                    boss.name = name;
                    boss.targetTime = targetEpoch;
                    boss.hhmmStr = saveHhMmStr;
                    boss.respawnLengthMin = totalMin;
                    delete boss.stage;
                    delete boss._stageInit;
                    delete boss.awaitingReset;
                    delete boss.defeatedAt;
                }
            } else {
                getPreviewBosses(currentMapId).push({
                    id: channelDocumentId,
                    name,
                    targetTime: targetEpoch,
                    hhmmStr: saveHhMmStr,
                    respawnLengthMin: totalMin
                });
            }
            refreshPreviewMap();
        } else if (targetBossId) {
            await updateDoc(doc(db, `maps/${currentMapId}/bosses`, targetBossId), {
                name,
                targetTime: targetEpoch,
                hhmmStr: saveHhMmStr,
                respawnLengthMin: totalMin,
                stage: deleteField(),
                awaitingReset: deleteField(),
                defeatedAt: deleteField()
            });
            const action = existingChannel ? 'Replace Existing Channel' : 'Reset Timer';
            logActivity(action, `Map [${ui.currentMapTitle.textContent}] Channel [${name}] | New Time: ${saveHhMmStr}`);
        } else {
            await setDoc(doc(db, `maps/${currentMapId}/bosses`, channelDocumentId), {
                name,
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
        const btn = ui.clearLogsBtn;
        if (!btn.dataset.confirming) {
            btn.dataset.confirming = '1';
            btn.textContent = 'Confirm clear?';
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn text-btn sm-btn';
            cancelBtn.style.marginLeft = '6px';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                delete btn.dataset.confirming;
                btn.textContent = 'Clear Logs';
                cancelBtn.remove();
            });
            btn.insertAdjacentElement('afterend', cancelBtn);
            return;
        }
        delete btn.dataset.confirming;
        btn.textContent = 'Clear Logs';
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
            const infoDiv = document.createElement('div');
            const strong = document.createElement('strong');
            strong.style.color = 'var(--primary)';
            strong.textContent = r.name;
            const permSpan = document.createElement('span');
            permSpan.style.color = 'var(--text-muted)';
            permSpan.style.fontSize = '0.75rem';
            permSpan.textContent = permsText.join(', ') || 'No Permissions';
            infoDiv.appendChild(strong);
            infoDiv.appendChild(document.createElement('br'));
            infoDiv.appendChild(permSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn text-btn sm-btn';
            deleteBtn.style.cssText = 'color: var(--danger); padding:0;';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => window.deleteRole(r.id, deleteBtn));

            li.appendChild(infoDiv);
            li.appendChild(deleteBtn);
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

            const tdUser = document.createElement('td');
            tdUser.style.cssText = 'padding: 0.5rem; color:var(--text-main);';
            tdUser.textContent = d.userEmail || 'Unknown';

            const tdAction = document.createElement('td');
            tdAction.style.cssText = 'padding: 0.5rem; color:var(--text-muted);';
            tdAction.textContent = d.action + ' ';
            const detailSpan = document.createElement('span');
            detailSpan.style.fontSize = '0.75rem';
            detailSpan.textContent = `(${d.details})`;
            tdAction.appendChild(detailSpan);

            const tdTime = document.createElement('td');
            tdTime.style.cssText = 'padding: 0.5rem; color:var(--text-muted); font-size:0.75rem;';
            tdTime.textContent = timeStr;

            tr.appendChild(tdUser);
            tr.appendChild(tdAction);
            tr.appendChild(tdTime);
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

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid rgba(255,255,255,0.05)";

            const tdEmail = document.createElement('td');
            tdEmail.style.cssText = 'padding: 0.8rem; color:var(--text-main); word-break: break-all;';
            tdEmail.textContent = email;

            const tdRole = document.createElement('td');
            tdRole.style.padding = '0.8rem';

            if (AdminEmails.includes(email)) {
                const badge = document.createElement('span');
                badge.style.cssText = 'color:#f59e0b; font-weight:bold;';
                badge.textContent = 'Super Admin (Locked)';
                tdRole.appendChild(badge);
            } else {
                const select = document.createElement('select');
                select.style.cssText = 'background:rgba(15,23,42,0.8); color:white; padding:0.4rem; border-radius:4px; border:1px solid var(--card-border); max-width: 150px;';
                const defaultOpt = document.createElement('option');
                defaultOpt.value = '';
                defaultOpt.textContent = '-- No Permissions --';
                select.appendChild(defaultOpt);
                globalRolesList.forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r.id;
                    opt.textContent = r.name;
                    opt.selected = d.roleId === r.id;
                    select.appendChild(opt);
                });
                select.addEventListener('change', () => window.updateMemberRole(email, select.value));
                tdRole.appendChild(select);
            }

            tr.appendChild(tdEmail);
            tr.appendChild(tdRole);
            ui.adminMembersTbody.appendChild(tr);
        });
    });
}

window.deleteRole = async (roleId, triggerEl) => {
    if (triggerEl && !triggerEl.dataset.confirming) {
        triggerEl.dataset.confirming = '1';
        triggerEl.textContent = 'Sure?';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn text-btn sm-btn';
        cancelBtn.style.cssText = 'color:var(--text-muted); padding:0; margin-left:6px;';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            delete triggerEl.dataset.confirming;
            triggerEl.textContent = 'Delete';
            cancelBtn.remove();
        });
        triggerEl.insertAdjacentElement('afterend', cancelBtn);
        return;
    }
    await deleteDoc(doc(db, "roles", roleId));
};

window.updateMemberRole = async (email, roleId) => {
    // Empty value = remove role entirely (back to basic authenticated user)
    await updateDoc(doc(db, "members", email), { roleId: roleId });
};
