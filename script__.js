var tools = {
    'draw' : false,
    'erase': false,
    'circle': false,
    'square': false,
    'triangle': false,
    'line': false,
    'text': false,
    'filter': false
}

var lastTool = null;
var shapeStyle = 'full';

var cycles = new Array();
var cycStep = -1;
var cvsLastX, cvsLastY;
var isDown_ = false;
var isDraw = false;
var isType = false;
var cvsCont, currTool, getCvs, getCvs0, cnx, cnx0, clrPick;
var getTextStyle, getTextSize, getTextUI, getTextUIForm;
var getFilter, getFilterUIForm;

window.addEventListener("load", () => drawCyc());

function getID(elem){
    // alert(9876567);
    lastTool = currTool;
    currTool = elem;
    if(lastTool != currTool){
        $('#' + lastTool.id).css("backgroundColor", "transparent");
        lastTool.style.boxShadow = "inset 0px 0px rgba(30,30,30,0.7), inset 0px 0px rgba(30,30,30,0.7)"
    }
    if(tools.hasOwnProperty(currTool.id)){
        currTool.style.backgroundColor = 'rgba(230, 230, 230, 0.6)';
        currTool.style.boxShadow = "inset 2px 2px rgba(30,30,30,0.7), inset -2px -2px rgba(30,30,30,0.7)"
    }
    if(currTool.id == "filter") {
        getTextUI.style.display = "block";
        getFilter.style.display = "inline-block";
        showOption(getTextUI, getFilterUIForm, getFilter, null, currTool.id);
    } else{
        getFilter.style.display = "none";
    }
    if(currTool.id == "text") {
        getTextUI.style.display = "block";
        getTextStyle.style.display = "inline-block";
        getTextSize.style.display = "inline-block";
        showOption(getTextUI, getTextUIForm, getTextStyle, getTextSize, currTool.id);
    } else{
        getTextStyle.style.display = "none";
        getTextSize.style.display = "none";
    }
    if(currTool.id != 'filter' && currTool.id != 'text'){
        getTextUI.style.display = "none";
    }
    cursorIcon(currTool.id);
}

function clickedI(elem){
    // console.log(elem);
    elem.addEventListener("mousedown", ()=>{
        elem.style.boxShadow = "inset 2px 2px rgba(30,30,30,0.7), inset -2px -2px rgba(30,30,30,0.7)";
    });
    elem.addEventListener("mouseup", ()=>{
        elem.style.boxShadow = "2px 2px rgba(30,30,30,0.7)";
    })
}

function setShapeStyle(elem){
    if(elem.id == "emptyS"){
        if(shapeStyle == 'empty'){
            elem.innerHTML = "radio_button_checked";
            shapeStyle = "full";
        } else{
            elem.innerHTML = "radio_button_unchecked";
            shapeStyle = "empty";
        }
    }
}

function colorPick(elem){
    cnx.strokeStyle = elem.value;
    cnx.fillStyle = elem.value;
}

function loadAll(){
    cvsCont = document.getElementById("cvs-container");
    currTool = document.getElementById('draw');
    getCvs = document.getElementById("myCanvas");
    getCvs0 = document.getElementById("myCanvas0");
    cnx = getCvs.getContext("2d");
    cnx0 = getCvs0.getContext("2d");
    clrPick = document.getElementById("color-pick");

    getTextStyle = document.forms["textOption"].elements["style"];
    getTextSize = document.forms["textOption"].elements["size"];
    getTextUI = document.getElementById("text-UI");
    getTextUIForm = document.getElementById("text-UI-form");
    getFilterUIForm = document.getElementById("filter-UI-form");
    getFilter = document.forms["filterOption"].elements["filter"];

    // console.log(getTextStyle);

    isDraw = false;
    clickedI(document.getElementById("download"));
    clickedI(document.getElementById("uploadIcon"));
    clickedI(document.getElementById("undo"));
    clickedI(document.getElementById("redo"));
    clickedI(document.getElementById("refresh"));
    clickedI(document.getElementById("emptyS"));
    cursorIcon(currTool.id);
    getID(currTool);
    uploadT();
    cycPush();
    filterT();

    cnx.strokeStyle = "#FF0000";
    cnx.lineWidth = '10';
    cnx.lineJoin = "round";
    cnx.lineCap = "round";
    cnx.fillStyle = "#FF0000";

    cnx0.strokeStyle = "#FF0000";
    cnx0.lineWidth = '10';
    cnx0.lineJoin = "round";
    cnx0.lineCap = "round";
    cnx0.fillStyle = "#FF0000";

    // cnx.filter = "blur(3px)";
    // setTimeout(() => {
    //     cnx.filter = 'none';
    // }, 5000);

    $('#mainTools i, #mainTools a, #mainTools input').hover(
        function(){
            $(this).css('backgroundColor', 'rgba(230, 230, 230, 0.6)');
            $(this).css('box-shadow', " 2px 2px rgba(30,30,30,0.7)");
        },
        function(){
            if($(this).attr('id') == currTool.id){
                $(this).css('backgroundColor', $(this).css("backgroundColor"));
                $(this).css("box-shadow", "inset 2px 2px rgba(30,30,30,0.7), inset -2px -2px rgba(30,30,30,0.7)");
            } else{
                $(this).css('backgroundColor', "transparent");
                $(this).css('box-shadow', "inset 0px 0px rgba(30,30,30,0.7), inset 0px 0px rgba(30,30,30,0.7)");
            }
        }
    )
}

function showOption(elem, elem1, elem2, elem3, id){
    if(id == 'text'){
        elem.classList.add("showCont");
        elem2.classList.add("showCont25");
        elem3.classList.add("showCont25");
        setTimeout(()=>{
            elem.classList.remove("showCont");
            elem2.classList.remove("showCont25");
            elem3.classList.remove("showCont25");
        }, 2001);
    } else if(id == 'filter'){
        elem.classList.add("showCont");
        elem2.classList.add("showCont25");
        setTimeout(()=>{
            elem.classList.remove("showCont");
            elem2.classList.remove("showCont25");
        }, 2001);
    }
}

function penSize(elem){
    let textI = document.getElementById("sizeSet");
    if(elem.id == 'sizeDec' || elem.id =="sizeInc"){
        if(elem.id == "sizeDec"){
            textI.value--;
        } else{
            textI.value++;
        }
    }
    if(textI.value < 0) textI.value = 0;
    if(textI.value > 50) textI.value = 50;
    cnx.lineWidth = textI.value;
    cnx0.lineWidth = textI.value;
}

function startTool(type, x, y){
    switch(type){
        case "draw": 
            drawT(x,y); break;
        case "erase": 
            eraseT(x,y); break;
        case "circle": 
            circleT(x, y); break;
        case "square": 
            rectT(x,y); break;
        case "triangle": 
            triangleT(x,y); break;
        case "line": 
            lineT(x, y);
    }
}

function drawCyc(){
    loadAll();
    currTool.style.backgroundColor = 'rgba(230, 230, 230, 0.6)';

    getCvs.addEventListener("mousedown", e=>{
        isDown_ = true;
        cvsLastX = e.pageX - getCvs.offsetLeft;
        cvsLastY = e.pageY - getCvs.offsetTop;
        if(isDown_ && (currTool.id == "draw" || currTool.id == "erase")){
            isDraw = true;
            startTool(currTool.id, e.pageX - getCvs.offsetLeft, e.pageY - getCvs.offsetTop);
        }
        else if(isDown_){
            cnx.clearRect(0,0,getCvs.offsetWidth, getCvs.offsetHeight);
            cnx.save();
            startTool(currTool.id, e.pageX - getCvs.offsetLeft, e.pageY - getCvs.offsetTop);
        }
    })
    getCvs.addEventListener("mousemove", e =>{
        if(isDown_ && (currTool.id == "draw" || currTool.id == "erase")){
            isDraw = true;
            startTool(currTool.id, e.pageX - getCvs.offsetLeft, e.pageY - getCvs.offsetTop);
            cvsLastX = e.pageX - getCvs.offsetLeft;
            cvsLastY =  e.pageY - getCvs.offsetTop;
        }
        else if(isDown_){
            cnx.clearRect(0,0,getCvs.offsetWidth, getCvs.offsetHeight);
            cnx.save();
            startTool(currTool.id, e.pageX - getCvs.offsetLeft, e.pageY - getCvs.offsetTop);
        }
    })
    getCvs.addEventListener("mouseup", e=>{
        if(currTool.id == "text" && isType == false){
            textT(e.pageX - getCvs.offsetLeft, e.pageY - getCvs.offsetTop);
            isType = true;
        } else if(isType == true){
            textT(0, 0);
            isType = false;
        }

        if(isDown_ && isType == false){
            if(currTool.id != 'filter'){
                cycPush();
            }
            isDraw = false;
        }
        isDown_ = false;
    });
    getCvs.addEventListener("mouseleave", e=>{
        if(isDown_){
            cycPush();
            isDraw = false;
        }
        isDown_ = false;
    });
}

function drawT(x, y){
    cnx.beginPath();
    cnx.moveTo(cvsLastX, cvsLastY);
    cnx.lineTo(x, y);
    cnx.stroke();
    cnx.closePath();
}

function clearCvs(color){
    if(window.confirm("Clear Content?")){
        cnx0.clearRect(0,0,getCvs0.offsetWidth, getCvs0.offsetHeight);
        cycStep = -1;
        cycles.length = 0;
        cycPush();
    }
}

function eraseT(x, y){
    cnx0.globalCompositeOperation = "destination-out";
    cnx0.beginPath();
    cnx0.moveTo(cvsLastX, cvsLastY);
    cnx0.lineTo(x, y);
    cnx0.stroke();
    cnx0.closePath();
    cnx0.globalCompositeOperation = "source-over";
}

function downloadT(obj){
    var urlData = getCvs0.toDataURL("image/png", 0.92);
    obj.href = urlData;
}

function uploadTB(){
    let inputTag = document.getElementById("upload");
    if(inputTag){
        inputTag.click();
    }
}

function uploadT(){
    var getInput = document.getElementById("upload");
    getInput.addEventListener('change', e=>{
        if(e.target.files){
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onloadend = e1=>{
                var myImage = new Image();
                myImage.src = e1.target.result;
                myImage.onload = event => {
                    cnx0.drawImage(myImage, 0, 0, getCvs0.offsetWidth, getCvs0.offsetHeight);
                    cycPush();
                    getInput.value = '';
                }
            }
        }
    });
}

function circleT(x, y){
    cnx.beginPath();
    cnx.ellipse((cvsLastX+x)/2, (cvsLastY+y)/2, (Math.abs(cvsLastX-x))/2, (Math.abs(cvsLastY-y))/2, 0, 0, 2 * Math.PI);
    cnx.restore();
    if(shapeStyle == 'full'){cnx.fill();}
    else{cnx.stroke();}
    cnx.closePath();
}

function rectT(x, y){
    cnx.beginPath();
    cnx.rect(cvsLastX, cvsLastY, -(cvsLastX-x), -(cvsLastY-y));
    cnx.restore();
    if(shapeStyle == 'full'){cnx.fill();}
    else{cnx.stroke();}
    cnx.closePath();
}

function lineT(x, y){
    cnx.beginPath();
    cnx.moveTo(cvsLastX, cvsLastY);
    cnx.lineTo(x, y);
    cnx.restore();
    cnx.stroke();
}

function triangleT(x, y){
    cnx.beginPath();
    cnx.moveTo(cvsLastX, cvsLastY);
    if(x > cvsLastX){
        cnx.lineTo(x, y);
        cnx.lineTo(x-(Math.abs(x-cvsLastX)*2), y);
    } else{
        cnx.lineTo(x+(Math.abs(x-cvsLastX)*2), y);
        cnx.lineTo(x, y);
    }
    cnx.restore();
    if(shapeStyle == 'full'){cnx.fill();}
    else{
        cnx.closePath();
        cnx.stroke();
    }
}

function createTextField(x, y){
    let field = document.createElement("input");
    field.id = "text-field";
    field.type = 'text';
    field.style.position = "relative";
    field.style.top = String(y) + 'px';
    field.style.left = String(x) + 'px';
    field.style.border = "0px";
    field.style.backgroundColor = "transparent";
    field.style.outline = "none"
    cvsCont.appendChild(field);
    document.getElementById(field.id).focus();
    field.addEventListener("keyup", (e)=>{
        if(e.key == "Enter"){
            if(isType == true){
                textT(0,0);
                isType = false;
                cycPush();
                isDraw = false;
            }
        }
    })
}

function textT(x, y){
    if(isType == false){
        createTextField(x, y);
    } else{
        let field = document.getElementById("text-field");
        cnx.font = "12px serif";
        cnx.font =  getTextSize.options[getTextSize.selectedIndex].value + ' '
                    + getTextStyle.options[getTextStyle.selectedIndex].value
        if(shapeStyle == "empty"){
            var temp = cnx.lineWidth;
            cnx.lineWidth = '1';
            cnx.strokeText(field.value, field.offsetLeft - getCvs.offsetLeft, field.offsetTop - getCvs.offsetTop);
            cnx.lineWidth = temp;
        } else{
            cnx.fillText(field.value, field.offsetLeft - getCvs.offsetLeft, field.offsetTop - getCvs.offsetTop);
        }
        if(field){
            field.remove();
        }
    }
}

function filterT(){
    // console.log(getFilter.value);
    getFilter.addEventListener('change', ()=>{
        switch (getFilter.value){
            case 'none':{
                cnx0.filter = 'none'; break;
            }
            case 'blur':{
                cnx0.filter = 'blur(1px)'; break;
            }
            case 'brightness':{
                cnx0.filter = 'brightness(140%)'; break;
            }
            case 'negBrightness':{
                cnx0.filter = 'brightness(70%)'; break;
            }
            case 'grayscale':{
                cnx0.filter = 'grayscale(50%)'; break;
            }
            case 'opacity':{
                cnx0.filter = 'opacity(75%)'; break;
            }
        }
        let myImg = new Image();
        myImg.src = getCvs0.toDataURL('image/png');
        myImg.onload = () =>{
            // console.log(myImg.width, myImg.height);
            cnx0.clearRect(0,0,getCvs0.offsetWidth, getCvs0.offsetHeight);
            cnx0.drawImage(myImg, 0, 0, getCvs0.offsetWidth, getCvs0.offsetHeight, 0, 0, getCvs0.offsetWidth, getCvs0.offsetHeight);
            cycPush();
        }
        setTimeout(() => {
            getFilter.value = 'none';
            cnx0.filter = 'none';
        }, 50);
    })
}

function cycPush(){
    // console.log("Asdasd");
    cycStep++;
    if(cycles.length > cycStep ){
        cycles.length = cycStep;
    }
    cycles.push(getCvs0.toDataURL('image/png'));
    // console.log(cycles[cycStep]);
    console.log(cycStep);
    if(cycStep > 0 && currTool.id != 'filter'){
        // console.log(currTool.id);
        let myImage = new Image();
        myImage.src = getCvs.toDataURL('image/png');
        myImage.onload = ()=>{ 
            cnx0.drawImage(myImage, 0, 0, getCvs0.offsetWidth, getCvs0.offsetHeight, 0, 0, getCvs0.offsetWidth, getCvs0.offsetHeight);
            cnx.clearRect(0,0,getCvs.offsetWidth, getCvs.offsetHeight);
            cycles[cycStep] = getCvs0.toDataURL('image/png');
        }
    }
}

function undoT(){
    if(cycStep > 0){
        cycStep--;
        let myImage = new Image();
        myImage.src = cycles[cycStep];
        myImage.onload = ()=>{ 
            cnx0.clearRect(0,0,getCvs0.offsetWidth, getCvs0.offsetHeight);
            cnx0.drawImage(myImage, 0, 0, getCvs0.offsetWidth, getCvs0.offsetHeight, 0, 0, getCvs0.offsetWidth, getCvs0.offsetHeight);
        }
        // console.log(cycStep, '<-', cycles[cycStep]);
    }
}

function redoT(){
    if(cycStep < cycles.length-1){
        cycStep++;
        let myImage = new Image();
        myImage.src = cycles[cycStep];
        myImage.onload = ()=>{ 
            cnx0.clearRect(0,0,getCvs0.offsetWidth, getCvs0.offsetHeight);
            cnx0.drawImage(myImage, 0, 0);
        }
        // console.log(cycStep, '->', cycles[cycStep]);
    }
}

function cursorIcon(type){
    switch(type){
        case "draw": 
            getCvs.style.cursor = "url(./icon/draw.png) 0 24, auto" ; break;
        case "erase": 
            getCvs.style.cursor = "url(./icon/clean.png) 12 0, auto" ; break;
        case "circle": 
            getCvs.style.cursor = "url(./icon/circle.png) 12 12, auto" ; break;
        case "square": 
            getCvs.style.cursor = "url(./icon/square.png) 12 12, auto" ; break;
        case "triangle": 
            getCvs.style.cursor = "url(./icon/triangle.png) 12 12, auto" ; break;
        case "line": 
            getCvs.style.cursor = "url(./icon/line.png) 12 12, auto" ; break;
        case "text": 
            getCvs.style.cursor = "url(./icon/text.png) 12 12, auto" ; break;
        default: {
            getCvs.style.cursor = "default";
        }
    }
}
