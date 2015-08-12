class UploadArea {
    private uploadCore: UploadCore;
    private fileInput: HTMLInputElement;

    private unregisterOnClick: () => void;
    private unregisterOnDrop: () => void;
    private unregisterOnDragOver: () => void;
    private unregisterOnChange: () => void;

    constructor(public targetElement: Element, public options: IUploadAreaOptions, public uploader: Uploader) {
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        this.setFullOptions(options);
        this.setupHiddenInput();
    }

    private setFullOptions(options: IUploadAreaOptions): void {
        this.options.maxFileSize = options.maxFileSize || 1024;
        this.options.allowDragDrop = options.allowDragDrop == undefined ? true : options.allowDragDrop;
        this.options.clickable = options.clickable == undefined ? true : options.clickable;
        this.options.accept = options.accept || '*';
        this.options.multiple = options.multiple == undefined ? true : options.multiple;
    }

    private putFilesToQueue(fileList: FileList): void {
        var uploadFiles = castFiles(fileList);
        uploadFiles.forEach((file: IUploadFile) => {
            file.progress = 0;
            file.start = () => {
                this.uploadCore.upload([file]);
                file.start = () => { };
            };
        });
        this.uploader.queue.addFiles(uploadFiles);
    }

    private putFileToQueue(file: File): void {
        let uploadFile: IUploadFile;
        uploadFile = <IUploadFile>file;
        uploadFile.progress = 0;
        uploadFile.start = () => {
            this.uploadCore.upload([file]);
            uploadFile.start = () => { };
        };
        this.uploader.queue.addFiles([uploadFile]);
    }

    private setupHiddenInput(): void {
        this.fileInput = document.createElement("input");
        this.fileInput.setAttribute("type", "file");
        this.fileInput.setAttribute("accept", this.options.accept);
        this.fileInput.style.display = "none";

        var onChange = (e) => this.onChange(e);
        this.fileInput.addEventListener("change", onChange);
        this.unregisterOnChange = () => this.fileInput.removeEventListener("onChange", onchange)

        if (this.options.multiple) {
            this.fileInput.setAttribute("multiple", "");
        }
        if (this.options.clickable) {
            var onClick = () => this.onClick();
            this.targetElement.addEventListener("click", onClick);
            this.unregisterOnClick = () => this.targetElement.removeEventListener("click", onClick)
        }
        if (this.options.allowDragDrop) {
            var onDrag = (e) => this.onDrag(e);
            this.targetElement.addEventListener("dragover", onDrag);
            this.unregisterOnDragOver = () => this.targetElement.removeEventListener("dragover", onDrag);

            var onDrop = (e) => this.onDrop(e);
            this.targetElement.addEventListener("drop", onDrop);
            this.unregisterOnDrop = () => this.targetElement.removeEventListener("drop", onDrop);
        }
        // attach to body
        document.body.appendChild(this.fileInput);
    }

    private onChange(e): void {
        this.putFilesToQueue(e.target.files);
    }

    private onDrag(e: DragEvent): void {
        var efct;
        try {
            efct = e.dataTransfer.effectAllowed;
        } catch (_error) { }
        e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
        this.stopEventPropagation(e);
    }

    private onDrop(e: DragEvent): void {
        this.stopEventPropagation(e);
        if (!e.dataTransfer) {
            return;
        }
        var files = e.dataTransfer.files;
        if (files.length) {
            var items = e.dataTransfer.items;
            if (items && items.length && ((<any>items[0]).webkitGetAsEntry != null)) {
                this.addFilesFromItems(items);
            } else {
                this.handleFiles(files);
            }
        }
    }

    private onClick(): void {
        this.fileInput.value = '';
        this.fileInput.click();
    }

    private addFilesFromItems(items: FileList): void {
        var entry;
        for (var i = 0; i < items.length; i++) {
            let item: FileExt = <FileExt>items[i];
            if ((item.webkitGetAsEntry) && (entry = item.webkitGetAsEntry())) {
                if (entry.isFile) {
                    this.putFileToQueue(item.getAsFile());
                } else if (entry.isDirectory) {
                    this.processDirectory(entry, entry.name);
                }
            } else if (item.getAsFile) {
                if ((item.kind == null) || item.kind === "file") {
                    this.putFileToQueue(item.getAsFile());
                }
            }
        }
    }

    private processDirectory(directory: any, path: string): void {
        var dirReader = directory.createReader();
        var _class = this;
        var entryReader = (entries: FileExt[]) => {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isFile) {
                    entry.file((file) => {
                        if (file.name.substring(0, 1) === '.') {
                            return;
                        }
                        file.fullPath = "" + path + "/" + file.name;
                        _class.putFileToQueue(file);
                    });
                } else if (entry.isDirectory) {
                    _class.processDirectory(entry, "" + path + "/" + entry.name)
                }
            }
        };
        return dirReader.readEntries(entryReader, function(error) {
            return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(error) : void 0 : void 0;
        });
    }

    private handleFiles(files: FileList): void {
        for (var i = 0; i < files.length; i++) {
            this.putFileToQueue(files[i]);
        }
    }

    private stopEventPropagation(e) {
        e.stopPropagation();
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            return e.returnValue = false;
        }
    }

    destroy(): void {
        if (this.unregisterOnClick)
            this.unregisterOnClick();

        if (this.unregisterOnDrop)
            this.unregisterOnDrop();

        if (this.unregisterOnChange)
            this.unregisterOnChange();

        if (this.unregisterOnDragOver)
            this.unregisterOnDragOver();

        this.targetElement.removeEventListener("dragover", this.onDrag);
        this.targetElement.removeEventListener("drop", this.onDrop);

        document.body.removeChild(this.fileInput);
    }
}
