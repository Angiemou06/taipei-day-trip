
let optionsContainer = document.getElementById('optionsContainer');
let scrollLeftButton = document.getElementById('scrollLeft');
let scrollRightButton = document.getElementById('scrollRight');
let nextPage = 1;
let numbar=12;
let loadingData = false;
let scrollValue = 0;
let ct=0;

// 滾動向左的函數
scrollLeftButton.addEventListener('click', () => {
    scrollValue = scrollValue <= 0 ? scrollValue : scrollValue-50; // 根據需要調整滾動距離
    optionsContainer.scrollTo(scrollValue, 0);
});

// 滾動向右的函數
scrollRightButton.addEventListener('click', () => {
    let ccc = document.querySelector("#optionsContainer");
    let total = ccc.scrollWidth-ccc.clientWidth;
    scrollValue = scrollValue >= total ? scrollValue : scrollValue+50;  // 根據需要調整滾動距離
    optionsContainer.scrollTo(scrollValue, 0);
});

window.onload = function () {
    let url = "http://100.20.120.162:3000/api/attractions?page=0";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            nextPage=data.nextPage;
            let maxLength = 12; // 设置文本最大长度
            for (let i = 0; i < data.data.length; i++) {
                j = i + 1;
                let form = document.getElementById("form_"+j);
                form.action="/attraction/"+j;
                let img = document.getElementById("img_" + j);
                newImageUrl = data.data[i]["images"][0];
                img.src = newImageUrl;
                let name = document.getElementById("rectangle_" + j);
                nweName = data.data[i]["name"];
                name.innerHTML = nweName;
                if (nweName.length > maxLength) {
                    // 如果文本长度大于最大长度，缩小字体大小
                    name.style.fontSize = "14px"; // 根据需要设置缩小后的字体大小
                }
                let infoLeft = document.getElementById("info_left_" + j);
                newMRT = data.data[i]["MRT"];
                infoLeft.innerHTML = newMRT;
                let infoRight = document.getElementById("info_right_" + j);
                newCategory = data.data[i]["category"];
                infoRight.innerHTML = newCategory;
            }
        });
        url = "http://100.20.120.162:3000/api/mrts";
        fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            for (let i=0;i<data.data.length;i++){
                let j = i+1;
                mrt = document.getElementById('mrt_'+j);
                mrt.innerHTML = data.data[i];
            };
        });
};

async function fetchAndDisplayData(url) {
    
    if (loadingData) return;
    loadingData = true;
    let response = await fetch(url);
    let data = await response.json();
    let number = data.data.length;

    // 获取目标元素
    let attractions = document.getElementById('attractions');

    // 创建 spacer，用于增加间距
    let spacer = document.createElement('div');
    spacer.style.height = '30px'; 
    spacer.style.width = '100%';
    attractions.appendChild(spacer);

    // 創建新的 div 元素 newGrid
    let newGrid = document.createElement('div');
    newGrid.className = "attractions_group";
    newGrid.id = "attractions_group";
    // 在 newGrid 中添加新的 attraction 元素
    for (let i = 1 ;i < number+1; i++) {
        j = nextPage * 12 + i;
        let form = document.createElement('form');
        form.id = "form_"+j;
        form.action="/attraction/"+j;
        let subButton = document.createElement('button');
        subButton.className = "attraction attraction_" + j;

        // 創建 img 元素
        let imgDiv = document.createElement('div');
        imgDiv.className="img";
        subButton.appendChild(imgDiv);
        let img = document.createElement('img');
        img.src = "";
        img.className = "attraction_img";
        img.id = "img_" + j;
        imgDiv.appendChild(img);

        // 創建 rectangle
        let rectangle = document.createElement('div');
        rectangle.className = "rectangle";

        // 創建 rectangle_text 元素
        let rectangleText = document.createElement('div');
        rectangleText.className = "rectangle_text";
        rectangleText.id = "rectangle_" + j;
        rectangle.appendChild(rectangleText);

        // 將 rectangle 添加到 subButton 中
        subButton.appendChild(rectangle);

        // 創建 details 元素
        let details = document.createElement('div');
        details.className = "details";

        // 創建 info-container 元素
        let infoContainer = document.createElement('div');
        infoContainer.className = "info-container";

        // 創建 info_left 元素
        let infoLeft = document.createElement('div');
        infoLeft.className = "info_left";
        infoLeft.id = "info_left_" + j;

        // 創建 info_right 元素
        let infoRight = document.createElement('div');
        infoRight.className = "info_right";
        infoRight.id = "info_right_" + j;

        // 將 info_left 和 info_right 添加到 info-container 中
        infoContainer.appendChild(infoLeft);
        infoContainer.appendChild(infoRight);

        // 將 info-container 添加到 details 中
        details.appendChild(infoContainer);

        // 將 details 添加到 subDiv 中
        subButton.appendChild(details);
        form.appendChild(subButton)
        // 將 subDiv 添加到 newGrid 中
        newGrid.appendChild(form);
    }

    // 將新的 div 添加到目標元素中
    attractions.appendChild(newGrid);
    maxLength = 12;
    for (let k=0;k<number;k++){
        j = nextPage * 12 + k +1;
        let img = document.getElementById("img_" + j);
        newImageUrl = data.data[k]["images"][0];
        img.src = newImageUrl;
        let name = document.getElementById("rectangle_" + j);
        nweName = data.data[k]["name"];
        name.innerHTML = nweName;
        if (nweName.length > maxLength) {
            // 如果文本长度大于最大长度，缩小字体大小
            name.style.fontSize = "14px"; // 根据需要设置缩小后的字体大小
        }
        let infoLeft = document.getElementById("info_left_" + j);
        newMRT = data.data[k]["MRT"];
        infoLeft.innerHTML = newMRT;
        let infoRight = document.getElementById("info_right_" + j);
        newCategory = data.data[k]["category"];
        infoRight.innerHTML = newCategory;
    };
    nextPage=data.nextPage;
    loadingData = false;
}

async function scrollHandler() {
    if (nextPage !== null && !loadingData) {
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
            let url = "http://100.20.120.162:3000/api/attractions?page=" + nextPage;
            // 获取目标元素
            await fetchAndDisplayData(url);
        }
    }
    else if (nextPage== null && ct==0){

        attractions = document.getElementById('attractions');
        spacer = document.createElement('div');
        spacer.style.height = '30px';
        spacer.style.width = '100%';
        attractions.appendChild(spacer);
        ct++;
    }
}


window.addEventListener('scroll', scrollHandler);

let input = document.getElementById('input');
let search_button = document.getElementById('search_button');

search_button.addEventListener('click', async () => {
    let attractions = document.getElementById('attractions');
    attractions.innerHTML = '';
    let keyword = input.value;
    let page = 0;
    let url = "http://100.20.120.162:3000/api/attractions?page=" + page + "&" + "keyword=" + keyword;
    while(1){
        try {
            let response = await fetch(url);
            if (response.ok) {
                let data = await response.json();
                let number = data.data.length;

                // 获取目标元素
                let attractions = document.getElementById('attractions');

                // 创建 spacer，用于增加间距
                let spacer = document.createElement('div');
                spacer.style.height = '30px';
                spacer.style.width = '100%';
                attractions.appendChild(spacer);

                // 创建新的 div 元素 newGrid
                let newGrid = document.createElement('div');
                newGrid.className = "attractions_group";
                newGrid.id = "attractions_group";
                // 在 newGrid 中添加新的 attraction 元素
                for (let i = 1; i < number + 1; i++) {
                    j = page * 12 + i;
                    id = data.data[i-1]["id"];
                    let form = document.createElement('form');
                    form.id = "form_" + id;
                    form.action="/attraction/"+id;
                    let subButton = document.createElement('button');
                    subButton.className = "attraction attraction_" + j;

                    // 創建 img 元素
                    let imgDiv = document.createElement('div');
                    imgDiv.className="img";
                    subButton.appendChild(imgDiv);
                    let img = document.createElement('img');
                    img.src = "";
                    img.className = "attraction_img";
                    img.id = "img_" + j;
                    imgDiv.appendChild(img);

                    // 創建 rectangle
                    let rectangle = document.createElement('div');
                    rectangle.className = "rectangle";

                    // 創建 rectangle_text 元素
                    let rectangleText = document.createElement('div');
                    rectangleText.className = "rectangle_text";
                    rectangleText.id = "rectangle_" + j;
                    rectangle.appendChild(rectangleText);

                    // 將 rectangle 添加到 subDiv 中
                    subButton.appendChild(rectangle);

                    // 創建 details 元素
                    let details = document.createElement('div');
                    details.className = "details";

                    // 創建 info-container 元素
                    let infoContainer = document.createElement('div');
                    infoContainer.className = "info-container";

                    // 創建 info_left 元素
                    let infoLeft = document.createElement('div');
                    infoLeft.className = "info_left";
                    infoLeft.id = "info_left_" + j;

                    // 創建 info_right 元素
                    let infoRight = document.createElement('div');
                    infoRight.className = "info_right";
                    infoRight.id = "info_right_" + j;

                    // 將 info_left 和 info_right 添加到 info-container 中
                    infoContainer.appendChild(infoLeft);
                    infoContainer.appendChild(infoRight);

                    // 將 info-container 添加到 details 中
                    details.appendChild(infoContainer);

                    // 將 details 添加到 subDiv 中
                    subButton.appendChild(details);
                    
                    form.appendChild(subButton)
                    newGrid.appendChild(form);
                }

                // 將新的 div 添加到目標元素中
                attractions.appendChild(newGrid);
                maxLength = 12;
                for (let k = 0; k < number; k++) {
                    j = page * 12 + k + 1;
                    let img = document.getElementById("img_" + j);
                    newImageUrl = data.data[k]["images"][0];
                    img.src = newImageUrl;
                    let name = document.getElementById("rectangle_" + j);
                    newName = data.data[k]["name"];
                    name.innerHTML = newName;
                    if (newName.length > maxLength) {
                        // 如果文本长度大于最大长度，缩小字体大小
                        name.style.fontSize = "14px"; // 根据需要设置缩小后的字体大小
                    }
                    let infoLeft = document.getElementById("info_left_" + j);
                    newMRT = data.data[k]["MRT"];
                    infoLeft.innerHTML = newMRT;
                    let infoRight = document.getElementById("info_right_" + j);
                    newCategory = data.data[k]["category"];
                    infoRight.innerHTML = newCategory;
                };
                nextPage = data.nextPage;
                if (nextPage == null){
                    return;
                }
                else{
                    page++;
                    url = "http://100.20.120.162:3000/api/attractions?page=" + page + "&" + "keyword=" + keyword;
                }
            } else {
                attractions.innerHTML = '沒有相關資料';
                return;
            }
        }catch{
            return;
        }
    };
});


let buttonsContainer = document.getElementById('optionsContainer');

buttonsContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        let buttonText = event.target.textContent;
        let input = document.getElementById('input');
        input.value = buttonText;
        let clickEvent = new Event('click', {
            bubbles: true,
            cancelable: true,
            view: window
         });
        let search_button = document.getElementById('search_button');
        search_button.dispatchEvent(clickEvent);    
    
    }
});







