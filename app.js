import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, getDocs, setDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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
    tabMembers: document.getElementById('tab-members'),
    tabRoles: document.getElementById('tab-roles'),
    adminLogsContent: document.getElementById('admin-logs-content'),
    adminMembersContent: document.getElementById('admin-members-content'),
    adminRolesContent: document.getElementById('admin-roles-content'),
    
    adminLogsTbody: document.getElementById('admin-logs-tbody'),
    adminMembersTbody: document.getElementById('admin-members-tbody'),
    
    newRoleName: document.getElementById('new-role-name'),
    permAdmin: document.getElementById('perm-admin'),
    permCreate: document.getElementById('perm-create'),
    permDelChannel: document.getElementById('perm-del-channel'),
    permDelAll: document.getElementById('perm-del-all'),
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
let currentUserPerms = { admin: false, create: false, delete_channel: false, delete_all: false };

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
        const uEmail = user.email.toLowerCase();
        
        let currentRoleId = null;
        let isFirstLogin = false;
        const memRef = doc(db, "members", uEmail);
        const memDoc = await getDoc(memRef);

        if (!memDoc.exists()) {
            isFirstLogin = true;
        } else {
            currentRoleId = memDoc.data().roleId;
        }

        // Auto-assign "Users" role only on the very first login
        if (isFirstLogin) {
            const rolesSnap = await getDocs(collection(db, "roles"));
            let defaultRoleId = null;
            rolesSnap.forEach(r => {
                if (r.data().name.toLowerCase() === "users") {
                    defaultRoleId = r.id;
                }
            });
            if (defaultRoleId) {
                currentRoleId = defaultRoleId;
            }
        }

        // 1. Keep track of user in 'members'
        const memberData = {
            email: user.email,
            lastLogin: serverTimestamp()
        };
        // If it's their very first login and we found the default role, set it.
        // Otherwise, leave their roleId exactly as it is (so admins can strip roles completely).
        if(isFirstLogin && currentRoleId) {
            memberData.roleId = currentRoleId;
        }
        
        await setDoc(memRef, memberData, { merge: true });

        // 2. Resolve Permissions
        let perms = { admin: false, create: false, delete_channel: false, delete_all: false };
        if (AdminEmails.includes(uEmail)) {
            perms = { admin: true, create: true, delete_channel: true, delete_all: true };
        } else {
            if (currentRoleId) {
                const roleDoc = await getDoc(doc(db, "roles", currentRoleId));
                if (roleDoc.exists()) {
                    const rp = roleDoc.data();
                    if(rp.admin) perms.admin = true;
                    if(rp.create) perms.create = true;
                    if(rp.delChannel) perms.delete_channel = true;
                    if(rp.delAll) perms.delete_all = true;
                }
            }
        }
        currentUserPerms = perms;

        // Apply visual access right away
        ui.adminBtn.style.display = currentUserPerms.admin ? 'block' : 'none';
        ui.addTabBtn.style.display = currentUserPerms.create ? 'flex' : 'none';

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
    
    // UI perms apply
    ui.addBossBtn.style.display = currentUserPerms.create ? 'block' : 'none';
    ui.deleteMapBtn.style.display = currentUserPerms.delete_all ? 'block' : 'none';
    
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
        `;
        
        if(currentUserPerms.delete_all || currentUserPerms.delete_channel) {
            const delDiv = document.createElement('div');
            delDiv.className = 'boss-actions';
            delDiv.innerHTML = `<button class="btn text-btn sm-btn" onclick="deleteBoss('${boss.id}', '${boss.name}')" style="color: var(--danger); font-size: 1.2rem; font-weight: bold;" title="Remove Channel">X</button>`;
            card.appendChild(delDiv);
        }

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

window.deleteBoss = async (bossId, bossName) => {
    if(!currentUserPerms.delete_channel && !currentUserPerms.delete_all) {
        alert("You do not have permission to delete channels.");
        return;
    }
    if(!currentMapId) return;
    if(confirm('Are you sure you want to remove this channel?')) {
        await deleteDoc(doc(db, `maps/${currentMapId}/bosses`, bossId));
        logActivity("Remove Channel", `Removed channel [${bossName}] from map [${ui.currentMapTitle.textContent}]`);
    }
};

// ----------------- MODAL INTERACTIONS -----------------
// Maps Modal
ui.addTabBtn.onclick = () => ui.mapModal.classList.add('show');
ui.cancelMap.onclick = () => { ui.mapModal.classList.remove('show'); ui.newMapName.value = ''; };
ui.saveMap.onclick = async () => {
    if(!currentUserPerms.create) {
        alert("You do not have permission to create maps.");
        return;
    }
    const val = ui.newMapName.value.trim();
    if(val) {
        await addDoc(collection(db, "maps"), { name: val });
        logActivity("Create Map", val);
        ui.mapModal.classList.remove('show');
        ui.newMapName.value = '';
    }
};

ui.deleteMapBtn.onclick = async () => {
    if(!currentUserPerms.delete_all) {
        alert("You do not have permission to delete maps.");
        return;
    }
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
    if(!currentUserPerms.create) {
        alert("You do not have permission to create channels.");
        return;
    }
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
    
    if(showId === 'logs') { ui.adminLogsContent.style.display = 'block'; ui.tabLogs.classList.add('active-tab'); }
    if(showId === 'members') { ui.adminMembersContent.style.display = 'block'; ui.tabMembers.classList.add('active-tab'); }
    if(showId === 'roles') { ui.adminRolesContent.style.display = 'block'; ui.tabRoles.classList.add('active-tab'); }
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

    // Save Role Button
    ui.saveRoleBtn.onclick = async () => {
        const rName = ui.newRoleName.value.trim();
        if(!rName) { alert("Need Role Name"); return; }
        
        await setDoc(doc(collection(db, "roles")), {
            name: rName,
            admin: ui.permAdmin.checked,
            create: ui.permCreate.checked,
            delChannel: ui.permDelChannel.checked,
            delAll: ui.permDelAll.checked
        });
        ui.newRoleName.value = '';
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
             const r = {id: docSnap.id, ...docSnap.data()};
             globalRolesList.push(r);
             
             let permsText = [];
             if(r.admin) permsText.push("Admin Dashboard");
             if(r.create) permsText.push("Create");
             if(r.delChannel) permsText.push("Delete Channel");
             if(r.delAll) permsText.push("Delete Everything");
             
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
    if(adminMembersUnsubscribe) adminMembersUnsubscribe();
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
    if(confirm("Delete this role entirely? Members assigned to this role will lose their special permissions.")) {
        await deleteDoc(doc(db, "roles", roleId));
    }
};

window.updateMemberRole = async (email, roleId) => {
    // Empty value = remove role entirely (back to basic authenticated user)
    await updateDoc(doc(db, "members", email), { roleId: roleId });
};
