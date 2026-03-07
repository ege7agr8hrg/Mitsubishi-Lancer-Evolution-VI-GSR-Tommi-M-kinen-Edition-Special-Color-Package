document.querySelector("form").addEventListener("submit", function(e){

    e.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    login(username,password);

});