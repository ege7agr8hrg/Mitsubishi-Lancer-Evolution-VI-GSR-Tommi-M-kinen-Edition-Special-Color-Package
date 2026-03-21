firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '../log/red/login.html';
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
    
const logoutBtn = async () => {
    try {
        await firebase.auth().signOut(); 
        
        localStorage.removeItem('role');
        localStorage.removeItem('uid');

        window.location.href = 'login.html'; 
    } catch (error) {
        console.error('Không thể đăng xuất', error);
    }
};

// This matches the ID we added to the HTML
document.getElementById('btnlogout').addEventListener('click', logoutBtn);