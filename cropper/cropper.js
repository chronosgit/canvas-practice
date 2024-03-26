/* Setup */

const loaderWrapper = document.getElementById("loader_wrapper");
const loaderImg = document.getElementById("loader_img");

let file = null;

const cropperWrapper = document.getElementById("cropper_wrapper");
const cropperContainer = document.getElementById("cropper_container");
const cropperImg = document.getElementById("cropper_img");

const cropperBtnCrop = document.getElementById("cropper_btn_crop");
const cropperBtnCancel = document.getElementById("cropper_btn_cancel");



/* Cropper init, deinit and action */

function openCropper() {
    cropperWrapper.style.display = "flex";
}

function closeCropper() {
    cropperImg.src = "";
    cropperWrapper.style.display = "none";
    cropperOutline.style.top = "0";
    cropperOutline.style.left = "0";

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

                    // To correctly set dims of cropper
                    cropperOutline.style.width = `${Math.min(imgW, imgH)}px`;
                    cropperOutline.style.height = `${Math.min(imgW, imgH)}px`;
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

            // To correctly set dims of cropper
            cropperOutline.style.width = `${Math.min(imgW, imgH)}px`;
            cropperOutline.style.height = `${Math.min(imgW, imgH)}px`;
        };

        openCropper();
    }
});

loaderWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
});