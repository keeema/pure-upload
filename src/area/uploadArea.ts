class UploadArea {
    public targetElement: HTMLElement;
    public options: IUploadAreaOptions;
    public uploader: Uploader;
    private uploadCore: UploadCore;
    private fileInput: HTMLInputElement;
    private formForNoFileApi: HTMLFormElement;
    private lastIframe: HTMLElement;
    private unregisterOnClick: () => void;
    private unregisterOnDrop: () => void;
    private unregisterOnDragOver: () => void;
    private unregisterOnChange: () => void;
    private unregisterFormOnChange: () => void;

    constructor(targetElement: HTMLElement, options: IUploadAreaOptions, uploader: Uploader, formForNoFileApi?: HTMLFormElement) {
        this.formForNoFileApi = !!formForNoFileApi && formForNoFileApi.getElementsByTagName('form')[0];

        this.targetElement = targetElement;
        this.options = options;
        this.uploader = uploader;
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        this.setFullOptions(options);
        if (isFileApi) {
            this.setupFileApiElements();
        } else {
            this.setupOldSchoolElements();
        }
    }

    destroy(): void {
        if (isFileApi) {
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
        } else {
            if (this.unregisterFormOnChange)
                this.unregisterFormOnChange();

            if (this.lastIframe)
                this.formForNoFileApi.parentNode.removeChild(this.lastIframe);
        }
    }

    private setFullOptions(options: IUploadAreaOptions): void {
        this.options.maxFileSize = options.maxFileSize || 1024;
        this.options.allowDragDrop = isFileApi &&
        (options.allowDragDrop === undefined || options.allowDragDrop === null ? true : options.allowDragDrop);
        this.options.clickable = options.clickable === undefined || options.clickable === null ? true : options.clickable;
        this.options.accept = options.accept || '*.*';
        this.options.multiple = isFileApi &&
        (options.multiple === undefined || options.multiple === null ? true : options.multiple);
    }

    private putFilesToQueue(fileList: FileList | File[], form: HTMLInputElement): void {
        var uploadFiles = castFiles(fileList);
        forEach(uploadFiles, (file: IUploadFile) => {
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
            file.responseText = !!this.options.localizer
                ? this.options.localizer('The size of this file exceeds the { maxFileSize } MB limit.', this.options)
                : 'The size of this file exceeds the ' + this.options.maxFileSize + ' MB limit.';
            return false;
        }
        return true;
    }

    private setupFileApiElements(): void {
        if (this.formForNoFileApi) {
            this.formForNoFileApi.style.display = 'none';
        }
        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('accept', this.options.accept);
        this.fileInput.style.display = 'none';

        var onChange = (e) => this.onChange(e);
        addEventHandler(this.fileInput, 'change', onChange);
        this.unregisterOnChange = () => removeEventHandler(this.fileInput, 'change', onchange);

        if (this.options.multiple) {
            this.fileInput.setAttribute('multiple', '');
        }
        if (this.options.clickable) {
            var onClick = () => this.onClick();
            addEventHandler(this.targetElement, 'click', onClick);
            this.unregisterOnClick = () => removeEventHandler(this.targetElement, 'click', onClick);
        }
        if (this.options.allowDragDrop) {
            var onDrag = (e) => this.onDrag(e);
            addEventHandler(this.targetElement, 'dragover', onDrag);
            this.unregisterOnDragOver = () => removeEventHandler(this.targetElement, 'dragover', onDrag);

            var onDrop = (e) => this.onDrop(e);
            addEventHandler(this.targetElement, 'drop', onDrop);
            this.unregisterOnDrop = () => removeEventHandler(this.targetElement, 'drop', onDrop);
        }
        // attach to body
        document.body.appendChild(this.fileInput);
    }

    private setupOldSchoolElements(): void {
        if (!this.formForNoFileApi)
            return;

        this.targetElement.style.display = 'none';
        this.formForNoFileApi.setAttribute('method', this.uploadCore.options.method);
        this.formForNoFileApi.setAttribute('enctype', 'multipart/form-data');
        this.formForNoFileApi.setAttribute('encoding', 'multipart/form-data');

        let fileInput: HTMLInputElement;
        let submitInput: HTMLInputElement;
        let inputs = this.formForNoFileApi.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            var el = inputs[i];
            if (el.type === 'file') {
                fileInput = el;
            } else if (el.type === 'submit') {
                submitInput = el;
            }
        }

        let handler = (e) => this.onFormChange(e, fileInput, submitInput);
        addEventHandler(fileInput, 'change', handler);
        this.unregisterFormOnChange = () => removeEventHandler(fileInput, 'change', handler);
    }

    private onFormChange(e, fileInput: HTMLInputElement, submitInput: HTMLInputElement) {
        let files = e.target
            ? e.target.files
                ? e.target.files
                : e.target.value
                    ? [{ name: e.target.value.replace(/^.+\\/, '') }]
                    : []
            : fileInput.value
                ? [{ name: fileInput.value.replace(/^.+\\/, '') }]
                : [];

        forEach(files, (file: IUploadFile) => {
            file.guid = file.guid || newGuid();
        });

        if (files.length === 0)
            return;

        this.addTargetIframe();

        this.formForNoFileApi.setAttribute('action', this.uploadCore.getUrl(files[0]));
        if (!submitInput) {
            this.formForNoFileApi.submit();
        }
    }

    private addTargetIframe() {
        if (this.lastIframe) {
            this.formForNoFileApi.parentNode.removeChild(this.lastIframe);
        }

        var iframeName = 'uploadIframe' + Date.now();
        var iframe = this.lastIframe = document.createElement('iframe');
        iframe.setAttribute('id', iframeName);
        iframe.setAttribute('name', iframeName);
        iframe.setAttribute('width', '0');
        iframe.setAttribute('height', '0');
        iframe.setAttribute('border', '0');
        iframe.setAttribute('style', 'width: 0; height: 0; border: none;');
        this.formForNoFileApi.setAttribute('target', iframeName);
        this.formForNoFileApi.parentNode.insertBefore(iframe, this.formForNoFileApi.nextSibling || null);
        window.frames[iframeName].name = iframeName;
    }

    private onChange(e): void {
        this.putFilesToQueue(e.target.files, this.fileInput);
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
                    this.putFilesToQueue([item.getAsFile()], this.fileInput);
                } else if (entry.isDirectory) {
                    this.processDirectory(entry, entry.name);
                }
            } else if (item.getAsFile) {
                if (!item.kind || item.kind === 'file') {
                    this.putFilesToQueue([item.getAsFile()], this.fileInput);
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
                        self.putFilesToQueue([file], this.fileInput);
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
            this.putFilesToQueue([files[i]], this.fileInput);
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
