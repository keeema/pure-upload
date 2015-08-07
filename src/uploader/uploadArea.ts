class UploadArea implements IUploadArea {
    private uploadCore: IUploadCore;

    constructor(public targetElement: Element, public options: IUploadAreaOptions, public uploader: IUploader) {
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        this.setupHiddenInput();
    }

    private putFilesToQueue(files: FileList): void {
        let file: IUploadFile;
        file = <IUploadFile>files[0];

        let filesToGo: IUploadFile[];
        filesToGo = [];
        filesToGo.push(file);

        var _class = this;
        file.start = () => {
            _class.uploadCore.upload(filesToGo);
            file.start = () => { };
        };
        this.uploader.queue.addFiles(filesToGo);
    }

    private setupHiddenInput(): void {
        var fileInput = document.createElement("input");
        fileInput.setAttribute("type", "file");
        fileInput.style.display = "none";
        fileInput.accept = this.options.accept;
        if (this.options.multiple) {
            fileInput.setAttribute("multiple", "");
        }
        if (this.uploader.uploaderOptions.autoStart) {
            fileInput.addEventListener("change", (e: any) => {
                console.log("changed");
                console.log(e);
                this.putFilesToQueue(e.target.files);
            });
        }
        if (this.options.clickable) {
            this.targetElement.addEventListener("click", (e) => {
                fileInput.click();
            });
        }
        if (this.options.allowDragDrop) {
            this.targetElement.addEventListener("dragenter", (e) => {
                console.log("dragenter");
                console.log(e);
            });
            this.targetElement.addEventListener("drop", (e) => {
                console.log(e);
                console.log("dragdrop");
            });
            this.targetElement.addEventListener("dragstart", (e) => {
                console.log("dragstart");
                console.log(e);
            });
            this.targetElement.addEventListener("dragend", (e) => {
                console.log("dragend");
                console.log(e);
            });
        }
        // attach to body
        document.body.appendChild(fileInput);
    }
}
