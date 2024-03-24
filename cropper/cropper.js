/* Setup */
const loaderWrapper = document.getElementById("loader_wrapper");
const loaderImg = document.getElementById("loader_img");

const cropperWrapper = document.getElementById("cropper_wrapper");

const cropperContainer = document.getElementById("cropper_container");
const cropperImg = document.getElementById("cropper_img");
const cropperOutline = document.getElementById("cropper_outline");
const cropperHandlerNw = document.getElementById("cropper_handler_nw");
const cropperHandlerNe = document.getElementById("cropper_handler_ne");
const cropperHandlerSe = document.getElementById("cropper_handler_se");
const cropperHandlerSw = document.getElementById("cropper_handler_sw");

const cropperBtnCrop = document.getElementById("cropper_btn_crop");
const cropperBtnCancel = document.getElementById("cropper_btn_cancel");

let isClicked = false;
let file = null;



/* Cropper logic */

// Translate and resize cropper



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

        openCropper();
    }
});

loaderWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
});