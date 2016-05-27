class UploadArea {
    public targetElement: HTMLElement;
    public options: IUploadAreaOptions;
    public uploader: Uploader;
    private uploadCore: UploadCore;
    private fileInput: HTMLInputElement;
    private formForNoFileApi: HTMLFormElement;
    private formForNoFileApiProvided: boolean;
    private lastIframe: HTMLElement;
    private unregisterOnClick: () => void;
    private unregisterOnDrop: () => void;
    private unregisterOnDragOver: () => void;
    private unregisterOnChange: () => void;
    private unregisterFormOnChange: () => void;

    constructor(targetElement: HTMLElement, options: IUploadAreaOptions, uploader: Uploader, formForNoFileApi?: HTMLFormElement) {
        if (formForNoFileApi) {
            this.formForNoFileApi = formForNoFileApi.tagName.toLowerCase() === 'form'
                ? formForNoFileApi
                : formForNoFileApi.getElementsByTagName('form')[0];
        }

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

            if (!this.formForNoFileApiProvided) {
                this.formForNoFileApi.parentNode.insertBefore(this.targetElement, this.formForNoFileApi.nextSibling || null);
                this.targetElement.parentNode.removeChild(this.formForNoFileApi);
            }
        }
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

    private putFilesToQueue(fileList: FileList | File[], form: HTMLInputElement): void {
        let uploadFiles = castFiles(fileList);
        forEach(uploadFiles, (file: IUploadFile) => {
            file.onError = this.options.onFileError || (() => { ; });
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
        this.uploader.queue.addFiles(uploadFiles);
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
                : 'File format is not allowed. Only ' + this.options.accept.split('.').join(' ') + ' files are allowed.';
            return false;
        }
        return true;
    }

    private setupFileApiElements(): void {
        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('accept', this.options.accept);
        this.fileInput.style.display = 'none';

        if (this.formForNoFileApi)
            this.formForNoFileApi.style.display = 'none';

        let onChange = (e) => this.onChange(e);
        addEventHandler(this.fileInput, 'change', onChange);
        this.unregisterOnChange = () => removeEventHandler(this.fileInput, 'change', onchange);

        if (this.options.multiple) {
            this.fileInput.setAttribute('multiple', '');
        }
        if (this.options.clickable) {
            let onClick = () => this.onClick();
            addEventHandler(this.targetElement, 'click', onClick);
            this.unregisterOnClick = () => removeEventHandler(this.targetElement, 'click', onClick);
        }
        if (this.options.allowDragDrop) {
            let onDrag = (e) => this.onDrag(e);
            addEventHandler(this.targetElement, 'dragover', onDrag);
            this.unregisterOnDragOver = () => removeEventHandler(this.targetElement, 'dragover', onDrag);

            let onDrop = (e) => this.onDrop(e);
            addEventHandler(this.targetElement, 'drop', onDrop);
            this.unregisterOnDrop = () => removeEventHandler(this.targetElement, 'drop', onDrop);
        }
        // attach to body
        document.body.appendChild(this.fileInput);
    }

    private setupOldSchoolElements(): void {
        if (!this.options.clickable)
            return;

        if (this.formForNoFileApi) {
            this.decorateInputForm();
        } else {
            this.createFormWrapper();
        }

        let submitInput = this.findInnerSubmit();
        let handler = (e) => this.onFormChange(e, this.fileInput, submitInput);
        addEventHandler(this.fileInput, 'change', handler);
        this.unregisterFormOnChange = () => removeEventHandler(this.fileInput, 'change', handler);
    }

    private createFormWrapper() {
        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('accept', this.options.accept);
        this.fileInput.setAttribute('name', 'file');
        this.fileInput.style.position = 'absolute';
        this.fileInput.style.left = '0';
        this.fileInput.style.right = '0';
        this.fileInput.style.top = '0';
        this.fileInput.style.bottom = '0';
        this.fileInput.style.width = '100%';
        this.fileInput.style.height = '100%';
        this.fileInput.style.fontSize = '10000%'; //IE one click
        this.fileInput.style.opacity = '0';
        this.fileInput.style.filter = 'alpha(opacity=0)';
        this.fileInput.style.cursor = 'pointer';

        this.formForNoFileApi = document.createElement('form');
        this.formForNoFileApi.setAttribute('method', this.uploadCore.options.method);
        this.formForNoFileApi.setAttribute('enctype', 'multipart/form-data');
        this.formForNoFileApi.setAttribute('encoding', 'multipart/form-data');
        this.formForNoFileApi.style.position = 'relative';
        this.formForNoFileApi.style.display = 'block';
        this.formForNoFileApi.style.overflow = 'hidden';
        this.formForNoFileApi.style.width = this.targetElement.offsetWidth.toString() + 'px';
        this.formForNoFileApi.style.height = this.targetElement.offsetHeight.toString() + 'px';

        if (this.targetElement.clientHeight === 0 || this.targetElement.clientWidth === 0) {
            console.warn('upload element height and width has to be set to be able catch upload');
        }

        this.targetElement.parentNode.insertBefore(this.formForNoFileApi, this.targetElement.nextSibling || null);
        this.formForNoFileApi.appendChild(this.targetElement);
        this.formForNoFileApi.appendChild(this.fileInput);
    }

    private decorateInputForm() {
        this.formForNoFileApiProvided = true;
        this.targetElement.style.display = 'none';

        this.formForNoFileApi.setAttribute('method', this.uploadCore.options.method);
        this.formForNoFileApi.setAttribute('enctype', 'multipart/form-data');
        this.formForNoFileApi.setAttribute('encoding', 'multipart/form-data');

        let inputs = this.formForNoFileApi.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            let el = inputs[i];
            if (el.type === 'file') {
                this.fileInput = el;
            }
        }
    }

    private findInnerSubmit(): HTMLInputElement {
        let inputs = this.formForNoFileApi.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            let el = inputs[i];
            if (el.type === 'submit') {
                return el;
            }
        }

        return undefined;
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

        let iframeName = 'uploadIframe' + Date.now();
        let iframe = this.lastIframe = document.createElement('iframe');
        iframe.setAttribute('id', iframeName);
        iframe.setAttribute('name', iframeName);
        iframe.style.border = 'none';
        iframe.style.display = 'none';
        iframe.style.width = '0';
        iframe.style.height = '0';
        this.formForNoFileApi.setAttribute('target', iframeName);
        this.formForNoFileApi.parentNode.insertBefore(iframe, this.formForNoFileApi.nextSibling || null);
        window.frames[iframeName].name = iframeName;
    }

    private onChange(e): void {
        this.putFilesToQueue(e.target.files, this.fileInput);
    }

    private onDrag(e: DragEvent): void {
        let efct;
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

    private isIeVersion(v?: number): boolean {
        return RegExp('msie' + (!isNaN(v) ? ('\\s' + v.toString()) : ''), 'i').test(navigator.userAgent);
    }

    private onClick(): void {
        this.fileInput.value = '';

        if (this.isIeVersion(10)) {
            setTimeout(() => { this.fileInput.click(); }, 200);
        } else {
            this.fileInput.click();
        }
    }

    private addFilesFromItems(items: FileList | File[] | DataTransferItemList | DataTransferItem[]): void {
        let entry;
        for (let i = 0; i < items.length; i++) {
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
                        self.putFilesToQueue([file], this.fileInput);
                    });
                } else if (entry.isDirectory) {
                    self.processDirectory(entry, '' + path + '/' + entry.name);
                }
            }
        };
        dirReader.readEntries(entryReader, function (error) {
            return typeof console !== 'undefined' && console !== null
                ? typeof console.log === 'function' ? console.log(error) : void 0
                : void 0;
        });
    }

    private handleFiles(files: FileList | File[]): void {
        for (let i = 0; i < files.length; i++) {
            this.putFilesToQueue([files[i]], this.fileInput);
        }
    }

    private isFileSizeValid(file: File): boolean {
        let maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
        if (file.size > maxFileSize || file.size === 0) return false;
        return true;
    }

    private isFileTypeInvalid(file: File): boolean {
        if (file.name && (this.options.accept.trim() !== '*' || this.options.accept.trim() !== '*.*') &&
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

    private stopEventPropagation(e) {
        e.stopPropagation();
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            return e.returnValue = false;
        }
    }
}
