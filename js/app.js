// ==========================================
// 1. Firebase Configuration & Refs
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

const refs = {
    inventory: db.collection("inventory"),
    requests: db.collection("requests"),
    users: db.collection("users"),
    audit: db.collection("audit_logs")
};

// ==========================================
// 2. Global State & Translations (i18n)
// ==========================================
let currentLang = 'th';
let currentUser = null;
let inventoryData = [], requestsData = [], usersData = [], auditData = [];
let unsubscribes = [];
let currentEditDbId = null, currentEditUserId = null;
let currentTab = 'sec-inventory'; 

const translations = {
    th: {
        title1: "ระบบเบิกจ่ายสินค้าภายใน", loginHeader: "เข้าสู่ระบบ", loginSub: "สำหรับพนักงาน FaceStock เท่านั้น",
        labelEmail: "อีเมลองค์กร", labelPass: "รหัสผ่าน", btnLogin: "เข้าสู่ระบบ", logoutBtn: "ออกจากระบบ", 
        topbarTitle: "FaceStock Portal", notifTitle: "การแจ้งเตือน",
        menuAdmin1: "คลังสินค้า", menuAdmin2: "รายการรออนุมัติ", menuAdmin3: "รายงาน", menuAdmin4: "จัดการบัญชีผู้ใช้", menuAdmin5: "ประวัติ (Audit)",
        menuUser1: "เบิกสินค้า", menuUser2: "ประวัติการเบิก", menuUser3: "บัญชีของฉัน",
        btnAdmin: "เพิ่มสินค้า", btnUser: "สร้างคำขอเบิก", btnCancel: "ยกเลิก", btnSave: "บันทึก", btnSend: "ยืนยันการเบิก",
        statusOut: "ของหมด", statusLow: "ใกล้หมด", statusNormal: "ปกติ", statusPending: "รออนุมัติ", statusApproved: "อนุมัติ", statusRejected: "ไม่อนุมัติ",
        btnApprove: "อนุมัติ", btnReject: "ไม่อนุมัติ",
        tableTitle: "รายการสินค้าในคลัง", thId: "รหัส", thName: "รายการ", thCat: "หมวดหมู่", thQty: "คงเหลือ", thUnit: "หน่วยนับ", thStatus: "สถานะ",
        reqTitle: "คำขอเบิกสินค้า", reqThDate: "วันที่", reqThUser: "ผู้ขอเบิก", reqThItem: "รายการ", reqThQty: "จำนวน", reqThStatus: "สถานะ", reqThNote: "หมายเหตุ",
        adminInvAction: "จัดการ", adminReqAction: "ดำเนินการ", searchPlaceholder: "ค้นหารหัส หรือชื่อสินค้า...",
        reportTitle: "สรุปการเบิกจ่าย", repThCount: "จำนวนครั้ง", repThTotal: "ปริมาณเบิกออกรวม",
        userTitle: "ผู้ใช้งานระบบ", userThEmail: "อีเมล", userThName: "ชื่อ-สกุล", userThRole: "ระดับสิทธิ์", userThAction: "จัดการ", btnAddUser: "เพิ่มผู้ใช้",
        auditTitle: "ประวัติการเคลื่อนไหว (Audit Trail)", auditThDate: "วันที่ทำรายการ", auditThAction: "การกระทำ", auditThItem: "รายการสินค้า", auditThQty: "จำนวน", auditThUser: "ผู้ดำเนินการ",
        profileTitle: "ข้อมูลบัญชี", profEmail: "อีเมล (แก้ไขไม่ได้)", profFirstName: "ชื่อ (First Name)", profLastName: "นามสกุล (Last Name)", profDept: "แผนก", profPhone: "เบอร์โทรศัพท์", 
        profAddressHeader: "ที่อยู่พนักงาน (Address)", profHouseNo: "เลขที่", profSoi: "ซอย", profRoad: "ถนน", profSubDistrict: "ตำบล/แขวง", profDistrict: "อำเภอ/เขต", profProvince: "จังหวัด", profZipCode: "รหัสไปรษณีย์",
        btnSaveProf: "บันทึกการเปลี่ยนแปลง",
        roleAdmin: "ผู้ดูแลระบบ", roleUser: "พนักงานทั่วไป",
        widgetAdmin1: "สินค้าทั้งหมด (FAC)", widgetAdmin2: "สินค้าใกล้หมด", widgetAdmin3: "สินค้าหมดสต๊อก",
        widgetUser1: "สินค้าพร้อมเบิก", widgetUser2: "รออนุมัติ", widgetUser3: "อนุมัติแล้ว",
        auditAction: { import: 'นำเข้าสินค้า', issue: 'เบิกจ่ายออก', adjust_increase: 'ปรับเพิ่มยอด', adjust_decrease: 'ปรับลดยอด', delete: 'ลบรายการ' },
        tableEmptyInv: "ไม่พบข้อมูลสินค้า", tableEmptyReq: "ไม่มีรายการคำขอ", tableEmptyRep: "ยังไม่มีข้อมูลสรุปผล", tableEmptyUser: "ไม่พบข้อมูลผู้ใช้งาน",
        thImportDate: "วันที่นำเข้า", thExpiryDate: "วันหมดอายุ", reqAlertStockOut: "สินค้าไม่เพียงพอ"
    },
    en: {
        title1: "Internal Requisition System", loginHeader: "Sign In", loginSub: "For FaceStock Staff Only",
        labelEmail: "Corporate Email", labelPass: "Password", btnLogin: "Sign In", logoutBtn: "Sign Out", 
        topbarTitle: "FaceStock Portal", notifTitle: "Notifications",
        menuAdmin1: "Inventory", menuAdmin2: "Approvals", menuAdmin3: "Reports", menuAdmin4: "Users", menuAdmin5: "Audit Trail",
        menuUser1: "Request Items", menuUser2: "My History", menuUser3: "My Account",
        btnAdmin: "Add Item", btnUser: "New Request", btnCancel: "Cancel", btnSave: "Save", btnSend: "Submit Request",
        statusOut: "Out of Stock", statusLow: "Low Stock", statusNormal: "Normal", statusPending: "Pending", statusApproved: "Approved", statusRejected: "Rejected",
        btnApprove: "Approve", btnReject: "Reject",
        tableTitle: "Inventory Stock", thId: "Code", thName: "Item", thCat: "Category", thQty: "Balance", thUnit: "Unit", thStatus: "Status",
        reqTitle: "Requisition Requests", reqThDate: "Date", reqThUser: "Requester", reqThItem: "Item", reqThQty: "Qty", reqThStatus: "Status", reqThNote: "Note",
        adminInvAction: "Action", adminReqAction: "Action", searchPlaceholder: "Search code or product name...",
        reportTitle: "Summary Report", repThCount: "Request Count", repThTotal: "Total Qty Issued",
        userTitle: "System Users", userThEmail: "Email", userThName: "Name", userThRole: "Role", userThAction: "Action", btnAddUser: "Add User",
        auditTitle: "Audit Trail", auditThDate: "Date", auditThAction: "Action", auditThItem: "Item", auditThQty: "Qty", auditThUser: "Done By",
        profileTitle: "Account Info", profEmail: "Email (Read-only)", profFirstName: "First Name", profLastName: "Last Name", profDept: "Department", profPhone: "Phone", 
        profAddressHeader: "Address", profHouseNo: "House No.", profSoi: "Soi", profRoad: "Road", profSubDistrict: "Sub-district", profDistrict: "District", profProvince: "Province", profZipCode: "Zip Code",
        btnSaveProf: "Save Changes",
        roleAdmin: "Admin", roleUser: "Staff",
        widgetAdmin1: "Total Items (FAC)", widgetAdmin2: "Low Stock", widgetAdmin3: "Out of Stock",
        widgetUser1: "Available Items", widgetUser2: "Pending", widgetUser3: "Approved",
        auditAction: { import: 'Import', issue: 'Issue', adjust_increase: 'Adjust (In)', adjust_decrease: 'Adjust (Out)', delete: 'Delete' },
        tableEmptyInv: "No inventory items found", tableEmptyReq: "No requisition requests", tableEmptyRep: "No summary data available", tableEmptyUser: "No users found",
        thImportDate: "Import Date", thExpiryDate: "Expiry Date", reqAlertStockOut: "Insufficient Stock"
    }
};

const getCategoryEn = catTh => ({"ผลิตภัณฑ์ทำความสะอาดผิว": "Cleansing", "ผลิตภัณฑ์บำรุงผิว": "Skincare", "ผลิตภัณฑ์ปกป้องผิว": "Protection", "ผลิตภัณฑ์ดูแลผิวเฉพาะด้าน": "Targeted Care"}[catTh] || catTh);
const getUnitEn = unitTh => ({"ชิ้น": "pcs", "ขวด": "btl", "หลอด": "tube", "กระปุก": "jar", "กล่อง": "box", "ก้อน": "bar", "แผ่น": "sheet"}[unitTh] || unitTh);

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('onclick').includes(lang)));
    if (currentUser) updateUI();
    else {
        const t = translations[currentLang];
        document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = t[el.getAttribute('data-lang')] || el.innerHTML);
        document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.placeholder = t[el.getAttribute('data-lang-placeholder')] || el.placeholder);
    }
}

// รวมศูนย์การอัปเดต UI เพื่อแก้ปัญหา Real-time
function updateUI() {
    if (!currentUser) return;
    const t = translations[currentLang];
    document.querySelectorAll('[data-lang]').forEach(el => el.innerHTML = t[el.getAttribute('data-lang')] || el.innerHTML);
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.placeholder = t[el.getAttribute('data-lang-placeholder')] || el.placeholder);
    
    document.getElementById('user-name-display').innerText = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
    document.getElementById('user-role-display').innerText = currentUser.role === 'admin' ? t.roleAdmin : t.roleUser;
    
    renderSidebarAndWidgets(t);
    renderNotifications(t);
    
    // อัปเดตตารางเฉพาะแท็บปัจจุบันเพื่อประสิทธิภาพ
    if(currentTab === 'sec-inventory') searchInventory();
    if(currentTab === 'sec-approvals') renderRequestsTable(t);
    if(currentTab === 'sec-reports') renderReportsTable(t);
    if(currentTab === 'sec-users' && currentUser.role === 'admin') renderUsersTable(t);
    if(currentTab === 'sec-audit' && currentUser.role === 'admin') renderAuditTable(t);
    if(currentTab === 'sec-profile') loadProfileData();
}

// ==========================================
// Sidebar UI Controls (Mobile Hamburger Menu)
// ==========================================
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('show');
    document.getElementById('mobile-overlay').classList.toggle('show');
}
function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('show');
    document.getElementById('mobile-overlay').classList.remove('show');
}

// ==========================================
// 3. Auth & Lifecycle
// ==========================================
function login() {
    const email = document.getElementById('username').value.trim(); const password = document.getElementById('password').value;
    if(!email || !password) return;

    auth.signInWithEmailAndPassword(email, password).then(async (userCredential) => {
        const userRef = refs.users.doc(userCredential.user.uid);
        const doc = await userRef.get();
        if (!doc.exists) {
            const isAdmin = email.startsWith('admin');
            const newUserData = { uid: userCredential.user.uid, email, firstName: '', lastName: '', department: 'ผลิตภัณฑ์ดูแลผิวหน้า', role: isAdmin ? 'admin' : 'user', createdAt: firebase.firestore.FieldValue.serverTimestamp() };
            await userRef.set(newUserData);
            currentUser = newUserData;
        } else { currentUser = doc.data(); }

        document.getElementById('login-view').style.display = 'none';
        document.getElementById('app-view').style.display = 'flex';
        fetchDatabaseRealtime();
    }).catch(() => Swal.fire('ข้อผิดพลาด', 'อีเมลองค์กรหรือรหัสผ่านไม่ถูกต้อง', 'error'));
}

function logout() {
    auth.signOut().then(() => {
        unsubscribes.forEach(unsub => unsub()); unsubscribes = [];
        inventoryData = []; requestsData = []; usersData = []; auditData = []; currentUser = null;
        document.getElementById('app-view').style.display = 'none'; document.getElementById('login-view').style.display = 'flex';
        switchTab('sec-inventory');
    });
}

function switchTab(secId, element = null) {
    currentTab = secId;
    document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
    const targetSec = document.getElementById(secId);
    if(targetSec) targetSec.style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
    else { const targetNav = document.querySelector(`.nav-item[onclick*="${secId}"]`); if(targetNav) targetNav.classList.add('active'); }
    
    closeSidebar();
    updateUI();
}

function fetchDatabaseRealtime() {
    unsubscribes.push(refs.inventory.orderBy("createdAt", "desc").onSnapshot(snap => {
        inventoryData = snap.docs.map(doc => ({ dbId: doc.id, ...doc.data() })); updateUI();
    }));
    unsubscribes.push(refs.requests.orderBy("createdAt", "desc").onSnapshot(snap => {
        requestsData = snap.docs.map(doc => ({ dbId: doc.id, ...doc.data() })); updateUI();
    }));
    if(currentUser.role === 'admin') {
        unsubscribes.push(refs.users.orderBy("email").onSnapshot(snap => {
            usersData = snap.docs.map(doc => ({ dbId: doc.id, ...doc.data() })); updateUI();
        }));
        unsubscribes.push(refs.audit.orderBy("createdAt", "desc").limit(100).onSnapshot(snap => {
            auditData = snap.docs.map(doc => ({ dbId: doc.id, ...doc.data() })); updateUI();
        }));
    }
}

// ==========================================
// 4. Audit Trail & Notifications
// ==========================================
function logAudit(action, itemCode, itemName, qty) {
    refs.audit.add({
        action, itemCode, itemName, qty,
        byUser: currentUser ? (`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email) : 'System',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.log("Audit Log Error:", err));
}

function renderNotifications(t) {
    const badge = document.getElementById('notif-badge');
    const list = document.getElementById('notif-list');
    let notifs = [];

    if (currentUser.role === 'admin') {
        notifs = requestsData.filter(r => r.status === 'pending');
    } else {
        notifs = requestsData.filter(r => r.requestedBy === currentUser.email && (r.status === 'approved' || r.status === 'rejected') && !r.userNotified);
    }

    badge.style.display = notifs.length > 0 ? 'flex' : 'none';
    badge.innerText = notifs.length > 99 ? '99+' : notifs.length;

    if (notifs.length === 0) {
        list.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-secondary); font-size: 13px;">${currentLang==='th'?'ไม่มีการแจ้งเตือนใหม่':'No new notifications'}</div>`;
        return;
    }

    list.innerHTML = notifs.map(n => {
        let title = '', icon = '', color = '';
        if(currentUser.role === 'admin') {
            title = currentLang==='th'?'มีคำขอเบิกใหม่':'New Request';
            icon = 'fa-clipboard-list'; color = 'var(--brand-primary)';
        } else {
            if(n.status === 'approved') {
                title = currentLang==='th'?'อนุมัติแล้ว':'Approved'; icon = 'fa-check-circle'; color = 'var(--status-success-text)';
            } else {
                title = currentLang==='th'?'ถูกปฏิเสธ':'Rejected'; icon = 'fa-times-circle'; color = 'var(--status-danger-text)';
            }
        }
        const desc = `[${n.itemCode}] ${n.itemName || ''} (${n.reqQty})`;
        return `<div class="notif-item unread" onclick="handleNotifClick('${n.dbId}')">
            <div class="notif-item-icon" style="color: ${color};"><i class="fas ${icon}"></i></div>
            <div class="notif-item-content">
                <div class="notif-item-title">${title}</div>
                <div class="notif-item-desc">${desc}</div>
            </div>
        </div>`;
    }).join('');
}

function toggleNotifications() {
    document.getElementById('notif-dropdown').classList.toggle('show');
}
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown && dropdown.classList.contains('show') && !e.target.closest('.header-notifications')) { dropdown.classList.remove('show'); }
});

function handleNotifClick(reqDbId) {
    document.getElementById('notif-dropdown').classList.remove('show');
    if (currentUser.role === 'user') { refs.requests.doc(reqDbId).update({ userNotified: true }); }
    switchTab('sec-approvals');
}

// ==========================================
// 5. Inventory Operations
// ==========================================
function searchInventory() {
    const searchText = document.getElementById('search-inventory')?.value.toLowerCase() || '';
    const filtered = searchText ? inventoryData.filter(i => (i.name||'').toLowerCase().includes(searchText) || (i.id||'').toLowerCase().includes(searchText)) : inventoryData;
    renderInventoryTable(translations[currentLang], filtered);
}

function filterInventory(type) {
    document.getElementById('search-inventory').value = '';
    let filtered = inventoryData;
    if(type === 'low') filtered = inventoryData.filter(i => i.qty > 0 && i.qty <= i.alertLimit);
    if(type === 'out') filtered = inventoryData.filter(i => i.qty === 0);
    if(type === 'available') filtered = inventoryData.filter(i => i.qty > 0);
    renderInventoryTable(translations[currentLang], filtered);
}

function handleMainAction() { 
    if(currentUser.role === 'admin') { 
        let maxNum = inventoryData.reduce((max, item) => item.id.startsWith('FAC') ? Math.max(max, parseInt(item.id.replace('FAC', '')) || 0) : max, 0);
        document.getElementById('pd-id').value = 'FAC' + (maxNum + 1).toString().padStart(3, '0');
        document.getElementById('addProductModal').style.display = 'flex'; 
    } else {
        const select = document.getElementById('req-item');
        select.innerHTML = '<option value="" disabled selected>เลือกรายการ...</option>' + inventoryData.filter(i => i.qty > 0).map(i => `<option value="${i.dbId}" data-unit="${i.unit||'ชิ้น'}">[${i.id}] ${i.name} (คงเหลือ: ${i.qty} ${i.unit||'ชิ้น'})</option>`).join('');
        
        select.onchange = function() {
            document.getElementById('req-unit').value = this.options[this.selectedIndex].getAttribute('data-unit');
            validateRequestQty();
        };
        
        document.getElementById('req-unit').value = '';
        document.getElementById('req-qty').value = 1;
        document.getElementById('requestModal').style.display = 'flex';
    }
}
function closeModal() { document.getElementById('addProductModal').style.display = 'none'; document.getElementById('addProductForm').reset(); }
function closeEditModal() { document.getElementById('editProductModal').style.display = 'none'; document.getElementById('editProductForm').reset(); currentEditDbId = null; }
function closeRequestModal() { document.getElementById('requestModal').style.display = 'none'; document.getElementById('requestForm').reset(); }

function validateRequestQty() {
    const itemId = document.getElementById('req-item').value;
    const reqQtyInput = document.getElementById('req-qty');
    let reqQty = parseInt(reqQtyInput.value);
    
    if(!itemId || isNaN(reqQty)) return;

    const item = inventoryData.find(i => i.dbId === itemId);
    const alertMsg = translations[currentLang].reqAlertStockOut;

    if(reqQty > item.qty) {
        Swal.fire({ title: alertMsg, text: `รายการนี้คงเหลือเพียง ${item.qty} ${item.unit||'ชิ้น'}`, icon: 'warning', timer: 2000, showConfirmButton: false });
        reqQtyInput.value = item.qty;
    }
}

function saveProduct() {
    const docData = {
        id: document.getElementById('pd-id').value, name: document.getElementById('pd-name').value, 
        category: document.getElementById('pd-cat').value, qty: parseInt(document.getElementById('pd-qty').value), 
        unit: document.getElementById('pd-unit').value, importDate: document.getElementById('pd-import-date').value, 
        expiryDate: document.getElementById('pd-expiry-date').value, alertLimit: parseInt(document.getElementById('pd-alert').value),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    refs.inventory.add(docData).then(() => { 
        logAudit('import', docData.id, docData.name, docData.qty); 
        closeModal(); Swal.fire('สำเร็จ', 'บันทึกสินค้าเข้าคลังเรียบร้อย', 'success'); 
    });
}

function editProduct(dbId) {
    const item = inventoryData.find(i => i.dbId === dbId); if(!item) return;
    currentEditDbId = dbId;
    document.getElementById('edit-pd-id').value = item.id; document.getElementById('edit-pd-name').value = item.name;
    document.getElementById('edit-pd-cat').value = item.category; document.getElementById('edit-pd-qty').value = item.qty;
    document.getElementById('edit-pd-unit').value = item.unit || 'ขวด'; 
    document.getElementById('edit-pd-import-date').value = item.importDate || '';
    document.getElementById('edit-pd-expiry-date').value = item.expiryDate || '';
    document.getElementById('edit-pd-alert').value = item.alertLimit;
    document.getElementById('editProductModal').style.display = 'flex';
}

function updateProduct() {
    if(!currentEditDbId) return;
    const oldItem = inventoryData.find(i => i.dbId === currentEditDbId);
    const newQty = parseInt(document.getElementById('edit-pd-qty').value);
    const updatedData = {
        name: document.getElementById('edit-pd-name').value, category: document.getElementById('edit-pd-cat').value,
        qty: newQty, unit: document.getElementById('edit-pd-unit').value, 
        importDate: document.getElementById('edit-pd-import-date').value, expiryDate: document.getElementById('edit-pd-expiry-date').value,
        alertLimit: parseInt(document.getElementById('edit-pd-alert').value)
    };
    refs.inventory.doc(currentEditDbId).update(updatedData).then(() => {
        const diff = newQty - oldItem.qty;
        if (diff !== 0) logAudit(diff > 0 ? 'adjust_increase' : 'adjust_decrease', oldItem.id, oldItem.name, Math.abs(diff));
        closeEditModal(); Swal.fire('สำเร็จ', 'อัปเดตข้อมูลสินค้าเรียบร้อย', 'success');
    });
}

function deleteProduct(dbId) {
    const item = inventoryData.find(i => i.dbId === dbId);
    Swal.fire({ title: 'ยืนยันการลบ?', text: "หากลบแล้วจะไม่สามารถกู้คืนได้", icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3B30', confirmButtonText: 'ลบทิ้ง' }).then(res => {
        if(res.isConfirmed) refs.inventory.doc(dbId).delete().then(() => { logAudit('delete', item.id, item.name, item.qty); Swal.fire('ลบสำเร็จ', 'ลบสินค้าเรียบร้อย', 'success'); });
    });
}

// ==========================================
// 6. Requests Operations
// ==========================================
function submitRequest() {
    const itemId = document.getElementById('req-item').value; const reqQty = parseInt(document.getElementById('req-qty').value);
    const item = inventoryData.find(i => i.dbId === itemId);
    const alertMsg = translations[currentLang].reqAlertStockOut;

    if(reqQty > item.qty) return Swal.fire({ title: alertMsg, text: `รายการนี้คงเหลือเพียง ${item.qty} ${item.unit||'ชิ้น'}`, icon: 'error' });
    
    refs.requests.add({
        itemId: item.dbId, itemCode: item.id, itemName: item.name, reqQty, note: document.getElementById('req-note').value,
        status: 'pending', requestedBy: currentUser.email, userNotified: false, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => { closeRequestModal(); Swal.fire('ส่งคำขอสำเร็จ', 'รายการถูกส่งให้พิจารณาแล้ว', 'success'); });
}

function approveRequest(reqId, itemId, reqQty) {
    Swal.fire({ title: 'ยืนยันการอนุมัติ', text: "ระบบจะหักยอดคงเหลือทันที", icon: 'warning', showCancelButton: true, confirmButtonColor: '#34C759', confirmButtonText: 'ยืนยันอนุมัติ' }).then(res => {
        if (res.isConfirmed) {
            db.runTransaction(transaction => {
                const reqRef = refs.requests.doc(reqId); const itemRef = refs.inventory.doc(itemId);
                return transaction.get(itemRef).then(itemDoc => {
                    const newQty = itemDoc.data().qty - reqQty;
                    if (newQty < 0) throw "ปริมาณคงเหลือไม่เพียงพอ";
                    transaction.update(itemRef, { qty: newQty }); 
                    transaction.update(reqRef, { status: 'approved', userNotified: false });
                    return itemDoc.data();
                });
            }).then((data) => {
                logAudit('issue', data.id, data.name, reqQty);
                Swal.fire('อนุมัติสำเร็จ', 'ทำรายการเรียบร้อย', 'success');
            }).catch(err => Swal.fire('ข้อผิดพลาด', err, 'error'));
        }
    });
}

function rejectRequest(reqId) {
    Swal.fire({ title: 'ไม่อนุมัติคำขอ', text: 'ระบุเหตุผล (ถ้ามี)', input: 'text', icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3B30', confirmButtonText: 'ไม่อนุมัติ' }).then(res => {
        if(res.isConfirmed) refs.requests.doc(reqId).update({ status: 'rejected', rejectReason: res.value || 'ไม่ได้ระบุเหตุผล', userNotified: false }).then(() => Swal.fire('บันทึกสำเร็จ', 'ปฏิเสธเรียบร้อย', 'success'));
    });
}

// ==========================================
// 7. Users & Profile
// ==========================================
function loadProfileData() {
    if(!currentUser) return;
    document.getElementById('prof-email').value = currentUser.email || '';
    document.getElementById('prof-firstname').value = currentUser.firstName || '';
    document.getElementById('prof-lastname').value = currentUser.lastName || '';
    document.getElementById('prof-role').value = currentUser.role || 'user';
    document.getElementById('prof-dept').value = currentUser.department || '';
    document.getElementById('prof-phone').value = currentUser.phone || '';
    document.getElementById('prof-houseno').value = currentUser.houseNo || '';
    document.getElementById('prof-soi').value = currentUser.soi || '';
    document.getElementById('prof-road').value = currentUser.road || '';
    document.getElementById('prof-subdistrict').value = currentUser.subDistrict || '';
    document.getElementById('prof-district').value = currentUser.district || '';
    document.getElementById('prof-province').value = currentUser.province || '';
    document.getElementById('prof-zipcode').value = currentUser.zipCode || '';
}

function saveProfile() {
    const updates = { 
        firstName: document.getElementById('prof-firstname').value, 
        lastName: document.getElementById('prof-lastname').value,
        department: document.getElementById('prof-dept').value,
        phone: document.getElementById('prof-phone').value, 
        houseNo: document.getElementById('prof-houseno').value,
        soi: document.getElementById('prof-soi').value,
        road: document.getElementById('prof-road').value,
        subDistrict: document.getElementById('prof-subdistrict').value,
        district: document.getElementById('prof-district').value,
        province: document.getElementById('prof-province').value,
        zipCode: document.getElementById('prof-zipcode').value
    };
    refs.users.doc(currentUser.uid).update(updates).then(() => {
        Object.assign(currentUser, updates); updateUI(); Swal.fire('สำเร็จ', 'บันทึกข้อมูลส่วนตัวเรียบร้อย', 'success');
    }).catch(err => Swal.fire('ข้อผิดพลาด', err.message, 'error'));
}

function showAddUserModal() { document.getElementById('addUserModal').style.display = 'flex'; }
function closeAddUserModal() { document.getElementById('addUserModal').style.display = 'none'; document.getElementById('addUserForm').reset(); }

function submitNewUser() {
    const email = document.getElementById('new-user-email').value.trim(); const password = document.getElementById('new-user-password').value;
    const docData = {
        email, firstName: document.getElementById('new-user-firstname').value, lastName: document.getElementById('new-user-lastname').value, role: document.getElementById('new-user-role').value,
        department: document.getElementById('new-user-dept').value, phone: document.getElementById('new-user-phone').value, 
        houseNo: document.getElementById('new-user-houseno').value, soi: document.getElementById('new-user-soi').value, road: document.getElementById('new-user-road').value,
        subDistrict: document.getElementById('new-user-subdistrict').value, district: document.getElementById('new-user-district').value, province: document.getElementById('new-user-province').value, zipCode: document.getElementById('new-user-zipcode').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    Swal.fire({ title: 'กำลังสร้าง...', didOpen: () => Swal.showLoading() });
    secondaryAuth.createUserWithEmailAndPassword(email, password).then(cred => {
        docData.uid = cred.user.uid; return refs.users.doc(cred.user.uid).set(docData);
    }).then(() => { secondaryAuth.signOut(); closeAddUserModal(); Swal.fire('สำเร็จ', 'สร้างบัญชีเรียบร้อย', 'success'); })
      .catch(() => Swal.fire('ข้อผิดพลาด', 'บัญชีมีอยู่แล้ว หรือรหัสผ่านสั้นเกินไป', 'error'));
}

function editUser(uid) {
    const user = usersData.find(u => u.uid === uid); if(!user) return;
    currentEditUserId = uid;
    document.getElementById('edit-user-email').value = user.email; document.getElementById('edit-user-firstname').value = user.firstName || ''; document.getElementById('edit-user-lastname').value = user.lastName || '';
    document.getElementById('edit-user-role').value = user.role; document.getElementById('edit-user-dept').value = user.department || '';
    document.getElementById('edit-user-phone').value = user.phone || ''; 
    document.getElementById('edit-user-houseno').value = user.houseNo || '';
    document.getElementById('edit-user-soi').value = user.soi || '';
    document.getElementById('edit-user-road').value = user.road || '';
    document.getElementById('edit-user-subdistrict').value = user.subDistrict || '';
    document.getElementById('edit-user-district').value = user.district || '';
    document.getElementById('edit-user-province').value = user.province || '';
    document.getElementById('edit-user-zipcode').value = user.zipCode || '';
    document.getElementById('editUserModal').style.display = 'flex';
}
function closeEditUserModal() { document.getElementById('editUserModal').style.display = 'none'; document.getElementById('editUserForm').reset(); currentEditUserId = null; }

function submitEditUser() {
    if(!currentEditUserId) return;
    refs.users.doc(currentEditUserId).update({
        firstName: document.getElementById('edit-user-firstname').value, lastName: document.getElementById('edit-user-lastname').value, role: document.getElementById('edit-user-role').value,
        department: document.getElementById('edit-user-dept').value, phone: document.getElementById('edit-user-phone').value,
        houseNo: document.getElementById('edit-user-houseno').value, soi: document.getElementById('edit-user-soi').value, road: document.getElementById('edit-user-road').value,
        subDistrict: document.getElementById('edit-user-subdistrict').value, district: document.getElementById('edit-user-district').value, province: document.getElementById('edit-user-province').value, zipCode: document.getElementById('edit-user-zipcode').value
    }).then(() => { closeEditUserModal(); Swal.fire('สำเร็จ', 'อัปเดตเรียบร้อย', 'success'); });
}

function deleteUser(uid, email) {
    Swal.fire({ title: 'ลบบัญชี?', text: `ต้องการลบ ${email}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#FF3B30', confirmButtonText: 'ลบข้อมูล' }).then(res => { 
        if (res.isConfirmed) refs.users.doc(uid).delete().then(() => Swal.fire('ลบสำเร็จ', 'บัญชีถูกนำออกแล้ว', 'success')); 
    });
}

// ==========================================
// 8. View Renderers (Tables & HTML generation)
// ==========================================
function renderSidebarAndWidgets(t) {
    const isAdmin = currentUser.role === 'admin';
    document.getElementById('btn-action-text').innerText = isAdmin ? t.btnAdmin : t.btnUser;
    document.getElementById('btn-action-icon').className = isAdmin ? 'fas fa-plus' : 'fas fa-hand-holding';

    const pendingCnt = isAdmin ? requestsData.filter(r => r.status === 'pending').length : 0;
    
    let menuHtml = `<div class="nav-item ${currentTab === 'sec-inventory'?'active':''}" onclick="switchTab('sec-inventory', this)"><i class="fas fa-boxes"></i> <span>${isAdmin?t.menuAdmin1:t.menuUser1}</span></div>`;
    menuHtml += `<div class="nav-item ${currentTab === 'sec-approvals'?'active':''}" onclick="switchTab('sec-approvals', this)"><i class="fas ${isAdmin?'fa-clipboard-check':'fa-history'}"></i> <span>${isAdmin?t.menuAdmin2:t.menuUser2}</span> ${pendingCnt>0?`<span style="background:#FF3B30; color:white; border-radius:50%; padding:2px 8px; font-size:10px; margin-left:auto;">${pendingCnt}</span>`:''}</div>`;
    if(isAdmin) {
        menuHtml += `<div class="nav-item ${currentTab === 'sec-reports'?'active':''}" onclick="switchTab('sec-reports', this)"><i class="fas fa-chart-bar"></i> <span>${t.menuAdmin3}</span></div>`;
        menuHtml += `<div class="nav-item ${currentTab === 'sec-users'?'active':''}" onclick="switchTab('sec-users', this)"><i class="fas fa-users"></i> <span>${t.menuAdmin4}</span></div>`;
        menuHtml += `<div class="nav-item ${currentTab === 'sec-audit'?'active':''}" onclick="switchTab('sec-audit', this)"><i class="fas fa-list-alt"></i> <span>${t.menuAdmin5}</span></div>`;
    } else {
        menuHtml += `<div class="nav-item ${currentTab === 'sec-profile'?'active':''}" onclick="switchTab('sec-profile', this)"><i class="far fa-user-circle"></i> <span>${t.menuUser3}</span></div>`;
    }
    document.getElementById('nav-menu').innerHTML = menuHtml;

    const available = inventoryData.filter(i => i.qty > 0).length;
    let widgetsHtml = '';
    if (isAdmin) {
        widgetsHtml = `<div class="stat-card primary" onclick="filterInventory('all')"><div class="info"><p>${t.widgetAdmin1}</p><h3>${inventoryData.length}</h3></div><div class="stat-icon"><i class="fas fa-box-open"></i></div></div>
                       <div class="stat-card warning" onclick="filterInventory('low')"><div class="info"><p>${t.widgetAdmin2}</p><h3>${inventoryData.filter(i=>i.qty>0&&i.qty<=i.alertLimit).length}</h3></div><div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div></div>
                       <div class="stat-card danger" onclick="filterInventory('out')"><div class="info"><p>${t.widgetAdmin3}</p><h3>${inventoryData.filter(i=>i.qty===0).length}</h3></div><div class="stat-icon"><i class="fas fa-ban"></i></div></div>`;
    } else {
        const myReq = requestsData.filter(r => r.requestedBy === currentUser.email);
        widgetsHtml = `<div class="stat-card success" onclick="filterInventory('available')"><div class="info"><p>${t.widgetUser1}</p><h3>${available}</h3></div><div class="stat-icon"><i class="fas fa-check-circle"></i></div></div>
                       <div class="stat-card warning" onclick="switchTab('sec-approvals')"><div class="info"><p>${t.widgetUser2}</p><h3>${myReq.filter(r=>r.status==='pending').length}</h3></div><div class="stat-icon"><i class="fas fa-clock"></i></div></div>
                       <div class="stat-card primary" onclick="switchTab('sec-approvals')"><div class="info"><p>${t.widgetUser3}</p><h3>${myReq.filter(r=>r.status==='approved').length}</h3></div><div class="stat-icon"><i class="fas fa-clipboard-check"></i></div></div>`;
    }
    document.getElementById('dashboard-widgets').innerHTML = widgetsHtml;
}

function renderInventoryTable(t, data = inventoryData) {
    const extraTh = currentUser.role !== 'admin' ? `<th>${t.thImportDate}</th><th>${t.thExpiryDate}</th>` : '';
    const actionTh = currentUser.role==='admin' ? `<th style="text-align:right;">${t.adminInvAction}</th>` : '';
    document.querySelector('#inventory-table thead').innerHTML = `<tr><th class="col-id">${t.thId}</th><th>${t.thName}</th><th class="col-cat">${t.thCat}</th><th class="col-qty">${t.thQty}</th><th class="col-unit">${t.thUnit}</th>${extraTh}<th class="col-status">${t.thStatus}</th>${actionTh}</tr>`;
    
    if(data.length === 0) {
        let colSpan = currentUser.role==='admin' ? 7 : 8;
        return document.getElementById('inventory-list').innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding:40px; color:var(--text-tertiary);">${t.tableEmptyInv}</td></tr>`; 
    }
    
    document.getElementById('inventory-list').innerHTML = data.map(i => {
        const isOut = i.qty === 0, isLow = i.qty <= i.alertLimit;
        const bClass = isOut ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success');
        const sText = isOut ? t.statusOut : (isLow ? t.statusLow : t.statusNormal);
        
        let extraTd = '';
        if(currentUser.role !== 'admin') {
            const impDate = i.importDate ? new Date(i.importDate).toLocaleDateString(currentLang==='th'?'th-TH':'en-GB') : '-';
            const expDate = i.expiryDate ? new Date(i.expiryDate).toLocaleDateString(currentLang==='th'?'th-TH':'en-GB') : '-';
            extraTd = `<td style="color:var(--text-secondary); font-size: 13px;">${impDate}</td><td style="color:var(--text-secondary); font-size: 13px;">${expDate}</td>`;
        }
        
        const actionTd = currentUser.role==='admin' ? `<td style="text-align:right;"><button onclick="editProduct('${i.dbId}')" class="btn-primary" style="background:#FF9500; display:inline-flex; padding:6px 10px; margin-right:4px;"><i class="fas fa-edit"></i></button><button onclick="deleteProduct('${i.dbId}')" class="btn-primary" style="background:#FF3B30; display:inline-flex; padding:6px 10px;"><i class="fas fa-trash"></i></button></td>` : '';
        return `<tr><td style="color:var(--text-tertiary);">${i.id}</td><td style="font-weight:500;">${i.name}</td><td style="color:var(--text-secondary);">${currentLang==='en'?getCategoryEn(i.category):i.category}</td><td style="text-align:right; font-weight:500;">${i.qty}</td><td style="color:var(--text-secondary);">${currentLang==='en'?getUnitEn(i.unit||'ชิ้น'):(i.unit||'ชิ้น')}</td>${extraTd}<td class="col-status"><span class="badge ${bClass}"><span class="status-dot"></span> ${sText}</span></td>${actionTd}</tr>`;
    }).join('');
}

function renderRequestsTable(t) {
    document.querySelector('#requests-table thead').innerHTML = `<tr><th>${t.reqThDate}</th><th>${t.reqThUser}</th><th>${t.reqThItem}</th><th style="text-align:right;">${t.reqThQty}</th><th style="text-align:center;">${t.reqThStatus}</th><th>${t.reqThNote}</th>${currentUser.role==='admin'?`<th style="text-align:right;">${t.adminReqAction}</th>`:''}</tr>`;
    const data = currentUser.role==='admin' ? requestsData : requestsData.filter(r => r.requestedBy === currentUser.email);
    if(data.length === 0) return document.getElementById('requests-list').innerHTML = `<tr><td colspan="${currentUser.role==='admin'?7:6}" style="text-align:center; padding:40px; color:var(--text-tertiary);">${t.tableEmptyReq}</td></tr>`;
    
    document.getElementById('requests-list').innerHTML = data.map(r => {
        let bClass = 'badge-warning', sText = t.statusPending, actionBtns = '';
        if(r.status === 'approved') { bClass = 'badge-success'; sText = t.statusApproved; }
        else if(r.status === 'rejected') { bClass = 'badge-danger'; sText = t.statusRejected; }
        
        let noteText = r.status === 'rejected' ? (r.rejectReason || '-') : (r.note || '-');
        let noteColor = r.status === 'rejected' ? 'color:#FF3B30;' : 'color:var(--text-secondary);';

        if(r.status === 'pending' && currentUser.role==='admin') actionBtns = `<td style="text-align:right;"><button onclick="approveRequest('${r.dbId}', '${r.itemId}', ${r.reqQty})" class="btn-primary" style="background:#34C759; display:inline-flex; padding:6px 12px; margin-right:4px;">${t.btnApprove}</button><button onclick="rejectRequest('${r.dbId}')" class="btn-primary" style="background:#FF3B30; display:inline-flex; padding:6px 12px;">${t.btnReject}</button></td>`;
        else if(currentUser.role==='admin') actionBtns = `<td></td>`;
        return `<tr><td style="color:var(--text-secondary); font-size:13px; vertical-align:top;">${r.createdAt?r.createdAt.toDate().toLocaleDateString(currentLang==='th'?'th-TH':'en-GB'):''}</td><td style="vertical-align:top;">${r.requestedBy.split('@')[0]}</td><td style="font-weight:500; vertical-align:top;">[${r.itemCode}] ${r.itemName}</td><td style="text-align:right; font-weight:500; vertical-align:top;">${r.reqQty}</td><td style="text-align:center; vertical-align:top;"><span class="badge ${bClass}"><span class="status-dot"></span> ${sText}</span></td><td style="vertical-align:top; font-size:13px; ${noteColor}">${noteText}</td>${actionBtns}</tr>`;
    }).join('');
}

function renderReportsTable(t) {
    const summary = {};
    
    requestsData.forEach(r => {
        if(!summary[r.itemCode]) summary[r.itemCode] = { name: r.itemName, count: 0, total: 0 };
        if(r.status === 'approved') {
            summary[r.itemCode].count++; 
            summary[r.itemCode].total += r.reqQty;
        }
    });

    const keys = Object.keys(summary).filter(k => summary[k].total > 0);
    if(keys.length === 0) return document.getElementById('reports-list').innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--text-tertiary);">${t.tableEmptyRep}</td></tr>`;
    
    document.getElementById('reports-list').innerHTML = keys.map(k => `<tr><td style="color:var(--text-tertiary);">${k}</td><td style="font-weight:500;">${summary[k].name}</td><td style="text-align:right;">${summary[k].count}</td><td style="text-align:right; font-weight:600; color:var(--brand-primary);">${summary[k].total}</td></tr>`).join('');
}

function renderUsersTable(t) {
    if(usersData.length === 0) return document.getElementById('users-list').innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: var(--text-tertiary);">${t.tableEmptyUser}</td></tr>`;
    document.getElementById('users-list').innerHTML = usersData.map(u => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'ไม่ระบุ';
        const roleBadge = u.role === 'admin' ? `<span style="background:#e0e7ff; color:#4338ca; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:500;"><i class="fas fa-shield-alt"></i> ${t.roleAdmin}</span>` : `<span style="background:#f1f5f9; color:#475569; padding:4px 8px; border-radius:12px; font-size:12px; font-weight:500;"><i class="fas fa-user"></i> ${t.roleUser}</span>`;
        const actionBtn = `<td style="text-align:right;"><button onclick="editUser('${u.uid}')" class="btn-primary" style="background:#FF9500; display:inline-flex; padding:6px 10px; margin-right:4px;" ${u.email.includes('admin')&&u.uid!==currentUser.uid?'disabled':''}><i class="fas fa-user-edit"></i></button><button onclick="deleteUser('${u.uid}', '${u.email}')" class="btn-primary" style="background:#FF3B30; display:inline-flex; padding:6px 10px;" ${u.email.includes('admin')?'disabled':''}><i class="fas fa-trash"></i></button></td>`;
        return `<tr><td style="font-weight:500;">${u.email}</td><td><div style="font-weight:500;">${name}</div><div style="font-size:11px;color:var(--text-secondary);">${u.department||''}</div></td><td>${roleBadge}</td>${actionBtn}</tr>`;
    }).join('');
}

function renderAuditTable(t) {
    if(auditData.length === 0) return document.getElementById('audit-list').innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-tertiary);">ยังไม่มีประวัติการเคลื่อนไหว</td></tr>`;
    document.getElementById('audit-list').innerHTML = auditData.map(a => {
        const dateStr = a.createdAt ? a.createdAt.toDate().toLocaleString(currentLang==='th'?'th-TH':'en-GB') : '';
        const actionText = t.auditAction[a.action] || a.action;
        let bClass = 'badge-success'; 
        if(['issue', 'adjust_decrease'].includes(a.action)) bClass = 'badge-warning';
        if(a.action === 'delete') bClass = 'badge-danger';
        return `<tr><td style="font-size:13px; color:var(--text-secondary);">${dateStr}</td><td><span class="badge ${bClass}">${actionText}</span></td><td style="font-weight:500;">[${a.itemCode}] ${a.itemName}</td><td style="text-align:right; font-weight:600;">${a.qty}</td><td style="font-size:13px;">${a.byUser}</td></tr>`;
    }).join('');
}

function exportToCSV() {
    let csv = "data:text/csv;charset=utf-8,\uFEFFรหัส,รายการ,จำนวนครั้งที่เบิก,ปริมาณเบิกออกรวม\n";
    const summary = {};
    requestsData.filter(r => r.status === 'approved').forEach(r => {
        if(!summary[r.itemCode]) summary[r.itemCode] = { name: r.itemName, count: 0, total: 0 };
        summary[r.itemCode].count++; summary[r.itemCode].total += r.reqQty;
    });
    Object.keys(summary).forEach(k => { csv += `${k},"${summary[k].name.replace(/"/g, '""')}",${summary[k].count},${summary[k].total}\n`; });
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = `facestock_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}