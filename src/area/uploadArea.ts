class UploadArea {
    public targetElement: Element;
    public options: IUploadAreaOptions;
    public uploader: Uploader;
    private uploadCore: UploadCore;
    private fileInput: HTMLInputElement;
    private unregisterOnClick: () => void;
    private unregisterOnDrop: () => void;
    private unregisterOnDragOver: () => void;
    private unregisterOnChange: () => void;

    constructor(targetElement: Element, options: IUploadAreaOptions, uploader: Uploader) {
        this.targetElement = targetElement;
        this.options = options;
        this.uploader = uploader;
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        this.setFullOptions(options);
        this.setupHiddenInput();
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

        this.targetElement.removeEventListener('dragover', this.onDrag);
        this.targetElement.removeEventListener('drop', this.onDrop);

        document.body.removeChild(this.fileInput);
    }

    private setFullOptions(options: IUploadAreaOptions): void {
        this.options.maxFileSize = options.maxFileSize || 1024;
        this.options.allowDragDrop = options.allowDragDrop === undefined || options.allowDragDrop === null ? true : options.allowDragDrop;
        this.options.clickable = options.clickable === undefined || options.clickable === null ? true : options.clickable;
        this.options.accept = options.accept || '*.*';
        this.options.multiple = options.multiple === undefined || options.multiple === null ? true : options.multiple;
    }

    private putFilesToQueue(fileList: FileList | File[]): void {
        var uploadFiles = castFiles(fileList);
        uploadFiles.forEach((file: IUploadFile) => {
            if (this.validateFile(file)) {
                file.start = () => {
                    this.uploadCore.upload([file]);
                    file.start = () => { return; };
                };
            }
        });
        this.uploader.queue.addFiles(uploadFiles);
    }

    private validateFile(file: IUploadFile): boolean {
        if (!this.isFileSizeValid(file)) {
            file.uploadStatus = uploadStatus.failed;
            file.responseText = 'The size of this file exceeds the ' + this.options.maxFileSize + ' MB limit.';

            return false;
        }
        return true;
    }

    private setupHiddenInput(): void {
        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('accept', this.options.accept);
        this.fileInput.style.display = 'none';

        var onChange = (e) => this.onChange(e);
        this.fileInput.addEventListener('change', onChange);
        this.unregisterOnChange = () => this.fileInput.removeEventListener('onChange', onchange);

        if (this.options.multiple) {
            this.fileInput.setAttribute('multiple', '');
        }
        if (this.options.clickable) {
            var onClick = () => this.onClick();
            this.targetElement.addEventListener('click', onClick);
            this.unregisterOnClick = () => this.targetElement.removeEventListener('click', onClick);
        }
        if (this.options.allowDragDrop) {
            var onDrag = (e) => this.onDrag(e);
            this.targetElement.addEventListener('dragover', onDrag);
            this.unregisterOnDragOver = () => this.targetElement.removeEventListener('dragover', onDrag);

            var onDrop = (e) => this.onDrop(e);
            this.targetElement.addEventListener('drop', onDrop);
            this.unregisterOnDrop = () => this.targetElement.removeEventListener('drop', onDrop);
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
        } catch (err) { ; }
        e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
        this.stopEventPropagation(e);
    }

    private onDrop(e: DragEvent): void {
        this.stopEventPropagation(e);
        if (!e.dataTransfer) {
            return;
        }
        var files: FileList | File[] = e.dataTransfer.files;
        if (files.length) {
            if (!this.options.multiple)
                files = [files[0]];

            let result: FileList;
            var items: FileList | File[] = e.dataTransfer.items;
            if (items && items.length && ((<any>items[0]).webkitGetAsEntry !== null)) {
                if (!this.options.multiple)
                    items = [items[0]];

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

    private addFilesFromItems(items: FileList | File[]): void {
        var entry;
        for (var i = 0; i < items.length; i++) {
            let item: IFileExt = <IFileExt>items[i];
            if ((item.webkitGetAsEntry) && (entry = item.webkitGetAsEntry())) {
                if (entry.isFile) {
                    this.putFilesToQueue([item.getAsFile()]);
                } else if (entry.isDirectory) {
                    this.processDirectory(entry, entry.name);
                }
            } else if (item.getAsFile) {
                if (!item.kind || item.kind === 'file') {
                    this.putFilesToQueue([item.getAsFile()]);
                }
            }
        }
    }

    private processDirectory(directory: any, path: string): void {
        var dirReader = directory.createReader();
        var self = this;
        var entryReader = (entries: IFileExt[]) => {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isFile) {
                    entry.file((file: IFileExt) => {
                        if (file.name.substring(0, 1) === '.') {
                            return;
                        }
                        file.fullPath = '' + path + '/' + file.name;
                        self.putFilesToQueue([file]);
                    });
                } else if (entry.isDirectory) {
                    self.processDirectory(entry, '' + path + '/' + entry.name);
                }
            }
        };
        dirReader.readEntries(entryReader, function(error) {
            return typeof console !== 'undefined' && console !== null
                ? typeof console.log === 'function' ? console.log(error) : void 0
                : void 0;
        });
    }

    private handleFiles(files: FileList | File[]): void {
        for (var i = 0; i < files.length; i++) {
            this.putFilesToQueue([files[i]]);
        }
    }

    private isFileSizeValid(file: File): boolean {
        var maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
        if (file.size > maxFileSize) return false;
        return true;
    }

    private stopEventPropagation(e) {
        e.stopPropagation();
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            return e.returnValue = false;
        }
    }
}
