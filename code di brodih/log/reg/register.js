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

// register.js

// Ensure this function is called when your register button is clicked
async function handleRegister(e) {
    // 1. Prevent the page from reloading if inside a form
    if (e) e.preventDefault();

    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    // Basic check before calling Firebase
    if (!email || !password) {
        alert("Vui lòng nhập đầy đủ email và mật khẩu.");
        return;
    }

    try {
        // 2. We 'await' the result. The code STOPS here until Firebase answers.
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // 3. This line ONLY runs if the creation was successful
        console.log("Đăng ký thành công:", userCredential.user.uid);
        alert("Tài khoản đã được tạo thành công!");
        
        // 4. Redirect only after success
        window.location.href = 'login.html';

    } catch (error) {
        // 5. If the email is already used, Firebase throws an error, 
        // and the code jumps straight to this 'catch' block.
        console.error("Lỗi đăng ký:", error.code);

        if (error.code === 'auth/email-already-in-use') {
            alert("Email này đã được sử dụng. Vui lòng dùng email khác.");
        } else if (error.code === 'auth/weak-password') {
            alert("Mật khẩu phải có ít nhất 6 ký tự.");
        } else if (error.code === 'auth/invalid-email') {
            alert("Email không hợp lệ.");
        } else {
            alert("Đã xảy ra lỗi: " + error.message);
        }
        
        // Because we are in the catch block, the redirect to login.html 
        // in the 'try' block never happens.
    }
}

// Attach the function to your button
document.getElementById('registerBtn').addEventListener('click', handleRegister);