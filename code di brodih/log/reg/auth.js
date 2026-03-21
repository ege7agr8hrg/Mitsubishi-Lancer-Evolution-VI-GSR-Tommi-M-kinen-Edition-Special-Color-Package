// auth.js (Firebase Auth + legacy admin fallback)
const adminAccount = {
    username: "admin",
    password: "123456",
    role: "admin"
};

const loginstatus = false;


function routeByEmail(email){
    const lowerEmail = (email || '').toLowerCase();

    // hardcoded per-account mapping
    const specialRedirect = {
        'boss@gle.com': '../../index.html',
        'staff@gle.com': '../../index.html',
        'special@gmail.com': '../../index.html',
    };
    if (specialRedirect[lowerEmail]) return specialRedirect[lowerEmail];

    // domain-based rules
    if (lowerEmail.endsWith('@admin-domain.com')) return '../../index.html';
    if (lowerEmail.endsWith('@partner.com')) return '../../index.html';

    // default user app path.
    return '../../index-n.html';
}

function login(email, password){
    email = email.trim();
    if (!email || !password){
        alert('Vui lòng nhập email và mật khẩu.');
        return;
    }

    // Legacy admin local login for local use
    if(email === adminAccount.username && password === adminAccount.password){
        localStorage.setItem('role', 'admin');
        window.location.href = routeByEmail('admin');
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('role', 'user');
            localStorage.setItem('uid', user.uid);
            window.location.href = routeByEmail(user.email);
        })
        .catch(err => {
            alert('Đăng nhập thất bại: ' + err.message);
        });
}

function logout(){
    firebase.auth().signOut().finally(() => {
        localStorage.removeItem('role');
        localStorage.removeItem('uid');
        window.location.href = 'login.html';
    });
}

function ensureAuth(redirectUrl = 'login.html'){
    firebase.auth().onAuthStateChanged(user => {
        if(!user){
            window.location.href = redirectUrl;
        }
    });
}
