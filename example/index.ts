window.onload = () => {
    var uploaderExample1 = getUploader({ maxParallelUploads: 2, autoStart: false, autoRemove: false }, {});
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
        createQueue('example1-queue');
    };

    uploaderExample1.queue.callbacks.onProgressCallback = (file: IUploadFile) => {
        createQueue('example1-queue');
    };

    function createQueue(queueid:string){
      var queue = document.getElementById(queueid);
      var queueElement = document.createElement('div');
      uploaderExample1.queue.queuedFiles.forEach((file: IUploadFile) => {
          var fileItem = document.createElement("p");
          var info = document.createElement('div');
          info.innerHTML = file.name + " " + file.uploadStatus + " " + file.progress + "%\n";

          var deleteFromQueue = document.createElement("button");
          deleteFromQueue.innerHTML = "delete";
          deleteFromQueue.addEventListener("click", () => file.remove());

          var cancelInQueue = document.createElement("button");
          cancelInQueue.innerHTML = "cancel";
          cancelInQueue.addEventListener("click", () => {
            file.cancel()
          });

          var startInQueue = document.createElement("button");
          startInQueue.innerHTML = "start";
          startInQueue.addEventListener("click", () => file.start());

          fileItem.appendChild(info);
          fileItem.appendChild(startInQueue);
          fileItem.appendChild(cancelInQueue);
          fileItem.appendChild(deleteFromQueue);

          queueElement.appendChild(fileItem);
      });

      queue.innerHTML ='';
      queue.appendChild(queueElement);
    }
}
