window.onload = () => {
    resolveEnvironment();
    var queueRenderer = getQueueRenderer();
    var uploaderExample1 = pu.getUploader({ maxParallelUploads: 2, autoStart: false, autoRemove: false }, {});

    var uploadSettings = {
        url: "/api/test",
        method: "POST",
        maxFileSize: 2000,
        allowDragDrop: true,
        clickable: true,
        accept: "*.*",
        multiple: true,
    };
    var queueUploadSettings = {
        url: "/api/test",
        method: "POST",
        maxFileSize: 2000,
        allowDragDrop: true,
        clickable: false,
        accept: "*.*",
        multiple: true,
    };

    uploaderExample1.registerArea(document.getElementById('example-dnd-area'), uploadSettings);
    uploaderExample1.registerArea(document.getElementById('example-button'), uploadSettings);
    uploaderExample1.registerArea(document.getElementById('example-queue'), queueUploadSettings);

    uploaderExample1.queue.callbacks.onQueueChangedCallback = (result: pu.IUploadFile[]) => {
        queueRenderer.renderQueue('example-queue', 'Example Queue', result, uploaderExample1.queue.options);
    };

    uploaderExample1.queue.callbacks.onProgressCallback = (file: pu.IUploadFile) => {
        queueRenderer.renderItemProgress('example-queue', file);
    };

    uploaderExample1.queue.callbacks.onFilesAddedErrorCallback = (files: pu.IUploadFile[]) => {
        var errorMessage = "";
        files.forEach((file: pu.IUploadFile) => {
            errorMessage += "File " + file.name + " validation failed.\n";
        });
        alert(errorMessage);
    };

    document.getElementById("example-clear-button").addEventListener('click', () => uploaderExample1.queue.clearFiles());
}
