document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;

    if (!email || !password || !confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp.');
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection('users').doc(user.uid).set({
                email,
                username,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert('Tạo tài khoản thành công! Vui lòng đăng nhập.');
            window.location.href = 'login.html';
        })
        .catch(err => {
            console.error('Lỗi đăng ký:', err);
            alert('Lỗi đăng ký: ' + err.message);
        });
});