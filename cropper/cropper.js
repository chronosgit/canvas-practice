/* Setup */
const loaderWrapper = document.getElementById("loader_wrapper");
const loaderImg = document.getElementById("loader_img");

const cropperWrapper = document.getElementById("cropper_wrapper");
const cropperContainer = document.getElementById("cropper_container");
const cropperCanvas = document.getElementById("cropper_canvas");
const cropperImg = document.getElementById("cropper_img");
const cropperBtnCrop = document.getElementById("cropper_btn_crop");
const cropperBtnCancel = document.getElementById("cropper_btn_cancel");

let cropperCursorType = null;
let isClicked = false;
let file = null;



/* Cropper logic */

const ctx = cropperCanvas.getContext("2d");

// Translate and resize cropper

function grapCropper() {

}

function resolveCropperCursor(e, gonnaClick) {
    const canvasCoords = cropperCanvas.getBoundingClientRect();

    // To see if cursor is near important zones
    const deviation = 10;
    const rightZoneX = [
        canvasCoords.right - deviation, 
        canvasCoords.right + deviation
    ];
    const leftZoneX = [
        canvasCoords.left - deviation, 
        canvasCoords.left + deviation
    ];
    const topZoneY = [
        canvasCoords.top - deviation, 
        canvasCoords.top + deviation
    ];
    const bottomZoneY = [
        canvasCoords.bottom - deviation, 
        canvasCoords.bottom + deviation
    ];

    // Coords of mouse cursor
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Near right edge
    if(rightZoneX[0] <= mouseX && mouseX <= rightZoneX[1]) {
        // Near top right corner
        if(topZoneY[0] <= mouseY && mouseY <= topZoneY[1]) {
            cropperCanvas.style.cursor = "sw-resize"
            return "topRightResize";
        }
        // Near bottom right corner
        else if(bottomZoneY[0] <= mouseY && mouseY <= bottomZoneY[1]) {
            cropperCanvas.style.cursor = "nw-resize";
            return "bottomRightResize";
        }
        // Just near right edge
        else {
            cropperCanvas.style.cursor = "w-resize";
            return "rightResize";
        }
    } 
    // Near left edge
    else if(leftZoneX[0] <= mouseX && mouseX <= leftZoneX[1]) {
        // Near top left corner
        if(topZoneY[0] <= mouseY && mouseY <= topZoneY[1]) {
            cropperCanvas.style.cursor = "se-resize";
            return "topLeftResize";
        }
        // Near bottom left corner
        else if(bottomZoneY[0] <= mouseY && mouseY <= bottomZoneY[1]) {
            cropperCanvas.style.cursor = "ne-resize";
            return "bottomLeftResize";
        }
        // Just near left edge
        else {
            cropperCanvas.style.cursor = "e-resize";
            return "leftResize";
        }
    }
    // Just near top edge
    else if(bottomZoneY[0] <= mouseY && mouseY <= bottomZoneY[1]) {
        cropperCanvas.style.cursor = "s-resize";
        return "topResize";
    }
    // Just near bottom edge
    else if(topZoneY[0] <= mouseY && mouseY <= topZoneY[1]) {
        cropperCanvas.style.cursor = "n-resize";
        return "bottomResize";
    }
    // Inside cropper (i.e. grab);
    else {
        // Grabbing is in process
        if(isClicked || gonnaClick) {
            cropperCanvas.style.cursor = "grabbing";
            return "grabbing";
        } 
        // Just hovering
        else {
            cropperCanvas.style.cursor = "grab";
            return "grab";
        }
    }
}

cropperCanvas.addEventListener("mousedown", (e) => {
    cropperCursorType = resolveCropperCursor(e, true);
    isClicked = true;
});

cropperCanvas.addEventListener("mousemove", (e) => {
    if(!isClicked) resolveCropperCursor(e);
    else console.log(cropperCursorType);
});

cropperCanvas.addEventListener("mouseup", (e) => {
    // Hover cursor
    resolveCropperCursor(e);
    isClicked = false;
});

// Cropper init, deinit and action

function openCropper() {
    cropperWrapper.style.display = "flex";
}

function closeCropper() {
    cropperImg.src = "";
    cropperWrapper.style.display = "none";
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
                    cropperCanvas.width = cropperImg.width;
                    cropperCanvas.height = cropperImg.height;
                }

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
            cropperCanvas.width = cropperImg.width;
            cropperCanvas.height = cropperImg.height;
        }

        openCropper();
    }
});

loaderWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
});