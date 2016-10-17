export function addEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void) {
    if (el.addEventListener) {
        el.addEventListener(event, handler);
    } else {
        let elem = <IElementWithAttachEvent>el;
        if (elem.attachEvent) {
            elem.attachEvent('on' + event, handler);
        } else {
            elem[event] = handler;
        }
    }
}

interface IElementWithAttachEvent {
    attachEvent?: (event: string, handler: (ev: UIEvent) => void) => void;
}
export const isFileApi: boolean = !!((<{ File?: Object }>window).File && (<{ FormData?: Object }>window).FormData);

export function castFiles(fileList: File[] | Object, status?: UploadStatus): IUploadFile[] {
    let files: IUploadFile[];

    if (typeof fileList === 'object') {
        files = map(
            filter(keys(fileList), (key) => key !== 'length'),
            (key) => fileList[key]
        );
    } else {
        files = <IUploadFile[]>fileList;
    }

    forEach(files, (file: IUploadFile) => {
        file.uploadStatus = status || file.uploadStatus;
        file.responseCode = file.responseCode || 0;
        file.responseText = file.responseText || '';
        file.progress = file.progress || 0;
        file.sentBytes = file.sentBytes || 0;
        file.cancel = file.cancel || (() => { return; });
    });

    return files;
}

export function filter<T>(input: T[], filterFn: (item: T) => boolean): T[] {
    if (!input)
        return null;
    let result: T[] = [];

    forEach<T>(input, function(item: T) {
        if (filterFn(item))
            result.push(item);
    });

    return result;
}

export function forEach<T>(input: T[], callback: (item: T, index?: number) => void): void {
    if (!input)
        return;
    for (var i = 0; i < input.length; i++) {
        callback(input[i], i);
    }
}

export function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst: boolean = false): () => void {
    if (!origFn)
        return newFn;

    return newFirst
        ? () => { newFn(); origFn(); }
        : () => { origFn(); newFn(); };
}

export function getUploadCore(options: IUploadOptions, callbacks: IUploadCallbacks): UploadCore {
    return new UploadCore(options, callbacks);
};

export function getUploader(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader {
    return new Uploader(options, callbacks);
};

export function newGuid(): string {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        /* tslint:disable */
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        /* tslint:enable */
    });
    return uuid;
};

export interface IFileExt extends File {
    kind: string;
    webkitGetAsEntry: () => File;
    getAsFile: () => File;
    file: (callback: (file: IFileExt) => void) => void;

    isFile: boolean;
    isDirectory: boolean;
    fullPath: string;
}

export function indexOf<T>(input: T[], item: T): number {
    if (!input)
        return -1;

    for (var i = 0; i < input.length; i++) {
        if (input[i] === item)
            return i;
    }

    return -1;
}

export interface IUploadAreaOptions extends IUploadOptions {
    maxFileSize?: number;
    allowDragDrop?: boolean;
    clickable?: boolean;
    accept?: string;
    multiple?: boolean;
    validateExtension?: boolean;
    
    onFileAdded?: (file: IUploadFile) => void;
    onFileError?: (file: IUploadFile) => void;
    onFileCanceled?: (file: IUploadFile) => void;
}

export interface IUploadCallbacks {
    onProgressCallback?: (file: IUploadFile) => void;
    onCancelledCallback?: (file: IUploadFile) => void;
    onFinishedCallback?: (file: IUploadFile) => void;
    onUploadedCallback?: (file: IUploadFile) => void;
    onErrorCallback?: (file: IUploadFile) => void;
    onUploadStartedCallback?: (file: IUploadFile) => void;
}

export interface IUploadCallbacksExt extends IUploadCallbacks {
    onFileStateChangedCallback?: (file: IUploadFile) => void;
}

export interface IUploadFile extends File {
    guid: string;
    url: string;
    uploadStatus: UploadStatus;
    responseCode: number;
    responseText: string;
    progress: number;
    sentBytes: number;

    cancel: () => void;
    remove: () => void;
    start: () => void;
    onError: (file: IUploadFile) => void;
    onCancel: (file: IUploadFile) => void;
}

export interface IUploadOptions {
    url: string | ((file: IUploadFile) => string);
    method: string;
    withCredentials?: boolean;
    headers?: { [key: string]: string | number | boolean };
    params?: { [key: string]: string | number | boolean };
    localizer?: (message: string, params?: Object) => string;
}

export interface IUploadQueueCallbacks extends IUploadCallbacks {
    onFileAddedCallback?: (file: IUploadFile) => void;
    onFileRemovedCallback?: (file: IUploadFile) => void;
    onAllFinishedCallback?: () => void;
    onQueueChangedCallback?: (queue: IUploadFile[]) => void;
}

export interface IUploadQueueCallbacksExt extends IUploadQueueCallbacks, IUploadCallbacksExt {
}

export interface IUploadQueueOptions {
    maxParallelUploads?: number;
    autoStart?: boolean;
    autoRemove?: boolean;
}

export function keys(obj: Object) {
    if (Object && Object.keys)
        return Object.keys(obj);
        
    let keys = [];

    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            keys.push(i);
        }
    }

    return keys;
}

export function map<T, K>(input: T[], mapper: (item: T) => K): K[] {
    if (!input)
        return null;
    let result: K[] = [];

    forEach<T>(input, function(item: T) {
        result.push(mapper(item));
    });

    return result;
}

export function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void) {
    if (el.removeEventListener) {
        el.removeEventListener(event, handler);
    } else {
        let elem = <IElementWithDettachEvent>el;
        if (elem.detachEvent) {
            elem.detachEvent('on' + event, handler);
        } else {
            elem[event] = null;
        }
    }
}

interface IElementWithDettachEvent {
    detachEvent?: (event: string, handler: (ev: UIEvent) => void) => void;
}
export class UploadArea {
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
            file.guid = newGuid();
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
            file.url = this.uploadCore.getUrl(file);
        });

        if (files.length === 0)
            return;

        this.addTargetIframe();

        this.formForNoFileApi.setAttribute('action', files[0].url);
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

export class UploadCore {
    public options: IUploadOptions;
    public callbacks: IUploadCallbacksExt;

    constructor(options: IUploadOptions, callbacks: IUploadCallbacksExt = {}) {
        this.options = options;
        this.callbacks = callbacks;
        this.setFullOptions(options);
        this.setFullCallbacks(callbacks);
    }

    upload(fileList: File[] | Object): void {
        if (!isFileApi)
            return;
        let files = castFiles(fileList, UploadStatus.uploading);
        forEach(files, (file: IUploadFile) => this.processFile(file));
    }

    getUrl(file: IUploadFile): string {
        return typeof this.options.url === 'function'
            ? (<(file: IUploadFile) => string>this.options.url)(file)
            : <string>this.options.url;
    }

    private processFile(file: IUploadFile): void {
        let xhr = this.createRequest(file);
        this.setCallbacks(xhr, file);
        this.send(xhr, file);
    }

    private createRequest(file: IUploadFile): XMLHttpRequest {
        let xhr = new XMLHttpRequest();
        let url = file.url || this.getUrl(file);
        xhr.open(this.options.method, url, true);

        xhr.withCredentials = !!this.options.withCredentials;
        this.setHeaders(xhr, file.name);
        return xhr;
    }

    private setHeaders(xhr: XMLHttpRequest, fileName: string) {
        if (!this.options.headers['Accept'])
            xhr.setRequestHeader('Accept', 'application/json');
        if (!this.options.headers['Cache-Control'])
            xhr.setRequestHeader('Cache-Control', 'no-cache');
        if (!this.options.headers['X-Requested-With'])
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        forEach(keys(this.options.headers), (headerName: string) => {
            let headerValue = this.options.headers[headerName];
            if (headerValue !== undefined && headerValue !== null)
                xhr.setRequestHeader(headerName, (headerValue || '').toString());
        });
    }

    private setCallbacks(xhr: XMLHttpRequest, file: IUploadFile) {
        file.cancel = decorateSimpleFunction(
            file.cancel, () => {
                xhr.abort();
                file.uploadStatus = UploadStatus.canceled;
                if (file.onCancel)
                    file.onCancel(file);

                this.callbacks.onCancelledCallback(file);
                this.callbacks.onFileStateChangedCallback(file);
                this.callbacks.onFinishedCallback(file);
            },
            true);

        xhr.onload = (e) => this.onload(file, xhr);
        xhr.onerror = () => this.handleError(file, xhr);
        xhr.upload.onprogress = (e: ProgressEvent) => this.updateProgress(file, e);
    }

    private send(xhr: XMLHttpRequest, file: IUploadFile) {
        let formData = this.createFormData(file);
        this.callbacks.onUploadStartedCallback(file);
        this.callbacks.onFileStateChangedCallback(file);
        xhr.send(formData);
    }

    private createFormData(file: IUploadFile): FormData {
        let formData = new FormData();
        forEach(keys(this.options.params), (paramName: string) => {
            let paramValue = this.options.params[paramName];
            if (paramValue !== undefined && paramValue !== null)
                formData.append(paramName, paramValue);
        });

        formData.append('file', file, file.name);
        return formData;
    }

    private handleError(file: IUploadFile, xhr: XMLHttpRequest): void {
        file.uploadStatus = UploadStatus.failed;
        this.setResponse(file, xhr);
        if (file.onError) {
            file.onError(file);
        }
        this.callbacks.onErrorCallback(file);
        this.callbacks.onFileStateChangedCallback(file);
        this.callbacks.onFinishedCallback(file);
    }

    private updateProgress(file: IUploadFile, e?: ProgressEvent) {
        if (e !== null) {
            if (e.lengthComputable) {
                file.progress = Math.round(100 * (e.loaded / e.total));
                file.sentBytes = e.loaded;
            } else {
                file.progress = 0;
                file.sentBytes = 0;
            }
        } else {
            file.progress = 100;
            file.sentBytes = file.size;
        }

        this.callbacks.onProgressCallback(file);
    }

    private onload(file: IUploadFile, xhr: XMLHttpRequest) {
        if (xhr.readyState !== 4)
            return;

        if (file.progress !== 100)
            this.updateProgress(file);

        if (xhr.status === 200) {
            this.finished(file, xhr);
        } else {
            this.handleError(file, xhr);
        }
    }

    private finished(file: IUploadFile, xhr: XMLHttpRequest) {
        file.uploadStatus = UploadStatus.uploaded;
        this.setResponse(file, xhr);
        this.callbacks.onUploadedCallback(file);
        this.callbacks.onFileStateChangedCallback(file);
        this.callbacks.onFinishedCallback(file);
    };

    private setResponse(file: IUploadFile, xhr: XMLHttpRequest) {
        file.responseCode = xhr.status;
        let response = xhr.responseText || xhr.statusText || (xhr.status
            ? xhr.status.toString()
            : '' || 'Invalid response from server');
        file.responseText = !!this.options.localizer
            ? this.options.localizer(response, {})
            : response;
    }

    private setFullOptions(options: IUploadOptions): void {
        this.options.url = options.url;
        this.options.method = options.method;
        this.options.headers = options.headers || {};
        this.options.params = options.params || {};
        this.options.withCredentials = options.withCredentials || false;
        this.options.localizer = options.localizer;
    }

    private setFullCallbacks(callbacks: IUploadCallbacksExt) {
        this.callbacks.onProgressCallback = callbacks.onProgressCallback || (() => { return; });
        this.callbacks.onCancelledCallback = callbacks.onCancelledCallback || (() => { return; });
        this.callbacks.onFinishedCallback = callbacks.onFinishedCallback || (() => { return; });
        this.callbacks.onUploadedCallback = callbacks.onUploadedCallback || (() => { return; });
        this.callbacks.onErrorCallback = callbacks.onErrorCallback || (() => { return; });
        this.callbacks.onUploadStartedCallback = callbacks.onUploadStartedCallback || (() => { return; });
        this.callbacks.onFileStateChangedCallback = callbacks.onFileStateChangedCallback || (() => { return; });
    }
}

export class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    options: IUploadQueueOptions;

    constructor(options: IUploadQueueOptions = {}, callbacks: IUploadQueueCallbacks = {}) {
        this.setOptions(options);
        this.uploadAreas = [];
        this.queue = new UploadQueue(options, callbacks);
    }

    setOptions(options: IUploadQueueOptions): void {
        this.options = options;
    }

    registerArea(element: HTMLElement, options: IUploadAreaOptions, compatibilityForm?: Element): UploadArea {
        let uploadArea = new UploadArea(element, options, this, <HTMLFormElement>compatibilityForm);
        this.uploadAreas.push(uploadArea);
        return uploadArea;
    }

    unregisterArea(area: UploadArea): void {
        let areaIndex = indexOf(this.uploadAreas, area);
        if (areaIndex >= 0) {
            this.uploadAreas[areaIndex].destroy();
            this.uploadAreas.splice(areaIndex, 1);
        }
    }
}

export class UploadQueue {
    options: IUploadQueueOptions;
    callbacks: IUploadQueueCallbacksExt;
    queuedFiles: IUploadFile[] = [];

    constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacksExt) {
        this.options = options;
        this.callbacks = callbacks;
        this.setFullOptions();
        this.setFullCallbacks();
    }

    addFiles(files: IUploadFile[]): void {
        forEach(files, file => {
            this.queuedFiles.push(file);

            file.remove = decorateSimpleFunction(file.remove, () => {
                this.removeFile(file);
            });

            this.callbacks.onFileAddedCallback(file);

            if (file.uploadStatus === UploadStatus.failed) {
                if (this.callbacks.onErrorCallback) {
                    this.callbacks.onErrorCallback(file);
                }
            } else {
                file.uploadStatus = UploadStatus.queued;
            }
        });

        this.filesChanged();
    }

    removeFile(file: IUploadFile, blockRecursive: boolean = false) {
        let index = indexOf(this.queuedFiles, file);

        if (index < 0)
            return;

        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);

        this.callbacks.onFileRemovedCallback(file);

        if (!blockRecursive)
            this.filesChanged();
    }

    clearFiles(excludeStatuses: UploadStatus[] = [], cancelProcessing: boolean = false) {
        if (!cancelProcessing)
            excludeStatuses = excludeStatuses.concat([UploadStatus.queued, UploadStatus.uploading]);

        forEach(
            filter(this.queuedFiles, (file: IUploadFile) => indexOf(excludeStatuses, file.uploadStatus) < 0),
            file => this.removeFile(file, true)
        );

        this.callbacks.onQueueChangedCallback(this.queuedFiles);
    }

    private filesChanged(): void {
        if (this.options.autoRemove)
            this.removeFinishedFiles();

        if (this.options.autoStart)
            this.startWaitingFiles();

        this.callbacks.onQueueChangedCallback(this.queuedFiles);

        this.checkAllFinished();
    }

    private checkAllFinished(): void {
        let unfinishedFiles = filter(
            this.queuedFiles,
            file => indexOf([UploadStatus.queued, UploadStatus.uploading], file.uploadStatus) >= 0
        );

        if (unfinishedFiles.length === 0) {
            this.callbacks.onAllFinishedCallback();
        }
    }

    private setFullOptions(): void {
        this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
        this.options.autoStart = isFileApi && (this.options.autoStart || false);
        this.options.autoRemove = this.options.autoRemove || false;

    }

    private setFullCallbacks(): void {
        this.callbacks.onFileAddedCallback = this.callbacks.onFileAddedCallback || (() => { return; });
        this.callbacks.onFileRemovedCallback = this.callbacks.onFileRemovedCallback || (() => { return; });
        this.callbacks.onAllFinishedCallback = this.callbacks.onAllFinishedCallback || (() => { return; });
        this.callbacks.onQueueChangedCallback = this.callbacks.onQueueChangedCallback || (() => { return; });

        this.callbacks.onFileStateChangedCallback = () => this.filesChanged();
    }

    private startWaitingFiles(): void {
        forEach(this.getWaitingFiles(), file => file.start());
    }

    private removeFinishedFiles(): void {
        forEach(
            filter(
                this.queuedFiles,
                file => indexOf(
                    [
                        UploadStatus.uploaded,
                        UploadStatus.canceled
                    ],
                    file.uploadStatus
                ) >= 0
            ),
            file => this.removeFile(file, true)
        );
    }

    private deactivateFile(file: IUploadFile) {
        if (file.uploadStatus === UploadStatus.uploading)
            file.cancel();

        file.uploadStatus = UploadStatus.removed;
        file.cancel = () => { return; };
        file.remove = () => { return; };
        file.start = () => { return; };
    }

    private getWaitingFiles() {
        if (!this.options.autoStart)
            return [];

        let result = filter(
            this.queuedFiles,
            file => file.uploadStatus === UploadStatus.queued
        );

        if (this.options.maxParallelUploads > 0) {
            let uploadingFilesCount = filter(
                this.queuedFiles,
                file => file.uploadStatus === UploadStatus.uploading
            ).length;

            let count = this.options.maxParallelUploads - uploadingFilesCount;

            if (count <= 0) {
                return [];
            }

            result = result.slice(0, count);
        }

        return result;
    }
}

export enum UploadStatus {
    queued,
    uploading,
    uploaded,
    failed,
    canceled,
    removed
}
