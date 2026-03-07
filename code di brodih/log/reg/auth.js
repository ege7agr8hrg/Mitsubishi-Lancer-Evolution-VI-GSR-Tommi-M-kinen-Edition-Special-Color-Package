// admin mặc định
const adminAccount = {
    username: "admin",
    password: "123456",
    role: "admin"
};

// LOGIN
function login(username, password){

    if(username === adminAccount.username && password === adminAccount.password){
        localStorage.setItem("role","admin");
        window.location.href = "../../manage.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.username === username && u.password === password);

    if(user){
        localStorage.setItem("role","user");
        window.location.href = "../../index.html";
    }else{
        alert("Sai tài khoản hoặc mật khẩu");
    }
}