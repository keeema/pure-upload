class UploadArea {
    private uploadCore: UploadCore;
    private fileInput: HTMLInputElement;

    constructor(public targetElement: Element, public options: IUploadAreaOptions, public uploader: Uploader) {
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        this.setupHiddenInput();
    }

    private putFilesToQueue(fileList: FileList): void {
        var uploadFiles = castFiles(fileList);
        uploadFiles.forEach((file: IUploadFile) => {
          file.start = () => {
              this.uploadCore.upload([file]);
              file.start = () => { };
          };
        });
        this.uploader.queue.addFiles(uploadFiles);
    }

    private setupHiddenInput(): void {
        this.fileInput = document.createElement("input");
        this.fileInput.setAttribute("type", "file");
        this.fileInput.style.display = "none";
        this.fileInput.accept = this.options.accept;
        this.fileInput.addEventListener("change", (e: any) => {          
            this.putFilesToQueue(e.target.files);
        });
        if (this.options.multiple) {
            this.fileInput.setAttribute("multiple", "");
        }
        if (this.options.clickable) {
            this.targetElement.addEventListener("click", (e) => {
                this.fileInput.click();
            });
        }
        if (this.options.allowDragDrop) {
            this.targetElement.addEventListener("dragover", (e: DragEvent) => {
                var efct;
                try {
                    efct = e.dataTransfer.effectAllowed;
                } catch (_error) { }
                e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
                this.stopEventPropagation(e);
            });

            this.targetElement.addEventListener("drop", (e: DragEvent) => {
                if (!e.dataTransfer) {
                    return;
                }
                var files = e.dataTransfer.files;
                if (files.length) {
                    var items = e.dataTransfer.files;
                    this.putFilesToQueue(items);
                }
                this.stopEventPropagation(e);
            });
            // this.targetElement.addEventListener("dragenter", (e) => {
            //     console.log("dragenter");
            //     console.log(e);
            // });
            // this.targetElement.addEventListener("dragstart", (e) => {
            //     console.log("dragstart");
            //     console.log(e);
            // });
            // this.targetElement.addEventListener("dragend", (e) => {
            //     console.log("dragend");
            //     console.log(e);
            // });
        }
        // attach to body
        document.body.appendChild(this.fileInput);
    }

    private stopEventPropagation(e) {
        e.stopPropagation();
        if (e.preventDefault) {
            e.preventDefault();
        }
    }

    destroy() : void {
        document.body.removeChild(this.fileInput);
    }
}
