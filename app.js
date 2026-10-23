// ==========================================
// 1. Firebase Configuration
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBvtjbfsjgVkNP_Fz1oHyqXpr-nIMBcu8c",
  authDomain: "bodycare-inventory.firebaseapp.com",
  projectId: "bodycare-inventory",
  storageBucket: "bodycare-inventory.firebasestorage.app",
  messagingSenderId: "185518684916",
  appId: "1:185518684916:web:4aedb7240e0524aaf77ca1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = secondaryApp.auth();

// ==========================================
// 2. Global State & Translations (i18n)
// ==========================================
let currentLang = 'th';
let currentUser = null;
let inventoryData = [];
let requestsData = []; 
let usersData = []; 
let unsubscribeInventory = null;
let unsubscribeRequests = null;
let unsubscribeUsers = null;
let currentEditDbId = null;
let currentEditUserId = null;
let currentTab = 'sec-inventory'; 

const translations = {
    th: {
        title1: "ระบบเบิกจ่ายสินค้าภายใน",
        loginHeader: "เข้าสู่ระบบ", loginSub: "สำหรับพนักงาน FaceStock เท่านั้น",
        labelEmail: "อีเมลองค์กร", labelPass: "รหัสผ่าน", btnLogin: "เข้าสู่ระบบ",
        logoutBtn: "ออกจากระบบ", topbarTitle: "FaceStock Portal", 
        menuAdmin1: "คลังสินค้า", menuAdmin2: "รายการรออนุมัติ", menuAdmin3: "รายงาน", menuAdmin4: "จัดการบัญชีผู้ใช้",
        menuUser1: "เบิกสินค้า", menuUser2: "ประวัติการเบิก", menuUser3: "บัญชีของฉัน",
        btnAdmin: "เพิ่มสินค้า", btnUser: "สร้างคำขอเบิก", btnCancel: "ยกเลิก", btnSave: "บันทึก", btnSend: "ยืนยันการเบิก",
        statusOut: "ของหมด", statusLow: "ใกล้หมด", statusNormal: "ปกติ", statusPending: "รออนุมัติ", statusApproved: "อนุมัติ", statusRejected: "ไม่อนุมัติ",
        btnApprove: "อนุมัติ", btnReject: "ไม่อนุมัติ", btnWait: "รอตรวจสอบ",
        tableTitle: "รายการสินค้าในคลัง", 
        thId: "รหัส", thName: "รายการ", thCat: "หมวดหมู่", thQty: "คงเหลือ", thUnit: "หน่วยนับ", thStatus: "สถานะ",
        reqTitle: "คำขอเบิกสินค้า", reqThDate: "วันที่", reqThUser: "ผู้ขอเบิก", reqThItem: "รายการ", reqThQty: "จำนวน", reqThStatus: "สถานะ",
        adminInvAction: "จัดการ", adminReqAction: "ดำเนินการ", searchPlaceholder: "ค้นหารหัส หรือชื่อสินค้า...",
        reportTitle: "สรุปการเบิกจ่าย", repThCount: "จำนวนครั้ง", repThTotal: "ปริมาณเบิกออกรวม",
        userTitle: "ผู้ใช้งานระบบ", userThEmail: "อีเมล", userThName: "ชื่อ-สกุล", userThRole: "ระดับสิทธิ์", userThAction: "จัดการ", btnAddUser: "เพิ่มผู้ใช้",
        profileTitle: "ข้อมูลบัญชี", profEmail: "อีเมล (แก้ไขไม่ได้)", profName: "ชื่อ-สกุล (Full Name)", btnSaveProf: "บันทึกการเปลี่ยนแปลง",
        roleAdmin: "ผู้ดูแลระบบ", roleUser: "พนักงานทั่วไป",
        widgetAdmin1: "สินค้าทั้งหมด (FAC)", widgetAdmin2: "สินค้าใกล้หมด", widgetAdmin3: "สินค้าหมดสต๊อก",
        widgetUser1: "สินค้าพร้อมเบิก", widgetUser2: "รออนุมัติ", widgetUser3: "อนุมัติแล้ว"
    },
    en: {
        title1: "Internal Requisition System",
        loginHeader: "Sign In", loginSub: "For FaceStock Staff Only",
        labelEmail: "Corporate Email", labelPass: "Password", btnLogin: "Sign In",
        logoutBtn: "Sign Out", topbarTitle: "FaceStock Portal", 
        menuAdmin1: "Inventory", menuAdmin2: "Approvals", menuAdmin3: "Reports", menuAdmin4: "Users",
        menuUser1: "Request Items", menuUser2: "My History", menuUser3: "My Account",
        btnAdmin: "Add Item", btnUser: "New Request", btnCancel: "Cancel", btnSave: "Save", btnSend: "Submit Request",
        statusOut: "Out of Stock", statusLow: "Low Stock", statusNormal: "Normal", statusPending: "Pending", statusApproved: "Approved", statusRejected: "Rejected",
        btnApprove: "Approve", btnReject: "Reject", btnWait: "Waiting",
        tableTitle: "Inventory Stock", 
        thId: "Code", thName: "Item", thCat: "Category", thQty: "Balance", thUnit: "Unit", thStatus: "Status",
        reqTitle: "Requisition Requests", reqThDate: "Date", reqThUser: "Requester", reqThItem: "Item", reqThQty: "Qty", reqThStatus: "Status",
        adminInvAction: "Action", adminReqAction: "Action", searchPlaceholder: "Search code or product name...",
        reportTitle: "Summary Report", repThCount: "Request Count", repThTotal: "Total Qty Issued",
        userTitle: "System Users", userThEmail: "Email", userThName: "Name", userThRole: "Role", userThAction: "Action", btnAddUser: "Add User",
        profileTitle: "Account Info", profEmail: "Email (Read-only)", profName: "Full Name", btnSaveProf: "Save Changes",
        roleAdmin: "Admin", roleUser: "Staff",
        widgetAdmin1: "Total Items (FAC)", widgetAdmin2: "Low Stock", widgetAdmin3: "Out of Stock",
        widgetUser1: "Available Items", widgetUser2: "Pending", widgetUser3: "Approved"
    }
};

// แปลหมวดหมู่ On-the-fly โดยไม่ต้องเก็บบน Database
function getCategoryEn(catTh) {
    const map = {
        "ผลิตภัณฑ์ทำความสะอาดผิว": "Cleansing",
        "ผลิตภัณฑ์บำรุงผิว": "Skincare",
        "ผลิตภัณฑ์ปกป้องผิว": "Protection",
        "ผลิตภัณฑ์ดูแลผิวเฉพาะด้าน": "Targeted Care"
    };
    return map[catTh] || catTh;
}

// ฟังก์ชันจำลองการแปลหน่วยนับ
function getUnitEn(unitTh) {
    const map = {
        "ชิ้น": "pcs",
        "ขวด": "btl",
        "หลอด": "tube",
        "กระปุก": "jar",
        "กล่อง": "box"
    };
    return map[unitTh] || unitTh;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[onclick="setLanguage(\'th\')"]').forEach(btn => btn.classList.toggle('active', lang === 'th'));
    document.querySelectorAll('[onclick="setLanguage(\'en\')"]').forEach(btn => btn.classList.toggle('active', lang === 'en'));
    updateUI();
}

function updateUI() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = t[el.getAttribute('data-lang')]);
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.placeholder = t[el.getAttribute('data-lang-placeholder')]);

    if (currentUser) {
        document.getElementById('user-name-display').innerText = currentUser.name || currentUser.email;
        document.getElementById('user-role-display').innerText = currentUser.role === 'admin' ? t.roleAdmin : t.roleUser;
        renderSidebarAndWidgets(t);
        
        document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
        document.getElementById(currentTab).style.display = 'block';
        
        searchInventory(); 
        renderRequestsTable(t);
        renderReportsTable(t);
        if(currentUser.role === 'admin') renderUsersTable(t);
    }
}

// ==========================================
// 3. Auth Logic
// ==========================================
function login() {
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if(!email || !password) return;

    auth.signInWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            const userRef = db.collection('users').doc(user.uid);
            const doc = await userRef.get();
            let userData = {};
            if (!doc.exists) {
                const isAdmin = user.email.startsWith('admin');
                userData = { uid: user.uid, email: user.email, name: '', role: isAdmin ? 'admin' : 'user', createdAt: firebase.firestore.FieldValue.serverTimestamp() };
                await userRef.set(userData);
            } else { userData = doc.data(); }

            currentUser = userData;
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('app-view').style.display = 'flex'; 
            fetchDatabaseRealtime();
        })
        .catch(() => Swal.fire({ title: 'ข้อผิดพลาด', text: 'อีเมลองค์กรหรือรหัสผ่านไม่ถูกต้อง', icon: 'error' }));
}

function logout() {
    auth.signOut().then(() => {
        if(unsubscribeInventory) unsubscribeInventory();
        if(unsubscribeRequests) unsubscribeRequests();
        if(unsubscribeUsers) unsubscribeUsers();
        inventoryData = []; requestsData = []; usersData = []; currentUser = null;
        document.getElementById('app-view').style.display = 'none';
        document.getElementById('login-view').style.display = 'flex';
        switchTab('sec-inventory');
    });
}

function switchTab(secId, element) {
    currentTab = secId;
    document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(secId).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        const targetNav = document.querySelector(`.nav-item[onclick*="${secId}"]`);
        if(targetNav) targetNav.classList.add('active');
    }
    if(secId === 'sec-profile') loadProfileData();
    if(secId === 'sec-inventory') {
        const searchInput = document.getElementById('search-inventory');
        if (searchInput) searchInput.value = '';
        renderInventoryTable(translations[currentLang]);
    }
}

// ==========================================
// 4. Realtime Listeners
// ==========================================
function fetchDatabaseRealtime() {
    unsubscribeInventory = db.collection("inventory").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        inventoryData = []; snapshot.forEach((doc) => inventoryData.push({ dbId: doc.id, ...doc.data() })); 
        searchInventory(); 
    });

    unsubscribeRequests = db.collection("requests").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        requestsData = []; snapshot.forEach((doc) => requestsData.push({ dbId: doc.id, ...doc.data() })); updateUI();
    });

    if(currentUser.role === 'admin') {
        unsubscribeUsers = db.collection("users").orderBy("email").onSnapshot((snapshot) => {
            usersData = []; snapshot.forEach((doc) => usersData.push({ dbId: doc.id, ...doc.data() })); updateUI();
        });
    }
}

// ==========================================
// 5. Inventory & Requisition Operations
// ==========================================
function searchInventory() {
    const searchInput = document.getElementById('search-inventory');
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const t = translations[currentLang];
    
    if(!searchText) { renderInventoryTable(t, inventoryData); return; }

    const filteredData = inventoryData.filter(item => {
        const name = (item.name || item.nameTh || '').toLowerCase();
        const itemId = (item.id || '').toLowerCase();
        return name.includes(searchText) || itemId.includes(searchText);
    });
    renderInventoryTable(t, filteredData);
}

function generateProductCode() {
    let maxNum = 0;
    inventoryData.forEach(item => {
        if (item.id && item.id.startsWith('FAC')) {
            const num = parseInt(item.id.replace('FAC', ''));
            if (!isNaN(num) && num > maxNum) maxNum = num;
        }
    });
    const nextNum = maxNum + 1;
    document.getElementById('pd-id').value = 'FAC' + nextNum.toString().padStart(3, '0');
}

function handleMainAction() { 
    if(currentUser.role === 'admin') { 
        generateProductCode();
        document.getElementById('addProductModal').style.display = 'flex'; 
    } else {
        const select = document.getElementById('req-item');
        select.innerHTML = '<option value="" disabled selected>เลือกรายการ...</option>';
        
        inventoryData.filter(i => i.qty > 0).forEach(item => {
            const unitText = item.unit || 'ชิ้น'; 
            select.innerHTML += `<option value="${item.dbId}" data-unit="${unitText}">[${item.id}] ${item.name || item.nameTh} (คงเหลือ: ${item.qty} ${unitText})</option>`;
        });
        
        select.onchange = function() {
            const selectedOpt = this.options[this.selectedIndex];
            document.getElementById('req-unit').value = selectedOpt.getAttribute('data-unit');
        };
        
        document.getElementById('req-unit').value = '';
        document.getElementById('requestModal').style.display = 'flex';
    }
}

function closeModal() { document.getElementById('addProductModal').style.display = 'none'; document.getElementById('addProductForm').reset(); }
function closeRequestModal() { document.getElementById('requestModal').style.display = 'none'; document.getElementById('requestForm').reset(); }

function saveProduct() {
    const newProduct = {
        id: document.getElementById('pd-id').value, 
        name: document.getElementById('pd-name').value, 
        category: document.getElementById('pd-cat').value, 
        qty: parseInt(document.getElementById('pd-qty').value), 
        unit: document.getElementById('pd-unit').value, 
        importDate: document.getElementById('pd-import-date').value, 
        expiryDate: document.getElementById('pd-expiry-date').value, 
        alertLimit: parseInt(document.getElementById('pd-alert').value),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection("inventory").add(newProduct).then(() => { closeModal(); Swal.fire('สำเร็จ', 'บันทึกสินค้าเข้าคลังเรียบร้อย', 'success'); });
}

function editProduct(dbId) {
    const item = inventoryData.find(i => i.dbId === dbId);
    if(!item) return;
    currentEditDbId = dbId;
    document.getElementById('edit-pd-id').value = item.id;
    document.getElementById('edit-pd-name').value = item.name || item.nameTh || '';
    document.getElementById('edit-pd-cat').value = item.category || item.catTh || 'ผลิตภัณฑ์ทำความสะอาดผิว';
    document.getElementById('edit-pd-qty').value = item.qty;
    document.getElementById('edit-pd-alert').value = item.alertLimit;
    document.getElementById('editProductModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editProductModal').style.display = 'none';
    document.getElementById('editProductForm').reset();
    currentEditDbId = null;
}

function updateProduct() {
    if(!currentEditDbId) return;
    const updatedProduct = {
        name: document.getElementById('edit-pd-name').value,
        category: document.getElementById('edit-pd-cat').value,
        qty: parseInt(document.getElementById('edit-pd-qty').value),
        alertLimit: parseInt(document.getElementById('edit-pd-alert').value)
    };
    db.collection("inventory").doc(currentEditDbId).update(updatedProduct).then(() => {
        closeEditModal();
        Swal.fire('สำเร็จ', 'อัปเดตข้อมูลสินค้าเรียบร้อย', 'success');
    });
}

function deleteProduct(dbId) {
    Swal.fire({ title: 'ยืนยันการลบ?', text: "หากลบแล้วจะไม่สามารถกู้คืนได้", icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3B30', confirmButtonText: 'ลบทิ้ง' })
    .then((result) => {
        if(result.isConfirmed) db.collection("inventory").doc(dbId).delete().then(() => Swal.fire('ลบสำเร็จ', 'ลบสินค้าเรียบร้อย', 'success'));
    });
}

function submitRequest() {
    const itemId = document.getElementById('req-item').value;
    const reqQty = parseInt(document.getElementById('req-qty').value);
    const item = inventoryData.find(i => i.dbId === itemId);

    if(reqQty > item.qty) { Swal.fire({ title: 'สต๊อกไม่พอ', text: `รายการนี้คงเหลือเพียง ${item.qty} ชิ้น`, icon: 'error' }); return; }

    const newRequest = {
        itemId: item.dbId, itemCode: item.id, itemName: item.name || item.nameTh,
        reqQty: reqQty, note: document.getElementById('req-note').value,
        status: 'pending', requestedBy: currentUser.email, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection("requests").add(newRequest).then(() => { closeRequestModal(); Swal.fire('ส่งคำขอสำเร็จ', 'รายการถูกส่งให้พิจารณาแล้ว', 'success'); });
}

function approveRequest(reqId, itemId, reqQty) {
    Swal.fire({ title: 'ยืนยันการอนุมัติ', text: "ระบบจะหักยอดคงเหลือทันที", icon: 'warning', showCancelButton: true, confirmButtonColor: '#34C759', confirmButtonText: 'ยืนยันอนุมัติ' })
    .then((result) => {
        if (result.isConfirmed) {
            const reqRef = db.collection('requests').doc(reqId); const itemRef = db.collection('inventory').doc(itemId);
            db.runTransaction((transaction) => {
                return transaction.get(itemRef).then((itemDoc) => {
                    const newQty = itemDoc.data().qty - reqQty;
                    if (newQty < 0) throw "ปริมาณคงเหลือไม่เพียงพอ";
                    transaction.update(itemRef, { qty: newQty }); transaction.update(reqRef, { status: 'approved' });
                });
            }).then(() => Swal.fire('อนุมัติสำเร็จ', 'ทำรายการเรียบร้อย', 'success')).catch((err) => Swal.fire('ข้อผิดพลาด', err, 'error'));
        }
    });
}

function rejectRequest(reqId) {
    Swal.fire({ title: 'ไม่อนุมัติคำขอ', text: 'กรุณาระบุเหตุผล (ถ้ามี)', input: 'text', icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3B30', confirmButtonText: 'ไม่อนุมัติ' })
    .then((result) => {
        if(result.isConfirmed) {
            db.collection('requests').doc(reqId).update({ status: 'rejected', rejectReason: result.value || 'ไม่ได้ระบุเหตุผล' })
            .then(() => Swal.fire('บันทึกสำเร็จ', 'บันทึกการปฏิเสธเรียบร้อย', 'success'));
        }
    });
}

// ==========================================
// 6. User Management & Profile
// ==========================================
function loadProfileData() {
    if(!currentUser) return;
    document.getElementById('prof-email').value = currentUser.email;
    document.getElementById('prof-name').value = currentUser.name || currentUser.nameTh || '';
    document.getElementById('prof-role').value = currentUser.role || 'user';
    document.getElementById('prof-phone').value = currentUser.phone || '';
    document.getElementById('prof-address').value = currentUser.address || '';
}

function saveProfile() {
    const newName = document.getElementById('prof-name').value;
    const newPhone = document.getElementById('prof-phone').value;
    const newAddress = document.getElementById('prof-address').value;
    
    db.collection('users').doc(currentUser.uid).update({ 
        name: newName, nameTh: newName, nameEn: newName, 
        phone: newPhone, address: newAddress 
    })
    .then(() => {
        currentUser.name = newName; currentUser.phone = newPhone; currentUser.address = newAddress;
        updateUI(); Swal.fire('สำเร็จ', 'บันทึกข้อมูลส่วนตัวเรียบร้อย', 'success');
    }).catch(err => Swal.fire('ข้อผิดพลาด', err.message, 'error'));
}

function showAddUserModal() { document.getElementById('addUserModal').style.display = 'flex'; }
function closeAddUserModal() { document.getElementById('addUserModal').style.display = 'none'; document.getElementById('addUserForm').reset(); }

function submitNewUser() {
    const email = document.getElementById('new-user-email').value.trim(); const password = document.getElementById('new-user-password').value;
    const name = document.getElementById('new-user-name').value; const role = document.getElementById('new-user-role').value;

    Swal.fire({ title: 'กำลังสร้างบัญชี...', didOpen: () => { Swal.showLoading(); } });
    secondaryAuth.createUserWithEmailAndPassword(email, password)
        .then((userCred) => db.collection('users').doc(userCred.user.uid).set({ uid: userCred.user.uid, email: email, name: name, role: role, createdAt: firebase.firestore.FieldValue.serverTimestamp() }))
        .then(() => { secondaryAuth.signOut(); closeAddUserModal(); Swal.fire('สำเร็จ', 'สร้างบัญชีผู้ใช้ใหม่เรียบร้อย', 'success'); })
        .catch(() => Swal.fire('ข้อผิดพลาด', 'บัญชีนี้อาจมีอยู่ในระบบแล้ว หรือรหัสผ่านสั้นเกินไป', 'error'));
}

function editUser(uid) {
    const user = usersData.find(u => u.uid === uid);
    if(!user) return;
    currentEditUserId = uid;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-name').value = user.name || user.nameTh || '';
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('editUserModal').style.display = 'flex';
}

function closeEditUserModal() { document.getElementById('editUserModal').style.display = 'none'; document.getElementById('editUserForm').reset(); currentEditUserId = null; }

function submitEditUser() {
    if(!currentEditUserId) return;
    db.collection('users').doc(currentEditUserId).update({
        name: document.getElementById('edit-user-name').value, role: document.getElementById('edit-user-role').value
    }).then(() => { closeEditUserModal(); Swal.fire('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อย', 'success'); });
}

function deleteUser(uid, email) {
    Swal.fire({ title: 'ยืนยันการลบบัญชี?', text: `ต้องการลบ ${email} ใช่หรือไม่`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3B30', confirmButtonText: 'ลบข้อมูล' })
    .then((result) => { if (result.isConfirmed) db.collection('users').doc(uid).delete().then(() => Swal.fire('ลบสำเร็จ', 'บัญชีถูกนำออกแล้ว', 'success')); });
}

// ==========================================
// 7. Data Rendering (UI Binding)
// ==========================================
function renderSidebarAndWidgets(t) {
    let menuHtml = ''; let widgetsHtml = '';
    const pendingCount = requestsData.filter(r => r.status === 'pending').length;

    if (currentUser.role === 'admin') {
        document.getElementById('btn-action-text').innerText = t.btnAdmin;
        document.getElementById('btn-action-icon').className = 'fas fa-plus';
        
        menuHtml += `<div class="nav-item ${currentTab === 'sec-inventory' ? 'active' : ''}" onclick="switchTab('sec-inventory', this)"><i class="fas fa-boxes"></i> <span>${t.menuAdmin1}</span></div>`;
        menuHtml += `<div class="nav-item ${currentTab === 'sec-approvals' ? 'active' : ''}" onclick="switchTab('sec-approvals', this)"><i class="fas fa-clipboard-check"></i> <span>${t.menuAdmin2}</span> ${pendingCount > 0 ? `<span style="background:#FF3B30; color:white; border-radius:50%; padding:2px 8px; font-size:10px; margin-left:auto;">${pendingCount}</span>` : ''}</div>`;
        menuHtml += `<div class="nav-item ${currentTab === 'sec-reports' ? 'active' : ''}" onclick="switchTab('sec-reports', this)"><i class="fas fa-chart-bar"></i> <span>${t.menuAdmin3}</span></div>`;
        menuHtml += `<div class="nav-item ${currentTab === 'sec-users' ? 'active' : ''}" onclick="switchTab('sec-users', this)"><i class="fas fa-users"></i> <span>${t.menuAdmin4}</span></div>`;
        
        const lowStock = inventoryData.filter(i => i.qty > 0 && i.qty <= i.alertLimit).length;
        const outStock = inventoryData.filter(i => i.qty === 0).length;
        
        widgetsHtml = `
            <div class="stat-card primary" onclick="filterInventory('all')" style="cursor: pointer;"><div class="info"><p>${t.widgetAdmin1}</p><h3>${inventoryData.length}</h3></div><div class="stat-icon"><i class="fas fa-box-open"></i></div></div>
            <div class="stat-card warning" onclick="filterInventory('low')" style="cursor: pointer;"><div class="info"><p>${t.widgetAdmin2}</p><h3>${lowStock}</h3></div><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div></div>
            <div class="stat-card danger" onclick="filterInventory('out')" style="cursor: pointer;"><div class="info"><p>${t.widgetAdmin3}</p><h3>${outStock}</h3></div><div class="stat-icon"><i class="fas fa-ban"></i></div></div>
        `;
    } else {
        document.getElementById('btn-action-text').innerText = t.btnUser;
        document.getElementById('btn-action-icon').className = 'fas fa-hand-holding';

        const myRequests = requestsData.filter(r => r.requestedBy === currentUser.email);
        const myPending = myRequests.filter(r => r.status === 'pending').length;
        const myApproved = myRequests.filter(r => r.status === 'approved').length;

        menuHtml += `<div class="nav-item ${currentTab === 'sec-inventory' ? 'active' : ''}" onclick="switchTab('sec-inventory', this)"><i class="fas fa-search"></i> <span>${t.menuUser1}</span></div>`;
        menuHtml += `<div class="nav-item ${currentTab === 'sec-approvals' ? 'active' : ''}" onclick="switchTab('sec-approvals', this)"><i class="fas fa-history"></i> <span>${t.menuUser2}</span></div>`;
        menuHtml += `<div class="nav-item ${currentTab === 'sec-profile' ? 'active' : ''}" onclick="switchTab('sec-profile', this)"><i class="far fa-user-circle"></i> <span>${t.menuUser3}</span></div>`;
        
        const available = inventoryData.filter(i => i.qty > 0).length;
        
        widgetsHtml = `
            <div class="stat-card success" onclick="filterInventory('available')" style="cursor: pointer;"><div class="info"><p>${t.widgetUser1}</p><h3>${available}</h3></div><div class="stat-icon"><i class="fas fa-check-circle"></i></div></div>
            <div class="stat-card warning" onclick="switchTab('sec-approvals')" style="cursor: pointer;"><div class="info"><p>${t.widgetUser2}</p><h3>${myPending}</h3></div><div class="stat-icon"><i class="fas fa-clock"></i></div></div>
            <div class="stat-card primary" onclick="switchTab('sec-approvals')" style="cursor: pointer;"><div class="info"><p>${t.widgetUser3}</p><h3>${myApproved}</h3></div><div class="stat-icon"><i class="fas fa-clipboard-check"></i></div></div>
        `;
    }
    document.getElementById('nav-menu').innerHTML = menuHtml;
    document.getElementById('dashboard-widgets').innerHTML = widgetsHtml;
}

function filterInventory(filterType) {
    const t = translations[currentLang];
    let filteredData = [];
    const searchInput = document.getElementById('search-inventory');
    if (searchInput) searchInput.value = '';

    if (filterType === 'all') filteredData = inventoryData; 
    else if (filterType === 'low') filteredData = inventoryData.filter(i => i.qty > 0 && i.qty <= i.alertLimit);
    else if (filterType === 'out') filteredData = inventoryData.filter(i => i.qty === 0);
    else if (filterType === 'available') filteredData = inventoryData.filter(i => i.qty > 0);
    
    renderInventoryTable(t, filteredData);
}

// 🛠️ ตารางถูกอัปเดตเพื่อรองรับการแทรกคอลัมน์ "หน่วยนับ (Unit)" อย่างสมบูรณ์ 
function renderInventoryTable(t, dataToRender = inventoryData) {
    let theadHtml = `<tr>
        <th class="col-id" data-lang="thId">${t.thId}</th>
        <th data-lang="thName">${t.thName}</th>
        <th class="col-cat" data-lang="thCat">${t.thCat}</th>
        <th class="col-qty" style="text-align: right;" data-lang="thQty">${t.thQty}</th>
        <th class="col-unit" data-lang="thUnit">${t.thUnit}</th>
        <th class="col-status" data-lang="thStatus">${t.thStatus}</th>
        ${currentUser && currentUser.role === 'admin' ? `<th style="text-align: right;" data-lang="reqThAction">${t.reqThAction || 'จัดการ'}</th>` : ''}
    </tr>`;
    document.querySelector('#inventory-table thead').innerHTML = theadHtml;

    let html = '';
    if(dataToRender.length === 0) { 
        let colSpan = currentUser && currentUser.role === 'admin' ? 7 : 6;
        document.getElementById('inventory-list').innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding: 40px; color: var(--text-tertiary);">ไม่พบข้อมูลสินค้า</td></tr>`; 
        return; 
    }
    
    dataToRender.forEach(item => {
        let badgeClass = item.qty === 0 ? 'badge-danger' : (item.qty <= item.alertLimit ? 'badge-warning' : 'badge-success');
        let statusText = item.qty === 0 ? t.statusOut : (item.qty <= item.alertLimit ? t.statusLow : t.statusNormal);
        
        const itemName = item.name || item.nameTh || 'N/A';
        const itemCat = currentLang === 'en' ? getCategoryEn(item.category || item.catTh) : (item.category || item.catTh);
        
        // 🛠️ กำหนดตัวแปรสำหรับคอลัมน์หน่วยนับ
        const itemUnit = item.unit || 'ชิ้น';
        const displayUnit = currentLang === 'en' ? getUnitEn(itemUnit) : itemUnit;

        let actionTd = '';
        if(currentUser && currentUser.role === 'admin') {
            actionTd = `<td style="text-align: right; vertical-align: middle;">
                <button onclick="editProduct('${item.dbId}')" style="background:#FF9500; color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:12px; margin-right:4px;"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct('${item.dbId}')" style="background:#FF3B30; color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:12px;"><i class="fas fa-trash"></i></button>
            </td>`;
        }

        html += `<tr>
            <td style="color:var(--text-tertiary); font-family:'Inter', sans-serif;">${item.id}</td>
            <td style="font-weight:500;">${itemName}</td>
            <td style="color:var(--text-secondary);">${itemCat}</td>
            <td style="font-weight: 500; font-family:'Inter', sans-serif; text-align: right;">${item.qty}</td>
            <td style="color:var(--text-secondary);">${displayUnit}</td>
            <td class="col-status"><span class="badge ${badgeClass}"><span class="status-dot"></span> ${statusText}</span></td>
            ${actionTd}
        </tr>`;
    });
    document.getElementById('inventory-list').innerHTML = html;
}

function renderRequestsTable(t) {
    let theadHtml = `<tr>
        <th data-lang="reqThDate">${t.reqThDate}</th>
        <th data-lang="reqThUser">${t.reqThUser}</th>
        <th data-lang="reqThItem">${t.reqThItem}</th>
        <th style="text-align: right;" data-lang="reqThQty">${t.reqThQty}</th>
        <th style="text-align: center;" data-lang="reqThStatus">${t.reqThStatus}</th>
        ${currentUser.role === 'admin' ? `<th style="text-align: right;" data-lang="reqThAction">${t.reqThAction}</th>` : ''}
    </tr>`;
    document.querySelector('#requests-table thead').innerHTML = theadHtml;

    let html = '';
    let filteredRequests = currentUser.role === 'admin' ? requestsData : requestsData.filter(r => r.requestedBy === currentUser.email);

    if(filteredRequests.length === 0) { 
        let colSpan = currentUser.role === 'admin' ? 6 : 5;
        document.getElementById('requests-list').innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding: 40px; color: var(--text-tertiary);">ไม่มีรายการคำขอ</td></tr>`; return; 
    }

    filteredRequests.forEach(req => {
        let dateStr = req.createdAt ? req.createdAt.toDate().toLocaleDateString(currentLang === 'th' ? 'th-TH' : 'en-GB') : 'Processing';
        let statusBadge = ''; let actionBtns = '';
        const itemName = req.itemName || req.itemNameTh || 'N/A';

        if(req.status === 'pending') {
            statusBadge = `<span class="badge badge-warning"><span class="status-dot"></span> ${t.statusPending}</span>`;
            if(currentUser.role === 'admin') {
                actionBtns = `<td style="text-align: right; vertical-align: top;">
                    <button onclick="approveRequest('${req.dbId}', '${req.itemId}', ${req.reqQty})" style="background:#34C759; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:12px; margin-right:4px;">${t.btnApprove}</button>
                    <button onclick="rejectRequest('${req.dbId}')" style="background:#FF3B30; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:12px;">${t.btnReject}</button>
                </td>`;
            }
        } else if(req.status === 'approved') {
            statusBadge = `<span class="badge badge-success"><span class="status-dot"></span> ${t.statusApproved}</span>`;
            if(currentUser.role === 'admin') actionBtns = `<td></td>`; 
        } else { 
            let reasonText = req.rejectReason ? ` <br><span style="font-size:11px; color:#FF3B30; margin-top:4px; display:block;">(${req.rejectReason})</span>` : '';
            statusBadge = `<span class="badge badge-danger"><span class="status-dot"></span> ${t.statusRejected}</span>${reasonText}`; 
            if(currentUser.role === 'admin') actionBtns = `<td></td>`; 
        }

        html += `<tr>
            <td style="font-size: 13px; color: var(--text-secondary); vertical-align: top;">${dateStr}</td>
            <td style="font-size: 13px; vertical-align: top;">${req.requestedBy.split('@')[0]}</td>
            <td style="font-weight: 500; vertical-align: top;">[${req.itemCode}] ${itemName}</td>
            <td style="font-weight: 500; font-family:'Inter', sans-serif; text-align: right; vertical-align: top;">${req.reqQty}</td>
            <td style="text-align: center; vertical-align: top;">${statusBadge}</td>
            ${actionBtns}
        </tr>`;
    });
    document.getElementById('requests-list').innerHTML = html;
}

function renderReportsTable(t) {
    let html = '';
    const approvedRequests = requestsData.filter(r => r.status === 'approved');
    const reportSummary = {};
    
    approvedRequests.forEach(req => {
        if(!reportSummary[req.itemCode]) reportSummary[req.itemCode] = { name: req.itemName || req.itemNameTh, count: 0, totalQty: 0 };
        reportSummary[req.itemCode].count += 1; reportSummary[req.itemCode].totalQty += req.reqQty;
    });

    const reportKeys = Object.keys(reportSummary);
    if(reportKeys.length === 0) { document.getElementById('reports-list').innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: var(--text-tertiary);">ยังไม่มีข้อมูลสรุปผล</td></tr>`; return; }

    reportKeys.forEach(code => {
        const data = reportSummary[code];
        html += `<tr>
            <td style="color:var(--text-tertiary); font-family:'Inter', sans-serif;">${code}</td>
            <td style="font-weight:500;">${data.name}</td>
            <td style="text-align: right;">${data.count}</td>
            <td style="text-align: right; font-weight:600; color:var(--brand-primary); font-family:'Inter', sans-serif;">${data.totalQty}</td>
        </tr>`;
    });
    document.getElementById('reports-list').innerHTML = html;
}

function renderUsersTable(t) {
    let html = '';
    usersData.forEach(user => {
        const name = user.name || user.nameTh || 'ไม่ระบุ';
        const roleBadge = user.role === 'admin'
            ? `<span style="background:#e0e7ff; color:#4338ca; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:500;"><i class="fas fa-shield-alt"></i> ${t.roleAdmin}</span>`
            : `<span style="background:#f1f5f9; color:#475569; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:500;"><i class="fas fa-user"></i> ${t.roleUser}</span>`;

        html += `<tr>
            <td style="font-size: 14px; font-family:'Inter', sans-serif;"><div style="font-weight:500; color:var(--text-main);">${user.email}</div></td>
            <td><div style="font-weight:500;">${name}</div></td>
            <td><div style="margin-bottom:8px;">${roleBadge}</div></td>
            <td style="text-align: right; vertical-align: middle;">
                <button onclick="editUser('${user.uid}')" style="background:#FF9500; color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:12px; margin-right:4px;" ${user.email.includes('admin') && user.uid !== currentUser.uid ? 'disabled' : ''}><i class="fas fa-user-edit"></i></button>
                <button onclick="deleteUser('${user.uid}', '${user.email}')" style="background:#FF3B30; color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:12px;" ${user.email.includes('admin') ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    document.getElementById('users-list').innerHTML = html;
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "รหัส,รายการ,จำนวนครั้งที่เบิก,ปริมาณเบิกออกรวม\n";
    
    const approvedRequests = requestsData.filter(r => r.status === 'approved');
    const reportSummary = {};
    approvedRequests.forEach(req => {
        if(!reportSummary[req.itemCode]) reportSummary[req.itemCode] = { name: req.itemName || req.itemNameTh, count: 0, totalQty: 0 };
        reportSummary[req.itemCode].count += 1; reportSummary[req.itemCode].totalQty += req.reqQty;
    });

    Object.keys(reportSummary).forEach(code => {
        const data = reportSummary[code];
        const safeName = `"${data.name.replace(/"/g, '""')}"`;
        csvContent += `${code},${safeName},${data.count},${data.totalQty}\n`;
    });

    const encodedUri = encodeURI(csvContent); const link = document.createElement("a");
    link.setAttribute("href", encodedUri); link.setAttribute("download", `facestock_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

updateUI();