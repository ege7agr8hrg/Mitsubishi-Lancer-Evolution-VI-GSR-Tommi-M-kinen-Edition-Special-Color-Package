// auth.js
function routeByEmail(email) {
  const lowerEmail = (email || '').toLowerCase();
  // Bạn có thể tuỳ chỉnh redirect theo role
  if (lowerEmail === 'admin@pcstore.com') return '../../manage.html';
  return '../../index.html';
}

function login(email, password) {
  email = email.trim();
  if (!email || !password) {
    alert('Vui lòng nhập email và mật khẩu.');
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('uid', user.uid);
      // Chuyển hướng dựa trên email (hoặc có thể fetch role từ Firestore)
      window.location.href = routeByEmail(user.email);
    })
    .catch(err => {
      alert('Đăng nhập thất bại: ' + err.message);
    });
}

function logout() {
  firebase.auth().signOut().finally(() => {
    localStorage.removeItem('uid');
    window.location.href = 'login.html';
  });
}

function ensureAuth(redirectUrl = 'login.html') {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) window.location.href = redirectUrl;
  });
}