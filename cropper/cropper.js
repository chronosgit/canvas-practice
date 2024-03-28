//* Loading related setup
const loaderWrapper = document.getElementById("loader_wrapper");
const loaderImg = document.getElementById("loader_img");
let file = null;


//* Cropper related setup
const cropperArea = document.getElementById("cropper_area");
const cropperImg = document.getElementById("cropper_img");
const cropperContainer = document.getElementById("cropper_container");

//& Main box, we change it's dims and pos
const cropperBox = document.getElementById("cropper_box");
//& Outline to have events on it, "invisible" trigger area
const cropperOutline = document.getElementById("cropper_outline");
//& Circle-like holders for resizing
const cropperHandlers = document.getElementsByClassName("cropper_handler");
const cropperHandlerNe = document.getElementById("cropper_handler_ne");
const cropperHandlerSe = document.getElementById("cropper_handler_se");
const cropperHandlerSw = document.getElementById("cropper_handler_sw");
const cropperHandlerNw = document.getElementById("cropper_handler_nw");
//& Buttons
const cropperBtnCrop = document.getElementById("cropper_btn_crop");
const cropperBtnCancel = document.getElementById("cropper_btn_cancel");
//& Cropper related states & vars
let isClicked = false;
let opType = "";
const mouse = {x: undefined, y: undefined};
const minDim = 150; // Minimal dimension in pixels


//* Utility functions
function resetStates() {
    isClicked = false;
    opType = "";
    mouse.x = undefined;
    mouse.y = undefined;
}

function removePxSuffix(s) {
    if(typeof s !== "string") throw Error("Not a string.");

    const modified = Number(s.replace("px", ""));

    if(isNaN(modified)) throw Error("Converted string is a NaN.");

    return modified
}

function isInArea(coord, minBorder, maxBorder, deviation) {
    const righterThanBorder = coord >= minBorder - deviation;
    const lefterThanBorder = coord <= maxBorder + deviation;

    return righterThanBorder && lefterThanBorder;
}

function getAbsMin(a, b) {
    return Math.ceil(Math.min(Math.abs(a), Math.abs(b)));
}

function getAvg(...args) {
    const sum = args.reduce((acc, cur) => acc + cur);

    return sum / args.length;
}

function restoreCursors() {
    cropperBox.style.cursor = "move";
    cropperContainer.style.cursor = "unset";
    cropperHandlerNe.style.cursor = "ne-resize";
    cropperHandlerSe.style.cursor = "se-resize";
    cropperHandlerSw.style.cursor = "sw-resize";
    cropperHandlerNw.style.cursor = "nw-resize";
}

//* Event functions
function onMousedown(e, newOpType) {
    if(isClicked) return;

    isClicked = true;
    opType = newOpType;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function onMousemove(e) {
    if(!isClicked) return;
    e.stopImmediatePropagation();

    switch(opType) {
    case "grab":
        handleGrab(e);
        cropperBox.style.cursor = "move";
        cropperHandlerNe.style.cursor = "move";
        cropperHandlerSe.style.cursor = "move";
        cropperHandlerSw.style.cursor = "move";
        cropperHandlerNw.style.cursor = "move";
        break;
    case "ne":
        handleNe(e);
        cropperBox.style.cursor = "ne-resize";
        break;
    case "se":
        handleSe(e);
        cropperBox.style.cursor = "se-resize";
        break;
    case "sw":
        handleSw(e);
        cropperBox.style.cursor = "sw-resize";
        break;
    case "nw":
        handleNw(e);
        cropperBox.style.cursor = "nw-resize";
        break;
    }

    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function onMouseup(e) {
    resetStates();
    restoreCursors();
}

function onImgMousemove(e) {
    if(!isClicked) return;
    if(e.target !== cropperContainer) return;
    e.stopImmediatePropagation();

    switch(opType) {
    case "se":
        catchupSe(e);
        cropperContainer.style.cursor = "se-resize";
        break;
    case "ne":
        catchupNe(e);
        cropperContainer.style.cursor = "ne-resize";
        break;
    }
}

//* Resizing and grabbing functions
function handleGrab(e) {
    //& Setup
    const xDiff = e.clientX - mouse.x;
    const yDiff = e.clientY - mouse.y;
    const prevTop = removePxSuffix(cropperBox.style.top);
    const prevLeft = removePxSuffix(cropperBox.style.left);
    const boxWidth = removePxSuffix(cropperBox.style.width);
    const boxHeight = removePxSuffix(cropperBox.style.height);
    const img = cropperImg.getBoundingClientRect();
    const handler = cropperHandlerNe.getBoundingClientRect();

    //& Check boundaries
    const deviation = 3;
    const overflowTop = (prevTop + yDiff + deviation) <= 0;
    const overflowBottom = (prevTop + yDiff + boxHeight - deviation) >= img.height;
    const overflowLeft = (prevLeft + xDiff + deviation) <= 0;
    const overflowRight = (prevLeft + xDiff + boxWidth - deviation) >= img.width;
    if(overflowTop || overflowBottom || overflowLeft || overflowRight) return;

    cropperBox.style.top = `${prevTop + yDiff}px`;
    cropperBox.style.left = `${prevLeft + xDiff}px`;
}

//& Ne resize changes width, height and top
function handleNe(e) {
    //& Setup
    const handler = cropperHandlerNe.getBoundingClientRect();
    const xDiff = e.clientX - getAvg(handler.left, handler.right);
    const yDiff = e.clientY - getAvg(handler.bottom, handler.top);
    const diff = getAbsMin(xDiff, yDiff);
    const img = cropperImg.getBoundingClientRect();
    const prevWidth = removePxSuffix(cropperBox.style.width);
    const prevHeight = removePxSuffix(cropperBox.style.height);
    const prevTop = removePxSuffix(cropperBox.style.top);
    const prevLeft = removePxSuffix(cropperBox.style.left);

    //& Are we allowed to resize down?
    if(prevWidth - diff <= minDim) return;

    //& Are we allowed to resize up?
    const resizeRight = (prevLeft + prevWidth + diff) >= (img.right - img.left);
    const resizeUp = (prevTop - diff) <= 0;

    //& Possible resizing conditions
    const resizeDown = Boolean(xDiff < 0 && yDiff > 0);
    const cursorParallelHandlerLeft = isInArea(e.clientY, handler.top, handler.bottom, 0);
    const cursorParallelHandlerBottom = isInArea(e.clientX, handler.left, handler.right, 0);
    
    if(resizeDown) {
        cropperBox.style.width = `${prevWidth - diff}px`;
        cropperBox.style.height = `${prevHeight - diff}px`;
        cropperBox.style.top = `${prevTop + diff}px`;
    } else if(cursorParallelHandlerLeft || cursorParallelHandlerBottom) {
        //& No resize, because it is strict horizontal or vertical 
    } else if(!resizeRight && !resizeUp) { //& Resize up
        cropperBox.style.width = `${prevWidth + diff}px`;
        cropperBox.style.height = `${prevHeight + diff}px`;
        cropperBox.style.top = `${prevTop - diff}px`;
    }
}

function catchupNe(e) {
    const box = cropperBox.getBoundingClientRect();
    const img = cropperImg.getBoundingClientRect();
    const prevWidth = removePxSuffix(cropperBox.style.width);
    const prevHeight = removePxSuffix(cropperBox.style.height);
    const prevTop = removePxSuffix(cropperBox.style.top);
    const prevLeft = removePxSuffix(cropperBox.style.left);
    const diff = getAbsMin(e.clientX - box.right, e.clientY - box.top);

    console.log(e.clientX, e.clientY);
    console.log(box.right, box.top);

    //& Are we really moving to the right OR to the bottom of box?
    const toTheRight = e.clientX >= box.right;
    const toTheTop = e.clientY <= box.top;
    if(!toTheTop && !toTheRight) return;

    //& Are we allowed to resize up?
    if(prevLeft + prevWidth + diff >= img.right - img.left) return;
    if(prevTop - diff <= 0) return;

    //& Make a 'catch-up' resizing
    cropperBox.style.width = `${prevWidth + diff}px`;
    cropperBox.style.height = `${prevHeight + diff}px`;
    cropperBox.style.top = `${prevTop - diff}px`;
}

//& Se resize changes width and height of cropperBox
function handleSe(e) {
    //& Setup
    const handler = cropperHandlerSe.getBoundingClientRect();
    const xDiff = e.clientX - getAvg(handler.left, handler.right);
    const yDiff = e.clientY - getAvg(handler.bottom, handler.top);
    const diff = getAbsMin(xDiff, yDiff);
    const img = cropperImg.getBoundingClientRect();
    const prevWidth = removePxSuffix(cropperBox.style.width);
    const prevHeight = removePxSuffix(cropperBox.style.height);
    const prevTop = removePxSuffix(cropperBox.style.top);
    const prevLeft = removePxSuffix(cropperBox.style.left);

    //& Are we allowed to resize down?
    if(prevWidth - diff <= minDim) return;

    //& Are we allowed to resize up?
    if(prevLeft + prevWidth + diff >= img.right - img.left) return;
    if(prevTop + prevHeight + diff >= img.bottom - img.top) return;

    //& Possible resizing conditions
    const resizeDown = Boolean(xDiff < 0 && yDiff < 0);
    const cursorParallelHandlerLeft = isInArea(e.clientY, handler.top, handler.bottom, 0);
    const cursorParallelHandlerUp = isInArea(e.clientX, handler.left, handler.right, 0);
    
    if(resizeDown) {
        cropperBox.style.width = `${prevWidth - diff}px`;
        cropperBox.style.height = `${prevHeight - diff}px`;
    } else if(cursorParallelHandlerLeft || cursorParallelHandlerUp) {
        //& No resize, because it is strict horizontal or vertical 
    } else { //& Resize up
        cropperBox.style.width = `${prevWidth + diff}px`;
        cropperBox.style.height = `${prevHeight + diff}px`;
    }
}

function catchupSe(e) {
    const box = cropperBox.getBoundingClientRect();
    const img = cropperImg.getBoundingClientRect();
    const prevWidth = removePxSuffix(cropperBox.style.width);
    const prevHeight = removePxSuffix(cropperBox.style.height);
    const prevTop = removePxSuffix(cropperBox.style.top);
    const prevLeft = removePxSuffix(cropperBox.style.left);
    const diff = getAbsMin(e.clientX - box.right, e.clientY - box.bottom);

    //& Are we really moving to the right OR to the bottom of box?
    const toTheRight = e.clientX >= box.right;
    const toTheBottom = e.clientY >= box.bottom;
    if(!toTheBottom && !toTheRight) return;

    //& Are we allowed to resize up?
    if(prevLeft + prevWidth + diff >= img.right - img.left) return;
    if(prevTop + prevHeight + diff >= img.bottom - img.top) return;

    //& Make a 'catch-up' resizing
    cropperBox.style.width = `${prevWidth + diff}px`;
    cropperBox.style.height = `${prevHeight + diff}px`;
}

function handleSw(e) {
    console.log("Sw...");
}

function handleNw(e) {
    console.log("Nw...");
}

//* Outline event listeners
cropperOutline.addEventListener("mousedown", (e) => onMousedown(e, "grab"));

cropperOutline.addEventListener("mousemove", (e) => onMousemove(e));

cropperOutline.addEventListener("mouseup", (e) => onMouseup(e));


//* Handlers event listeners
for(let i = 0; i < cropperHandlers.length; i++) {
    const handler = cropperHandlers[i];
    const hType = handler.dataset.type;

    handler.addEventListener("mousedown", (e) => onMousedown(e, hType));

    handler.addEventListener("mousemove", (e) => onMousemove(e));

    handler.addEventListener("mouseup", (e) => onMouseup(e));
}


//* Img move event listeners for catchup
cropperContainer.addEventListener("mousemove", (e) => onImgMousemove(e));

cropperContainer.addEventListener("mouseup", (e) => onMouseup(e));


//* Bug-fixes related event behaviors
document.addEventListener("mousemove", (e) => {
    const possibleTriggers = [
        cropperOutline, cropperHandlerNe, cropperHandlerSe,
        cropperHandlerSw, cropperHandlerNw, cropperContainer,
    ];

    if(!possibleTriggers.includes(e.target)) {
        resetStates();
        restoreCursors();
    }
});

cropperImg.addEventListener("drag", (e) => e.preventDefault());


//* Cropper init, deinit and crop action
function openCropper() {
    cropperArea.style.display = "flex";
}

function closeCropper() {
    cropperImg.src = "";
    cropperArea.style.display = "none";
    resetStates();
}

function crop() {
    //& Temporary image assignment
    loaderImg.src = cropperImg.src;

    closeCropper();
}

cropperBtnCrop.addEventListener("click", crop);
cropperBtnCancel.addEventListener("click", closeCropper);


//* OnClick download (using FileReader and input to load some image to file)
loaderWrapper.addEventListener("click", () => {
    const tmpInput = document.createElement("input");
    tmpInput.type = "file";

    tmpInput.onchange = (changeE) => {
        const loadedFile = changeE.target.files[0];

        if(loadedFile && loadedFile.type.includes("image")) {
            const reader = new FileReader();

            reader.onload = (readerE) => {
                const imgDataUrl = readerE.target.result;
                file = loadedFile;

                cropperImg.src = imgDataUrl;
                cropperImg.onload = onImgLoad;

                openCropper();
            };

            reader.readAsDataURL(loadedFile);
        }
    };

    tmpInput.click();
});


//* DragNDrop download (updating file using drag event's file)
loaderWrapper.addEventListener("drop", (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];
    
    if(droppedFile && droppedFile.type.startsWith("image")) {
        file = droppedFile;

        cropperImg.src = URL.createObjectURL(droppedFile);
        cropperImg.onload = onImgLoad;

        openCropper();
    }
});

loaderWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
});

function onImgLoad() {
    const imgW = this.clientWidth; // this img
    const imgH = this.clientHeight;

    //& To remove weird empty space below some images
    cropperContainer.style.width = `${imgW}px`;
    cropperContainer.style.height = `${imgH}px`;

    //& Give correct dims to cropperBox
    const minImgDim = Math.min(imgW, imgH);
    cropperBox.style.width = `${minImgDim}px`;
    cropperBox.style.height = `${minImgDim}px`;

    //& Center cropperBox automatically
    const offsetX = Math.round((imgW - minImgDim) / 2);
    const offsetY = Math.round((imgH - minImgDim) / 2);
    cropperBox.style.top = `${offsetY}px`;
    cropperBox.style.left = `${offsetX}px`;
}