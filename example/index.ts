window.onload = () => {
    var uploaderExample1 = getUploader({ maxParallelUploads: 2, autoStart: true, autoRemove: false }, {});
    uploaderExample1.registerArea(document.getElementById('example1-dnd-area'), {
        url: "/api/test",
        method: "POST",
        maxFileSize: 2000,
        allowDragDrop: true,
        clickable: true,
        accept: "*",
        multiple: true,
    });

    var area2 = uploaderExample1.registerArea(document.getElementById('example1-button'), {
        url: "/api/test",
        method: "POST",
        maxFileSize: 5000,
        allowDragDrop: true,
        clickable: true,
        accept: "*",
        multiple: true,
    });

    uploaderExample1.queue.callbacks.onQueueChangedCallback = (result: IUploadFile[]) => {
        var queue = document.getElementById('example1-queue');
        queue.innerHTML = "";
        result.forEach((file: IUploadFile) => {
            console.log(file);

            var fileItem = document.createElement("p");
            fileItem.innerHTML = file.name + " " + file.uploadStatus + " " + file.progress + "%\n";

            var deleteFromQueue = document.createElement("a");
            deleteFromQueue.setAttribute("href", "#");
            deleteFromQueue.innerHTML = "delete";
            deleteFromQueue.addEventListener("click", () => file.remove());

            var cancelInQueue = document.createElement("a");
            cancelInQueue.setAttribute("href", "#");
            cancelInQueue.innerHTML = "cancel";
            cancelInQueue.addEventListener("click", () => file.cancel());

            var startInQueue = document.createElement("a");
            startInQueue.setAttribute("href", "#");
            startInQueue.innerHTML = "start";
            startInQueue.addEventListener("click", () => file.start());

            fileItem.appendChild(startInQueue); fileItem.innerHTML += " ";
            fileItem.appendChild(cancelInQueue); fileItem.innerHTML += " ";
            fileItem.appendChild(deleteFromQueue);

            queue.appendChild(fileItem);
        });
    };

    uploaderExample1.queue.callbacks.onProgressCallback = (file: IUploadFile) => {
        var queue = document.getElementById('example1-queue');
        queue.innerHTML = "";
        uploaderExample1.queue.queuedFiles.forEach((file: IUploadFile) => {
            var fileItem = document.createElement("p");
            fileItem.innerHTML = file.name + " " + file.uploadStatus + " " + file.progress + "%\n";

            var deleteFromQueue = document.createElement("a");
            deleteFromQueue.setAttribute("href", "#");
            deleteFromQueue.innerHTML = "delete";
            deleteFromQueue.addEventListener("click", () => file.remove());

            var cancelInQueue = document.createElement("a");
            cancelInQueue.setAttribute("href", "#");
            cancelInQueue.innerHTML = "cancel";
            cancelInQueue.addEventListener("click", () => file.cancel());

            var startInQueue = document.createElement("a");
            startInQueue.setAttribute("href", "#");
            startInQueue.innerHTML = "start";
            startInQueue.addEventListener("click", () => file.start());

            fileItem.appendChild(startInQueue); fileItem.innerHTML += " ";
            fileItem.appendChild(cancelInQueue); fileItem.innerHTML += " ";
            fileItem.appendChild(deleteFromQueue);

            queue.appendChild(fileItem);
        });
    };
}
