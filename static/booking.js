user_name = document.querySelector(".member-name");
order_image = document.querySelector(".order-images");
attraction_name = document.getElementById("attraction-name");
order_date = document.getElementById("order-date");
open_time = document.getElementById("open-time");
price = document.getElementById("price");
address = document.getElementById("address");
confirm_price = document.querySelector(".confirm-price");
delete_icon = document.querySelector(".delete-icon");
main = document.querySelector(".main");
footer = document.querySelector(".footer");
footer_text = document.querySelector(".footer-text")

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
        if(data["data"] == null){
             window.location.href = "/";
        }
        user_name.innerHTML=data["data"]["name"];
    })
    .catch(error => {
        console.log('Network error:', error);
    });

}

window.onload=checkUserStatus();


getBooking();
function getBooking(){
    const jwtToken = localStorage.getItem('Token');
    const header = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    };
    src = "/api/booking";
    fetch(src,{method: "GET",headers: header})
    .then(function(response) {
        if (response) {
            return response.json();
        }
    })
    .then(function(data) {
        if (data["error"]===true){
            main.removeChild(main.children[1]);
            main.removeChild(main.children[1]);
            main.removeChild(main.children[1]);
            main.removeChild(main.children[1]);
            main.removeChild(main.children[1]);
            main.removeChild(main.children[1]);
            main.removeChild(main.children[1]);
            const newElementContainer = document.createElement('div');
            main.appendChild(newElementContainer);
            newElementContainer.style.display="flex";
            newElementContainer.style.justifyContent="center";
            newElementContainer.style.alignItems="center";
            newElementContainer.style.width="100%";
            const newElement = document.createElement('div');
            newElement.textContent = '目前沒有任何待預訂的行程';
            newElementContainer.appendChild(newElement);
            newElement.style.marginTop="31px";
            newElement.style.marginBottom="40px";
            newElement.style.color="#666";
            newElement.style.fontFamily="Noto Sans TC";
            newElement.style.fontSize="16px"
            newElement.style.fontStyle="normal";
            newElement.style.fontWeight="500";
            newElement.style.width="1000px";
            footer.style.height="100vh";
            footer.style.alignItems="initial";
            footer_text.style.marginTop="40px";
        }
        else{
            order_image.src = data["data"]["attraction"]["image"];
            attraction_name.innerHTML = data["data"]["attraction"]["name"];
            const originalDate = new Date(data["data"]["date"]);
            const year = originalDate.getFullYear();
            const month = String(originalDate.getMonth() + 1).padStart(2, '0');
            const day = String(originalDate.getDate()).padStart(2, '0');
            const formattedDate = year+"-"+month+"-"+day;
            order_date.innerHTML = formattedDate;
            const time = data["data"]["time"];
            if (time==="morning"){
                open_time.innerHTML = "早上9點到下午4點";
            }
            else{
                open_time.innerHTML = "下午2點到晚上9點";
            }
            price.innerHTML = "新台幣 "+data["data"]["price"]+" 元";
            address.innerHTML = data["data"]["attraction"]["address"];
            confirm_price.innerHTML = "總價：新台幣"+data["data"]["price"]+"元";
        }
    });
};

function deleteBooking(){
    const jwtToken = localStorage.getItem('Token');
    const header = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    };
    src = "/api/booking";
    fetch(src,{method: "DELETE",headers: header})
    .then(function(response) {
        if (response) {
            return response.json();
        }
    })
    .then(function(data) {
        console.log(data);
    });

}

delete_icon.addEventListener('click', () => {
    deleteBooking();
    location.reload();
});