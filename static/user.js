let signup_name = document.getElementById("sign-up-name");
let signup_email = document.getElementById("sign-up-email");
let signup_password = document.getElementById("sign-up-password");
let signup_message = document.getElementById("sign-up-message");
let signup_page = document.querySelector(".sign-up-page");
let signin_page = document.querySelector(".sign-in-page");
let button = document.getElementById("signIn-signUp-button");
let signIn = document.querySelector(".sign-in-container");
let background = document.querySelector("#full-page");
let closebtn = document.querySelector(".close-container");
let closebtn2 = document.querySelector(".close-container-2");
let signInQuestion = document.querySelector("#sign-in-question-btn");
let signUp = document.querySelector(".sign-up-container");
let signUpQuestion = document.querySelector("#sign-up-question-btn");
let signin_email = document.getElementById("sign-in-email");
let signin_password = document.getElementById("sign-in-password");
let signin_message = document.getElementById("sign-in-message");
let userLoggedIn = false;

// 登入、註冊會員頁面切換
function signInsignUp(){
    signIn.style.display = "flex";
    background.style.display = "block";
    closebtn.addEventListener('click',()=>{
        signIn.style.display = "none";
        background.style.display = "none";
    });
    signInQuestion.addEventListener('click',()=>{
        signUp.style.display="flex"
        background.style.display = "block";
        signin_page.style.height="275px";
        signInQuestion.style.paddingTop = "0";
        signin_message.textContent = "";
        signin_message.style.margin = "0";
        signin_message.style.height = "10px";
    });
    closebtn2.addEventListener('click',()=>{
        signUp.style.display = "none";
        background.style.display = "none";
        signIn.style.display = "none";
    });
    signUpQuestion.addEventListener('click',()=>{
        signUp.style.display = "none";
        signIn.style.display = "flex";
        signup_page.style.height="332px";
        signUpQuestion.style.paddingTop = "0";
        signup_message.textContent = "";
        signup_message.style.margin = "0";
        signup_message.style.height = "10px";    
    });
    
}

let signup_button = document.getElementById("sign-up-button")
signup_button.addEventListener('click',()=>{
    fetchSignUp();
})
signup_password.addEventListener('keydown',(e)=>{
    if(e.key === 'Enter'){
        fetchSignUp();
    }
})

function fetchSignUp(){
    let data={
        "name": signup_name.value,
        "email": signup_email.value,
        "password": signup_password.value
    }
 
    fetch('/api/user',{method: "POST",headers: {'Content-Type': 'application/json'},body: JSON.stringify(data)})
    .then(function (response) {

        return response.json();
    })
    .then(function (data) {
        if (data["ok"]){
            signup_page.style.height="372px";
            signUpQuestion.style.paddingTop = "20px";
            signup_message.textContent = "註冊成功，請返回登入頁面登入";
            signup_message.style.color = "#000000";
            signup_message.style.margin = "10px";
            signup_message.style.textAlign = "center";
            
        }
        else{
            signup_page.style.height="372px";
            signUpQuestion.style.paddingTop = "20px";
            signup_message.textContent = data["message"];
            signup_message.style.color = "#ff0000";
            signup_message.style.margin = "10px";
            signup_message.style.textAlign = "center";
            closebtn2.addEventListener('click',()=>{
                signup_page.style.height="332px";
                signUpQuestion.style.paddingTop = "0";
                signup_message.textContent = "";
                signup_message.style.margin = "0";
                signup_message.style.height = "10px";
            })
        }
        signup_name.value="";
        signup_email.value="";
        signup_password.value="";
    })

    .catch(error => {
        console.error('請求錯誤:', error);
    });

}

let signin_button = document.getElementById("sign-in-button")
signin_button.addEventListener('click',()=>{
    fetchSignIn();

})
signin_password.addEventListener('keydown',(e)=>{
    if(e.key === 'Enter'){
        fetchSignIn();
    }
})

function fetchSignIn(){
    let data={
        "email": signin_email.value,
        "password": signin_password.value
    }
    src="/api/user/auth";
    fetch(src,{method: "PUT",headers: {'Content-Type': 'application/json'},body: JSON.stringify(data)})
    .then(function (response){
        return response.json();
    })
    .then(function (data){
        if (data["token"]){
            signin_page.style.height="315px";
            signInQuestion.style.paddingTop = "20px";
            signin_message.textContent = "登入成功";
            signin_message.style.color = "#000000";
            signin_message.style.margin = "10px";
            signin_message.style.textAlign = "center";
            localStorage.setItem('Token', data["token"]);
            userLoggedIn = true;
            window.location.reload();

        }
        else{
            signin_page.style.height="315px";
            signInQuestion.style.paddingTop = "20px";
            signin_message.textContent = data["message"];
            signin_message.style.color = "#ff0000";
            signin_message.style.margin = "10px";
            signin_message.style.textAlign = "center";
            closebtn.addEventListener('click',()=>{
                signin_page.style.height="275px";
                signInQuestion.style.paddingTop = "0";
                signin_message.textContent = "";
                signin_message.style.margin = "0";
                signin_message.style.height = "10px";
            })
        }
        signin_email.value="";
        signin_password.value="";
        checkUserStatus();
    })
    .catch(error => {
        console.error('請求錯誤:', error);
    });
}

function checkUserStatus(){
    const jwtToken = localStorage.getItem('Token');
    const header = {
        'Authorization': `Bearer ${jwtToken}`
    };
    
    src="/api/user/auth";
    fetch(src, {method: "GET",headers:header})
    .then(function(response) {
        if (response) {
            return response.json();
        }
    })
    .then(function(data) {
        if(data["data"] !== null){
            button.textContent = "登出系統"
            userLoggedIn = true;
        }
        else{
            userLoggedIn = false; 
        }
    })
    .catch(error => {
        console.error('Network error:', error);
    });

}

window.onload=checkUserStatus();

function logOut(){
    localStorage.removeItem('Token');
    userLoggedIn = false;
}

button.addEventListener('click',()=>{
    if (userLoggedIn){
        logOut();
        button.textContent = "登入／註冊"
        window.location.reload();
    }
    else{
        signInsignUp();
    }
})