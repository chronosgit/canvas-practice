/* Setup */

const loaderWrapper = document.getElementById("loader_wrapper");
const loaderImg = document.getElementById("loader_img");

let file = null;

const cropperArea = document.getElementById("cropper_area");
const cropperImg = document.getElementById("cropper_img");
const cropperContainer = document.getElementById("cropper_container");

// Main box, we change it's dims and pos
const cropperBox = document.getElementById("cropper_box");
// Outline to have events on it, "invisible" trigger area
const cropperOutline = document.getElementById("cropper_outline");
// Circle-like holders for resizing
const cropperHandlers = document.getElementsByClassName("cropper_handler");

const cropperBtnCrop = document.getElementById("cropper_btn_crop");
const cropperBtnCancel = document.getElementById("cropper_btn_cancel");



/* Cropper init, deinit and action */

function openCropper() {
    cropperArea.style.display = "flex";
}

function closeCropper() {
    cropperImg.src = "";
    cropperArea.style.display = "none";
}

function crop() {
    // Temporary image assignment
    loaderImg.src = cropperImg.src;

    // End cropping
    closeCropper();
}

cropperBtnCrop.addEventListener("click", crop);
cropperBtnCancel.addEventListener("click", closeCropper);



//* Loading img logic

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
                cropperImg.onload = onImgLoad;

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

    // To remove weird empty space below some images
    cropperContainer.style.width = `${imgW}px`;
    cropperContainer.style.height = `${imgH}px`;
}