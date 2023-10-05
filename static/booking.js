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

TPDirect.setupSDK(137094, 'app_3nR5emGikrgjUTs0oy4Ld75bVkUKL1zTd9zXsqTDz7qU5NqTbzKXgeMr7CYL', 'sandbox');

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

// 以下提供必填 CCV 以及選填 CCV 的 Example
// 必填 CCV Example
var fields = {
    number: {
        // css selector
        element: document.getElementById('card-number'),
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: document.getElementById('card-ccv'),
        placeholder: '後三碼'
    }
}

TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray'
        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            // 'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6, 
        endIndex: 11
    }
});

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true;
    // --> you can call TPDirect.card.getPrime()
    const submitButton = document.getElementById('pay-button');
    if (update.canGetPrime) {
    //     // Enable submit Button to get prime.
        submitButton.removeAttribute('disabled')
    } else {
    //     // Disable submit Button to get prime.
        submitButton.setAttribute('disabled', true)
    }
                                            
    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unknown']
    var newType = update.cardType === 'unknown' ? '' : update.cardType
        $('#cardtype').text(newType)

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.number === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
    
    if (update.status.expiry === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.expiry === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
    
    if (update.status.ccv === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.ccv === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
})

TPDirect.card.getTappayFieldsStatus()
// call TPDirect.card.getPrime when user submit form to get tappay prime
// $('form').on('submit', onSubmit)
const submitButton = document.getElementById('pay-button');
submitButton.addEventListener('click',async(event)=>{
    const prime = await onSubmit(event);
    const jwtToken = localStorage.getItem('Token');
    const header = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    };
    src = "/api/booking";
    fetch(src,{method: "GET",headers: header})
    .then(function(response){
        if (response) {
            return response.json();
        }
    })
    .then(function(data) {
        const orderPrice = data["data"]["price"];
        const id = data["data"]["attraction"]["id"];
        const attractionName = data["data"]["attraction"]["name"];
        const orderAddress = data["data"]["attraction"]["address"];
        const image = data["data"]["attraction"]["image"];
        const originalDate = new Date(data["data"]["date"]);
        const year = originalDate.getFullYear();
        const month = String(originalDate.getMonth() + 1).padStart(2, '0');
        const day = String(originalDate.getDate()).padStart(2, '0');
        const date = year+"-"+month+"-"+day;
        const time = data["data"]["time"];
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone-number").value;
        const request = {
            "prime": prime,
            "order": {
                "price": orderPrice,
                "trip": {
                "attraction": {
                    "id": id,
                    "name": attractionName,
                    "address": orderAddress,
                    "image": image
                },
                "date": date,
                "time": time
                },
                "contact": {
                    "name": name,
                    "email": email,
                    "phone": phone
                }
                }
        }
        url = "/api/orders"
        fetch(url,{method: "POST",headers: header,body: JSON.stringify(request)})
        .then(function (response) {

            return response.json();
        })
        .then(function (data) {
            const order_number=data["data"]["number"];
            window.location.href=' /thankyou?number='+order_number;
        });
    });
});

function onSubmit(event) {
    return new Promise((resolve, reject) => {
        event.preventDefault()

        // 取得 TapPay Fields 的 status
        const tappayStatus = TPDirect.card.getTappayFieldsStatus()
        // 確認是否可以 getPrime
        if (tappayStatus.canGetPrime === false) {
            return
        }

        // Get prime
        TPDirect.card.getPrime((result) => {
            if (result.status !== 0) {
                reject('get prime error ' + result.msg)
            }
            resolve(result.card.prime);
            // send prime to your server, to pay with Pay by Prime API .
            // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
        })
    });
}

