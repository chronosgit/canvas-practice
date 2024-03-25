/* Setup */
const loaderWrapper = document.getElementById("loader_wrapper");
const loaderImg = document.getElementById("loader_img");

let file = null;

const cropperWrapper = document.getElementById("cropper_wrapper");

const cropperContainer = document.getElementById("cropper_container");
const cropperBox = document.getElementById("cropper_box");
const cropperImg = document.getElementById("cropper_img");
const cropperOutline = document.getElementById("cropper_outline");
const cropperHandlers = document.getElementsByClassName("cropper_handler");
const cropperHandlerNw = document.getElementById("cropper_handler_nw");
const cropperHandlerNe = document.getElementById("cropper_handler_ne");
const cropperHandlerSe = document.getElementById("cropper_handler_se");
const cropperHandlerSw = document.getElementById("cropper_handler_sw");

const cropperBtnCrop = document.getElementById("cropper_btn_crop");
const cropperBtnCancel = document.getElementById("cropper_btn_cancel");

let triggerEl = null;
let isClicked = false;
let opType = null;
let mouse = {x: undefined, y: undefined};



/* Cropper logic */

// Functions

function restoreOrigCursors() {
    cropperOutline.style.cursor = "move";
    cropperHandlerNe.style.cursor = "ne-resize";
    cropperHandlerSe.style.cursor = "se-resize";
    cropperHandlerSw.style.cursor = "sw-resize";
    cropperHandlerNw.style.cursor = "nw-resize";
}

function clearStates() {
    triggerEl = null;
    isClicked = false;
    opType = null;
}

function grab() {
    console.log("grab");
}

function neResize() {
    console.log("ne");
}

function seResize() {
    console.log("se");
}

function swResize() {
    console.log("sw");
}

function nwResize() {
    console.log("nw");
}

// Outline (box) logic

cropperOutline.addEventListener("mousedown", e => {
    if(isClicked) return;

    triggerEl = e.currentTarget;
    isClicked = true;
    opType = "grab";
    restoreOrigCursors();

    console.log("Click, so:", opType);
});

cropperOutline.addEventListener("mousemove", e => {
    e.preventDefault();

    if(!isClicked) return;

    switch(opType) {
    case "grab":
        grab();
        break;
    case "ne":
        neResize();
        cropperOutline.style.cursor = "ne-resize";
        break;
    case "se":
        seResize();
        cropperOutline.style.cursor = "se-resize";
        break;
    case "sw":
        swResize();
        cropperOutline.style.cursor = "sw-resize";
        break;
    case "nw":
        nwResize();
        cropperOutline.style.cursor = "nw-resize";
    }
});

cropperOutline.addEventListener("mouseup", e => {
    clearStates();
    restoreOrigCursors();

    console.log("Outline up");
});

// Handlers logic

for(let i = 0; i < cropperHandlers.length; i++) {
    const handler = cropperHandlers[i];
    let type = "";

    if(handler === cropperHandlerNe) type = "ne";
    else if(handler === cropperHandlerSe) type = "se";
    else if(handler === cropperHandlerSw) type = "sw";
    else if(handler === cropperHandlerNw) type = "nw";

    handler.addEventListener("mousedown", e => {
        if(isClicked) return;

        triggerEl = e.currentTarget;
        isClicked = true;
        opType = type;

        console.log("Clicked, so", opType);
    });

    handler.addEventListener("mousemove", e => {
        if(!isClicked) return;
        // Grab is in process, it just hover over
        if(triggerEl !== handler) {
            handler.style.cursor = "move";
        }

        switch(opType) {
        case "ne":
            neResize();
            break;
        case "se":
            seResize();
            break;
        case "sw":
            swResize();
            break;
        case "nw":
            nwResize();
        }
    });

    handler.addEventListener("mouseup", e => {
        clearStates();
        restoreOrigCursors();
    });
}

// Fix doc attention (we aint in cropper, so reset)
document.addEventListener("mousemove", e => {
    const triggers = [
        cropperOutline, cropperHandlerNe,
        cropperHandlerSe, cropperHandlerSw,
        cropperHandlerNw,
    ];

    if(!triggers.includes(e.target)) {
        clearStates();
    }
});



/* Cropper init, deinit and action */

function openCropper() {
    cropperWrapper.style.display = "flex";
}

function closeCropper() {
    cropperImg.src = "";

    cropperWrapper.style.display = "none";

    clearStates();
}

function crop() {
    // Temporary image assignment
    loaderImg.src = cropperImg.src;

    // End cropping
    closeCropper();
}

cropperBtnCrop.addEventListener("click", crop);
cropperBtnCancel.addEventListener("click", closeCropper);



/* Loading img logic */

// Click download (using FileReader and input to load some image to file)
loaderWrapper.addEventListener("click", () => {
    const tmpInput = document.createElement("input");
    tmpInput.type = "file";

    tmpInput.onchange = (changeE) => {
        const loadedFile = changeE.target.files[0];

        if(loadedFile && loadedFile.type.includes("image")) {
            const reader = new FileReader();

            reader.onload = (readerE) => {
                const imgDataUrl = readerE.target.result;
                // file = loadedFile;

                cropperImg.src = imgDataUrl;
                cropperImg.onload = () => {
                    const imgW = cropperImg.clientWidth;
                    const imgH = cropperImg.clientHeight;

                    // To remove weird empty space below some images
                    cropperContainer.style.width = `${imgW}px`;
                    cropperContainer.style.height = `${imgH}px`;

                    // To position cropper at full or at center
                    const isSquare = (imgW - imgH === 0);

                    if(isSquare) {
                        cropperBox.style.width = "100%";
                        cropperBox.style.height = "100%";
                    } else {
                        console.log(`Zoom: ${imgW, imgH}`);
                        cropperBox.style.width = `${Math.min(imgW, imgH)}px`;
                        cropperBox.style.height = `${Math.min(imgW, imgH)}px`;
                    }
                };

                openCropper();
            };

            reader.readAsDataURL(loadedFile);
        }
    };

    tmpInput.click();
});

// DragNDrop download (updating file using drag event's file)
loaderWrapper.addEventListener("drop", (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];
    
    if(droppedFile && droppedFile.type.startsWith("image")) {
        // file = droppedFile;

        cropperImg.src = URL.createObjectURL(droppedFile);
        cropperImg.onload = () => {
            const imgW = cropperImg.clientWidth;
            const imgH = cropperImg.clientHeight;

            // To remove weird empty space below some images
            cropperContainer.style.width = `${imgW}px`;
            cropperContainer.style.height = `${imgH}px`;

            // To position cropper at full or at center
            const isSquare = (imgW - imgH === 0);

            if(isSquare) {
                cropperBox.style.width = "100%";
                cropperBox.style.height = "100%";
            } else {
                console.log(`Zoom: ${imgW, imgH}`);
                cropperBox.style.width = `${Math.min(imgW, imgH)}px`;
                cropperBox.style.height = `${Math.min(imgW, imgH)}px`;
            }
        };

        openCropper();
    }
});

loaderWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
});