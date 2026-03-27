firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'log/reg/login.html';
        return;
    }
    
    try {
        // Lấy thông tin user từ Firestore
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.data();
        const role = data?.role || 'user';
        
        // Hiển thị thông tin
        document.getElementById('userEmail').innerText = user.email;
        document.getElementById('userName').innerText = data?.username || 'Chưa đặt';
        document.getElementById('userRole').innerText = role === 'admin' ? 'Quản trị viên' : 'Người dùng';
        document.getElementById('userUid').innerText = user.uid;
        
        // Kiểm tra role để ẩn/hiện nút Quản lý
        const manageBtn = document.getElementById('manageBtn');
        if (manageBtn) {
            if (role === 'admin') {
                manageBtn.style.display = 'inline-block';
                manageBtn.onclick = () => window.location.href = 'manage.html';
            } else {
                manageBtn.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Lỗi lấy user info:', error);
        document.getElementById('userEmail').innerText = user.email;
        document.getElementById('userName').innerText = 'Không thể tải';
        document.getElementById('userRole').innerText = 'Người dùng';
        document.getElementById('userUid').innerText = user.uid;
        
        // Mặc định ẩn nút quản lý nếu có lỗi
        const manageBtn = document.getElementById('manageBtn');
        if (manageBtn) manageBtn.style.display = 'none';
    }
});

// Xử lý nút quay lại
document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Xử lý đăng xuất
async function logout() {
    try {
        await firebase.auth().signOut();
        localStorage.removeItem('role');
        localStorage.removeItem('uid');
        sessionStorage.removeItem('welcomePopup');
        window.location.href = 'log/reg/login.html';
    } catch (error) {
        console.error('Lỗi đăng xuất:', error);
        alert('Không thể đăng xuất. Vui lòng thử lại.');
    }
}

document.getElementById('btnlogout').addEventListener('click', logout);