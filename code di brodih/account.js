firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '../code di brodih/log/reg/login.html';
} else {
    console.log('Chào', user.email, '!');
    }
});


function inputmanage(){
    window.location.href = './manage.html';
}

function inputshowcase(){
    window.location.href = './index.html';
}

// Define the function first
const logoutBtn = async () => {
    try {
        await firebase.auth().signOut(); 
        
        // Clear local data
        localStorage.removeItem('role');
        localStorage.removeItem('uid');

        // Redirect to the correct login path
        // Based on your account.js line 3, the path should likely be:
        window.location.href = '../code di brodih/log/reg/login.html'; 
    } catch (error) {
        console.error('Không thể đăng xuất', error);
        alert('Lỗi khi đăng xuất!');
    }
};

// Ensure the DOM is loaded before grabbing the button
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnlogout');
    if (btn) {
        btn.addEventListener('click', logoutBtn);
    }
});
// This matches the ID we added to the HTML
document.getElementById('btnlogout').addEventListener('click', logoutBtn);