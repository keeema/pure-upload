class UploadArea {
    public targetElement: HTMLElement;
    public options: IUploadAreaOptions;
    public uploader: Uploader;
    private uploadCore: UploadCore;
    private fileInput: HTMLInputElement;
    private fileList: IUploadFile[] | null | undefined;
    private unregisterOnClick: () => void;
    private unregisterOnDrop: () => void;
    private unregisterOnDragOver: () => void;
    private unregisterOnChange: () => void;

    constructor(targetElement: HTMLElement, options: IUploadAreaOptions, uploader: Uploader) {
        this.targetElement = targetElement;
        this.options = options;
        this.uploader = uploader;
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        this.setFullOptions(options);
        if (isFileApi) {
            this.setupFileApiElements();
        } else {
            throw 'Only browsers with FileAPI supported.';
        }
    }

    start(autoClear: boolean = false) {
        if (this.options.manualStart && this.fileList) {
            this.putFilesToQueue();
            if (autoClear)
                this.clear();
        }
    }

    clear() {
        this.fileList = null;
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
        this.options.allowDragDrop = isFileApi &&
            (options.allowDragDrop === undefined || options.allowDragDrop === null ? true : options.allowDragDrop);
        this.options.clickable = options.clickable === undefined || options.clickable === null ? true : options.clickable;
        this.options.accept = options.accept || '*.*';
        this.options.validateExtension = !!options.validateExtension;
        this.options.multiple = isFileApi &&
            (options.multiple === undefined || options.multiple === null ? true : options.multiple);
    }

    private selectFiles(fileList: FileList | File[]) {
        this.fileList = castFiles(fileList);

        if (this.options.onFileSelected)
            this.fileList.forEach((file: IUploadFile) => {
                if (this.options.onFileSelected)
                    this.options.onFileSelected(file);
            });

        if (!this.options.manualStart)
            this.putFilesToQueue();
    }

    private putFilesToQueue(): void {
        if (!this.fileList)
            return;

        this.fileList.forEach((file: IUploadFile) => {
            file.guid = newGuid();
            delete file.uploadStatus;
            file.url = this.uploadCore.getUrl(file);
            file.onError = this.options.onFileError || (() => { ; });
            file.onCancel = this.options.onFileCanceled || (() => { ; });
            if (this.validateFile(file)) {
                file.start = () => {
                    this.uploadCore.upload([file]);

                    if (this.options.onFileAdded) {
                        this.options.onFileAdded(file);
                    }
                    file.start = () => { return; };
                };
            } else {
                file.onError(file);
            }
        });
        this.uploader.queue.addFiles(this.fileList);
    }

    private validateFile(file: IUploadFile): boolean {
        if (!this.isFileSizeValid(file)) {
            file.uploadStatus = UploadStatus.failed;
            file.responseText = !!this.options.localizer
                ? this.options.localizer(
                    'The selected file exceeds the allowed size of { maxFileSize } MB or its size is 0 MB. Please choose another file.',
                    this.options)
                : 'The selected file exceeds the allowed size of ' + this.options.maxFileSize
                + ' or its size is 0 MB. Please choose another file.';
            return false;
        }
        if (this.isFileTypeInvalid(file)) {
            file.uploadStatus = UploadStatus.failed;
            file.responseText = !!this.options.localizer
                ? this.options.localizer('File format is not allowed. Only { accept } files are allowed.', this.options)
                : 'File format is not allowed. Only ' + (this.options.accept
                    ? this.options.accept.split('.').join(' ')
                    : '') + ' files are allowed.';
            return false;
        }
        return true;
    }

    private setupFileApiElements(): void {
        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('accept', this.options.accept ? this.options.accept : '');
        this.fileInput.style.display = 'none';

        const onChange = (e: Event) => this.onChange(e);
        addEventHandler(this.fileInput, 'change', onChange);
        this.unregisterOnChange = () => removeEventHandler(this.fileInput, 'change', onchange);

        if (this.options.multiple) {
            this.fileInput.setAttribute('multiple', '');
        }

        const onClick = () => this.onClick();
        addEventHandler(this.targetElement, 'click', onClick);
        this.unregisterOnClick = () => removeEventHandler(this.targetElement, 'click', onClick);

        const onDrag = (e: DragEvent) => this.onDrag(e);
        addEventHandler(this.targetElement, 'dragover', onDrag);
        this.unregisterOnDragOver = () => removeEventHandler(this.targetElement, 'dragover', onDrag);

        const onDrop = (e: DragEvent) => this.onDrop(e);
        addEventHandler(this.targetElement, 'drop', onDrop);
        this.unregisterOnDrop = () => removeEventHandler(this.targetElement, 'drop', onDrop);

        // attach to body
        document.body.appendChild(this.fileInput);
    }

    private onChange(e: Event): void {
        this.selectFiles(<FileList>(<HTMLInputElement>e.target).files);
    }

    private onDrag(e: DragEvent): void {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;

        let efct: string | undefined = undefined;
        try {
            efct = e.dataTransfer.effectAllowed;
        } catch (err) { ; }
        e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
        this.stopEventPropagation(e);
    }

    private onDrop(e: DragEvent): void {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;

        this.stopEventPropagation(e);
        if (!e.dataTransfer) {
            return;
        }
        let files: FileList | File[] = e.dataTransfer.files;
        if (files.length) {
            if (!this.options.multiple)
                files = [files[0]];

            let items = e.dataTransfer.items;
            if (items && items.length && ((<{ webkitGetAsEntry?: Object }>items[0]).webkitGetAsEntry !== null)) {
                if (!this.options.multiple) {
                    let newItems = [items[0]];
                    this.addFilesFromItems(newItems);
                } else {
                    this.addFilesFromItems(items);
                }
            } else {
                this.handleFiles(files);
            }
        }
    }

    private isIeVersion(v: number): boolean {
        return RegExp('msie' + (!isNaN(v) ? ('\\s' + v.toString()) : ''), 'i').test(navigator.userAgent);
    }

    private onClick(): void {
        if (!getValueOrResult(this.options.clickable))
            return;

        this.fileInput.value = '';

        if (this.isIeVersion(10)) {
            setTimeout(() => { this.fileInput.click(); }, 200);
        } else {
            this.fileInput.click();
        }
    }

    private addFilesFromItems(items: FileList | File[] | DataTransferItemList | DataTransferItem[]): void {
        let entry: IFileExt;
        for (let i = 0; i < items.length; i++) {
            let item: IFileExt = <IFileExt>items[i];
            if ((item.webkitGetAsEntry) && (entry = <IFileExt>item.webkitGetAsEntry())) {
                if (entry.isFile) {
                    this.selectFiles([item.getAsFile()]);
                } else if (entry.isDirectory) {
                    this.processDirectory(entry, entry.name);
                }
            } else if (item.getAsFile) {
                if (!item.kind || item.kind === 'file') {
                    this.selectFiles([item.getAsFile()]);
                }
            }
        }
    }

    private processDirectory(directory: { createReader: Function }, path: string): void {
        let dirReader = directory.createReader();
        let self = this;
        let entryReader = (entries: (IFileExt & { createReader: Function })[]) => {
            for (let i = 0; i < entries.length; i++) {
                let entry = entries[i];
                if (entry.isFile) {
                    entry.file((file: IFileExt) => {
                        if (file.name.substring(0, 1) === '.') {
                            return;
                        }
                        file.fullPath = '' + path + '/' + file.name;
                        self.selectFiles([file]);
                    });
                } else if (entry.isDirectory) {
                    self.processDirectory(entry, '' + path + '/' + entry.name);
                }
            }
        };
        dirReader.readEntries(entryReader, function (error: string) {
            return typeof console !== 'undefined' && console !== null
                ? typeof console.log === 'function' ? console.log(error) : void 0
                : void 0;
        });
    }

    private handleFiles(files: FileList | File[]): void {
        for (let i = 0; i < files.length; i++) {
            this.selectFiles([files[i]]);
        }
    }

    private isFileSizeValid(file: File): boolean {
        let maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
        if (file.size > maxFileSize || file.size === 0) return false;
        return true;
    }

    private isFileTypeInvalid(file: File): boolean {
        if (file.name && this.options.accept && (this.options.accept.trim() !== '*' || this.options.accept.trim() !== '*.*') &&
            this.options.validateExtension && this.options.accept.indexOf('/') === -1) {
            let acceptedExtensions = this.options.accept.split(',');
            let fileExtension = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
            if (fileExtension.indexOf('.') === -1) return true;
            let isFileExtensionExisted = true;
            for (let i = 0; i < acceptedExtensions.length; i++) {
                if (acceptedExtensions[i].toUpperCase().trim() === fileExtension.toUpperCase()) {
                    isFileExtensionExisted = false;
                }
            }
            return isFileExtensionExisted;
        }
        return false;
    }

    private stopEventPropagation(e: Event) {
        e.stopPropagation();
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    }
}