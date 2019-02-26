let dndArea = null;
let buttonArea = null;
let manualStart = false;

window.onload = () => {
    resolveEnvironment();
    let queueRenderer = getQueueRenderer();
    let uploaderExample1 = pu.getUploader({ maxParallelUploads: 2, autoStart: false, autoRemove: false }, {});

    let uploadSettings = {
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

    let queueUploadSettings = {
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

    buttonArea = uploaderExample1.registerArea(<HTMLElement>document.getElementById("example-button"), uploadSettings);
    dndArea = uploaderExample1.registerArea(<HTMLElement>document.getElementById("example-dnd-area"), uploadSettings);
    uploaderExample1.registerArea(<HTMLElement>document.getElementById("example-queue"), queueUploadSettings);

    if (!manualStart) {
        (<HTMLElement>document.getElementById("example-button-manual-start")).style.display = "none";
        (<HTMLElement>document.getElementById("example-button-manual-dnd-start")).style.display = "none";
    }

    uploaderExample1.queue.callbacks.onQueueChangedCallback = (result: pu.IUploadFile[]) => {
        queueRenderer.renderQueue("example-queue", "Example Queue", result, uploaderExample1.queue.options);
    };

    uploaderExample1.queue.callbacks.onProgressCallback = (file: pu.IUploadFile) => {
        queueRenderer.renderItemProgress(file);
    };

    pu.addEventHandler(<HTMLElement>document.getElementById("example-clear-button"), "click", () => uploaderExample1.queue.clearFiles());
};
