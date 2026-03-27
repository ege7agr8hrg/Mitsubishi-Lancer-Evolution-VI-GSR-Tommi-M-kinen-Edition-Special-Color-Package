document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (!email || !password) {
    alert('Vui lòng nhập email và mật khẩu.');
    return;
  }
  if (password !== confirm) {
    alert('Mật khẩu xác nhận không khớp.');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const role = (email === 'admin@pcstore.com') ? 'admin' : 'user';
      return window.db.collection('users').doc(user.uid).set({
        email: email,
        username: username || email,
        role: role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      window.location.href = 'login.html';
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') alert('Email đã được sử dụng.');
      else if (err.code === 'auth/weak-password') alert('Mật khẩu phải có ít nhất 6 ký tự.');
      else alert('Lỗi: ' + err.message);
    });
});