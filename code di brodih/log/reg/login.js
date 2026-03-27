document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log("Đang đăng nhập với", email, password);
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("Đăng nhập thành công", userCredential.user);
      alert("Đăng nhập thành công!");
      window.location.href = '../../index.html';
    })
    .catch(error => {
      console.error("Lỗi đăng nhập:", error);
      alert("Đăng nhập thất bại: " + error.message);
    });
});