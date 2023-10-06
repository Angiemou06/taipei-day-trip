getOrderStatus();
function getOrderStatus(){
    const orderNumberElement = document.getElementById("order-number");
    const orderNumber = orderNumberElement.innerText;
    const jwtToken = localStorage.getItem('Token');
    const header = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    };
    url = "/api/order/"+orderNumber;
    fetch(url,{method: "GET",headers: header})
    .then(function(response) {
        if (response) {
            return response.json();
        }
    })
    .then(function(data){
        const welcome_text = document.getElementById("welcome-text");
        welcome_text.innerText = data["name"] +"您好，感謝您的訂購！"
        if (data["order_status"]==="已付款"){
            const order_status = document.getElementById("order-status");
            order_status.innerText = "已完成訂單付款"
        }
        else{
            order_status.innerText = "尚未完成訂單付款"
        }
        deleteBooking();

    })
}

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