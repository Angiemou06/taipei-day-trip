let Data=[];

function getDate(){
    date = document.getElementById("date");
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    let day = currentDate.getDate().toString().padStart(2, '0');
    let newDate = year + '-' + month + '-' + day;
    date.min = newDate;
}

function checkCost(number){
    console.log(number);
    let id = number.id;
    cost = document.getElementById("cost");
    if (id==="r-1"){
        cost.innerHTML=2000;
    }
    else if(id==="r-2"){
        cost.innerHTML=2500;
    }
}

function getAPIData(){
    url = "http://192.168.68.119:3000/api/attraction/"+id;
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            Data=data.data;
            insertData();
            changeImage();
        })
}
function insertData(){

    // Info
    let attraction_name = document.getElementById("attraction_name");
    attraction_name.innerHTML=Data["name"];
    let point_class = document.getElementById("point_class");
    point_class.innerHTML = Data["category"];
    let mrt_class = document.getElementById("mrt_class");
    mrt_class.innerHTML=Data["MRT"];
    let article_text = document.getElementById("article_text");
    article_text.innerHTML=Data["description"]
    let address = document.getElementById("address")
    address.innerHTML=Data["address"];
    let transportation = document.getElementById("transportation");
    transportation.innerHTML=Data["transport"];
    
    // Figure //Dot
    let images = Data["images"];
    number = images.length;
    let boardImages = document.querySelector(".image-panel__images-group");
    let dotGroup = document.querySelector(".image-panel__dot-group");
    let idCt = 0;
    for (let i=0;i<number;i++){
        if(!Data["images"][i].endsWith("jpg")){
            continue;
        }
            
        let img = document.createElement("img");
        img.src=Data["images"][i];
        boardImages.appendChild(img);

        let dot = document.createElement("div");
        dot.classList.add("dot-group__dot");
        dot.id = idCt;
        if(idCt===0){
            dot.classList.add("dot-group__dot-current");
        }
        else{
            dot.classList.add("dot-group__dot-other");
        }
        idCt++;
        dotGroup.appendChild(dot);
    }
}

function changeImage(){
    currentIndex = 0;
    let left_button = document.querySelector(".image-panel__left-button");
    let right_button = document.querySelector(".image-panel__right-button");
    let imageGroup = document.querySelector(".image-panel__images-group");
    left_button.addEventListener('click',()=>{
        if (currentIndex>0){
            let dot = document.querySelector(".dot-group__dot#" + CSS.escape(currentIndex) );
            dot.classList.remove("dot-group__dot-current");
            dot.classList.add("dot-group__dot-other");
            currentIndex--;
            dot = document.querySelector(".dot-group__dot#" + CSS.escape(currentIndex) );
            dot.classList.remove("dot-group__dot-other");
            dot.classList.add("dot-group__dot-current");
        }
        
        imageGroup.scrollTo(imageGroup.offsetWidth*currentIndex, 0);
    });

    right_button.addEventListener('click',()=>{
        let numberOfChildren = imageGroup.children.length;
        if (currentIndex<numberOfChildren-1){
            let dot = document.querySelector(".dot-group__dot#" + CSS.escape(currentIndex) );
            dot.classList.remove("dot-group__dot-current");
            dot.classList.add("dot-group__dot-other");
            currentIndex++;
            dot = document.querySelector(".dot-group__dot#" + CSS.escape(currentIndex) );
            dot.classList.remove("dot-group__dot-other");
            dot.classList.add("dot-group__dot-current");
        }
        imageGroup.scrollTo(imageGroup.offsetWidth*currentIndex, 0);
    });

    window.addEventListener("resize", () => {
        imageGroup.scrollTo(imageGroup.offsetWidth*currentIndex, 0);
    });
}

window.onload=getAPIData();
window.onload=getDate();