class UploadArea implements IUploadArea {
    targetElement: Element;
    uploadCore: IUploadCore;
    uploadAreaOptions: IUploadAreaOptions;
    uploader: IUploader;

    constructor(element: Element, options: IUploadAreaOptions, uploader: IUploader) {
        this.targetElement = element;
        this.uploadAreaOptions = options;
        this.uploader = uploader;
    }

    init(): void {
        this.uploadCore = getUploadCore(this.uploadAreaOptions);
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
        fileInput.accept = this.uploadAreaOptions.accept;
        if (this.uploadAreaOptions.multiple) {
            fileInput.setAttribute("multiple", "");
        }
        if (this.uploader.uploaderOptions.autoStart) {
            fileInput.addEventListener("change", (e: any) => {
                console.log("changed");
                console.log(e);
                this.putFilesToQueue(e.target.files);
            });
        }
        if (this.uploadAreaOptions.clickable) {
            this.targetElement.addEventListener("click", (e) => {
                fileInput.click();
            });
        }
        if (this.uploadAreaOptions.allowDragDrop) {
            // this.targetElement.addEventListener("dragenter", (e) => {
            //     console.log("dragenter");
            //     console.log(e);
            // });
            this.targetElement.addEventListener("dragover", (e : DragEvent) => {
              var efct;
              try {
                efct = e.dataTransfer.effectAllowed;
              } catch (_error) {}
              e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
              this.stopEventPropagation(e);
            });
            this.targetElement.addEventListener("drop", (e : DragEvent) => {
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
        document.body.appendChild(fileInput);
    }

    private stopEventPropagation(e) {
      e.stopPropagation();
      if (e.preventDefault) {
        e.preventDefault();
      }
    }
}
