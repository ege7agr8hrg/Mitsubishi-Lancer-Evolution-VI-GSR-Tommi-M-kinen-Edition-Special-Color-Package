document.querySelector("form").addEventListener("submit", function(e){

    e.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;

    if(password !== confirmPassword){
        alert("Mật khẩu nhập lại không khớp");
        return;
    }

    register(username,password);

    alert("Đăng ký thành công");

    window.location.href="login.html";

});