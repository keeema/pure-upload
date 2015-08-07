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
      result.forEach( (file: IUploadFile) => {
        var fileItem = document.createElement("p");
        fileItem.innerHTML = file.name + " " + file.uploadStatus + " " + file.progress + "%\n";
        queue.appendChild(fileItem);
      });
    };

    uploaderExample1.queue.callbacks.onProgressCallback = (file: IUploadFile) => {
      var queue = document.getElementById('example1-queue');
      queue.innerHTML = "";
      uploaderExample1.queue.queuedFiles.forEach( (file: IUploadFile) => {
        var fileItem = document.createElement("p");
        fileItem.innerHTML = file.name + " " + file.uploadStatus + " " + file.progress + "%\n";
        queue.appendChild(fileItem);
      });
    };
}
