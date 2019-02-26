"use strict";
var dndArea = null;
var buttonArea = null;
var manualStart = false;
window.onload = function () {
    resolveEnvironment();
    var queueRenderer = getQueueRenderer();
    var uploaderExample1 = pu.getUploader({ maxParallelUploads: 2, autoStart: false, autoRemove: false }, {});
    var uploadSettings = {
        url: "/api/test",
        method: "POST",
        maxFileSize: 1024,
        allowDragDrop: true,
        clickable: true,
        accept: "*.*",
        multiple: true,
        dragOverStyle: "dnd-area-over",
        dragOverGlobalStyle: "dnd-area-global",
        manualStart: manualStart
    };
    var queueUploadSettings = {
        url: "/api/test",
        method: "POST",
        maxFileSize: 1024,
        allowDragDrop: true,
        clickable: false,
        accept: "*.*",
        multiple: true,
        dragOverStyle: "dnd-area-over",
        dragOverGlobalStyle: "dnd-area-global"
    };
    buttonArea = uploaderExample1.registerArea(document.getElementById("example-button"), uploadSettings);
    dndArea = uploaderExample1.registerArea(document.getElementById("example-dnd-area"), uploadSettings);
    uploaderExample1.registerArea(document.getElementById("example-queue"), queueUploadSettings);
    if (!manualStart) {
        document.getElementById("example-button-manual-start").style.display = "none";
        document.getElementById("example-button-manual-dnd-start").style.display = "none";
    }
    uploaderExample1.queue.callbacks.onQueueChangedCallback = function (result) {
        queueRenderer.renderQueue("example-queue", "Example Queue", result, uploaderExample1.queue.options);
    };
    uploaderExample1.queue.callbacks.onProgressCallback = function (file) {
        queueRenderer.renderItemProgress(file);
    };
    pu.addEventHandler(document.getElementById("example-clear-button"), "click", function () { return uploaderExample1.queue.clearFiles(); });
};
