export function castFiles(fileList: File[]| Object, status?:IUploadStatus): IUploadFile[] {
    let files: IUploadFile[];

    if (typeof fileList === 'object') {
        files = Object.keys(fileList).map((key) => fileList[key]);
    } else {
        files = <IUploadFile[]>fileList;
    }

    files.forEach((file: IUploadFile) => {
      file.uploadStatus = status || file.uploadStatus;
      file.responseCode = file.responseCode || 0;
      file.responseText = file.responseText || '';
      file.progress = file.progress || 0;
      file.sentBytes = file.sentBytes || 0;
      file.cancel = file.cancel || (() => { });
    });

    return files;
}

export function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst: boolean = false): () => void {
    if (!origFn)
        return newFn;

    return newFirst
        ? () => { newFn(); origFn(); }
        : () => { origFn(); newFn(); }
}

export var getUploadCore = function(options: IUploadOptions, callbacks: IUploadCallbacks): UploadCore {
    return new UploadCore(options, callbacks);
}

export var getUploader = function (options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader {
    return new Uploader(options, callbacks);
}

export function newGuid() : string {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

export interface IUploadAreaOptions extends IUploadOptions {
  maxFileSize: number;
  allowDragDrop: boolean;
  clickable: boolean;
  accept: string;
  multiple: boolean;
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
    uploadStatus: IUploadStatus;
    responseCode: number;
    responseText: string;
    progress: number;
    sentBytes: number;

    cancel: () => void;
    remove: () => void;
    start: () => void;
}

export interface IUploadOptions {
    url: string;
    method: string;
    withCredentials?: boolean;
    headers?: {[key:string]:any}
    params?: {[key:string]:any}
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

export interface IUploadStatus {
    queued: IUploadStatus,
    uploading: IUploadStatus,
    uploaded: IUploadStatus,
    failed: IUploadStatus,
    canceled: IUploadStatus,
    removed: IUploadStatus;
}

export class UploadArea {
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

export class UploadCore {
    constructor(public options: IUploadOptions, public callbacks: IUploadCallbacksExt) {
        this.setFullOptions(options);
        this.setFullCallbacks(callbacks);
    }

    upload(fileList: File[]| Object): void {
        var files = castFiles(fileList, uploadStatus.uploading);
        files.forEach((file: IUploadFile) => this.processFile(file));
    }

    private processFile(file: IUploadFile): void {
        var xhr = this.createRequest();
        this.setCallbacks(xhr, file);
        this.send(xhr, file);
    }

    private createRequest(): XMLHttpRequest {
        var xhr = new XMLHttpRequest();
        xhr.open(this.options.method, this.options.url, true);
        xhr.withCredentials = !!this.options.withCredentials;
        this.setHeaders(xhr);
        return xhr;
    }

    private setHeaders(xhr: XMLHttpRequest) {
        this.options.headers['Accept'] = this.options.headers['Accept'] || 'application/json';
        this.options.headers['Cache-Control'] = this.options.headers['Cache-Control'] || 'no-cache';
        this.options.headers['X-Requested-With'] = this.options.headers['X-Requested-With'] || 'XMLHttpRequest';

        Object.keys(this.options.headers).forEach((headerName: string) => {
            var headerValue = this.options.headers[headerName];
            if (headerValue != undefined)
                xhr.setRequestHeader(headerName, headerValue);
        })
    }

    private setCallbacks(xhr: XMLHttpRequest, file: IUploadFile) {
        var originalCancelFn = file.cancel;
        file.cancel = decorateSimpleFunction(file.cancel, () => {
            xhr.abort();
            file.uploadStatus = uploadStatus.canceled;
            this.callbacks.onCancelledCallback(file);
            this.callbacks.onFileStateChangedCallback(file);
            this.callbacks.onFinishedCallback(file);
        }, true);

        xhr.onload = (e) => this.onload(file, xhr)
        xhr.onerror = () => this.handleError(file, xhr);
        xhr.upload.onprogress = (e: ProgressEvent) => this.updateProgress(file, e);
    }

    private send(xhr: XMLHttpRequest, file: IUploadFile) {
        var formData = this.createFormData(file)
        this.callbacks.onUploadStartedCallback(file);
        this.callbacks.onFileStateChangedCallback(file);
        xhr.send(<any>formData);
    }

    private createFormData(file: IUploadFile): FormData {
        var formData = new FormData();
        Object.keys(this.options.params).forEach((paramName: string) => {
            var paramValue = this.options.params[paramName];
            if (paramValue != undefined)
                formData.append(paramName, paramValue);
        })

        formData.append('file', file, file.name);
        return formData;
    }

    private handleError(file: IUploadFile, xhr: XMLHttpRequest): void {
        file.uploadStatus = uploadStatus.failed;
        this.setResponse(file, xhr);
        this.callbacks.onErrorCallback(file);
        this.callbacks.onFileStateChangedCallback(file);
        this.callbacks.onFinishedCallback(file);
    }

    private updateProgress(file: IUploadFile, e?: ProgressEvent) {
        if (e != null) {
            file.progress = Math.round(100 * (e.loaded / e.total));
            file.sentBytes = e.loaded;

        } else {
            file.progress = 100;
            file.sentBytes = file.size;
        }

        file.uploadStatus = file.progress === 100 ? uploadStatus.uploaded : uploadStatus.uploading;
        this.callbacks.onProgressCallback(file);
    }

    private onload(file: IUploadFile, xhr: XMLHttpRequest) {
        if (xhr.readyState !== 4)
            return;

        if (file.progress != 100)
            this.updateProgress(file);

        if (xhr.status === 200)
            this.finished(file, xhr);
        else
            this.handleError(file, xhr);
    }

    private finished(file: IUploadFile, xhr: XMLHttpRequest) {
        file.uploadStatus = uploadStatus.uploaded;
        this.setResponse(file, xhr);
        this.callbacks.onUploadedCallback(file);
        this.callbacks.onFileStateChangedCallback(file);
        this.callbacks.onFinishedCallback(file);
    };

    private setResponse(file: IUploadFile, xhr: XMLHttpRequest) {
        file.responseCode = xhr.status;
        file.responseText = (xhr.statusText || xhr.status ? xhr.status.toString() : '' || 'Invalid response from server');
    }

    private setFullOptions(options: IUploadOptions): void {

        this.options.url = options.url,
        this.options.method = options.method,
        this.options.headers = options.headers || {},
        this.options.params = options.params || {},
        this.options.withCredentials = options.withCredentials || false
    }

    private setFullCallbacks(callbacks: IUploadCallbacksExt) {
        this.callbacks.onProgressCallback = callbacks.onProgressCallback || (() => { }),
        this.callbacks.onCancelledCallback = callbacks.onCancelledCallback || (() => { }),
        this.callbacks.onFinishedCallback = callbacks.onFinishedCallback || (() => { }),
        this.callbacks.onUploadedCallback = callbacks.onUploadedCallback || (() => { }),
        this.callbacks.onErrorCallback = callbacks.onErrorCallback || (() => { }),
        this.callbacks.onUploadStartedCallback = callbacks.onUploadStartedCallback || (() => { })
        this.callbacks.onFileStateChangedCallback = callbacks.onFileStateChangedCallback || (() => { })
    }
}

export class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    uploaderOptions: IUploadQueueOptions;

    constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks) {
        this.setOptions(options);
        this.uploadAreas = [];
        this.queue = new UploadQueue(options,callbacks);
    }

    setOptions(options: IUploadQueueOptions) : void {
        this.uploaderOptions = options;
    }

    registerArea(element: Element, options: IUploadAreaOptions) : void {
        var uploadArea = new UploadArea(element, options, this);
        this.uploadAreas.push(uploadArea);
    }

    unregisterArea(area: UploadArea) : void {
        var areaIndex = this.uploadAreas.indexOf(area)
        if (areaIndex >= 0) {
          this.uploadAreas[areaIndex].destroy();
          this.uploadAreas.splice(areaIndex, 1);
        }
    }
}

export class UploadQueue {
    queuedFiles: IUploadFile[] = [];

    constructor(public options: IUploadQueueOptions, public callbacks: IUploadQueueCallbacksExt) {
        this.setFullOptions();
        this.setFullCallbacks();
    }

    addFiles(files: IUploadFile[]): void {
        files.forEach(file => {
            this.queuedFiles.push(file);
            file.guid = newGuid();
            file.uploadStatus = uploadStatus.queued;

            file.remove = decorateSimpleFunction(file.remove, () => {
                this.removeFile(file);
            });

            this.callbacks.onFileAddedCallback(file);
        });

        this.filesChanged()
    }

    removeFile(file: IUploadFile, blockRecursive: boolean = false) {
        var index = this.queuedFiles.indexOf(file);

        if (index < 0)
            return;

        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);

        this.callbacks.onFileRemovedCallback(file);

        if (!blockRecursive)
            this.filesChanged();
    }

    clearFiles() {
        this.queuedFiles.forEach(file => this.deactivateFile(file));
        this.queuedFiles = [];
    }

    private filesChanged(): void {
        this.callbacks.onQueueChangedCallback(this.queuedFiles);

        if (this.options.autoRemove)
            this.removeFinishedFiles();

        if (this.options.autoStart)
            this.startWaitingFiles();

        this.checkAllFinished();
    }

    private checkAllFinished(): void {
        var unfinishedFiles = this.queuedFiles
            .filter(file=> [uploadStatus.queued, uploadStatus.uploading]
                .indexOf(file.uploadStatus) >= 0)

        if (unfinishedFiles.length == 0) {
            this.callbacks.onAllFinishedCallback();
        }
    }

    private setFullOptions(): void {
        this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
        this.options.autoStart = this.options.autoStart || false;
        this.options.autoRemove = this.options.autoRemove || false;

    }

    private setFullCallbacks(): void {
        this.callbacks.onFileAddedCallback = this.callbacks.onFileAddedCallback || (() => { });
        this.callbacks.onFileRemovedCallback = this.callbacks.onFileRemovedCallback || (() => { });
        this.callbacks.onAllFinishedCallback = this.callbacks.onAllFinishedCallback || (() => { });
        this.callbacks.onQueueChangedCallback = this.callbacks.onQueueChangedCallback || (() => { });

        this.callbacks.onFileStateChangedCallback = () => this.filesChanged();
    }

    private startWaitingFiles(): void {
        var files = this.getWaitingFiles().forEach(file=> file.start())
    }

    private removeFinishedFiles(): void {
        this.queuedFiles
            .filter(file=> [
                uploadStatus.uploaded,
                uploadStatus.failed,
                uploadStatus.canceled
            ].indexOf(file.uploadStatus) >= 0)
            .forEach(file => this.removeFile(file, true));
    }

    private deactivateFile(file: IUploadFile) {
        if (file.uploadStatus == uploadStatus.uploading)
            file.cancel();

        file.uploadStatus = uploadStatus.removed;
        file.cancel = () => { };
        file.remove = () => { };
        file.start = () => { };
    }

    private getWaitingFiles() {
        if (!this.options.autoStart)
            return [];

        var result = this.queuedFiles
            .filter(file=> file.uploadStatus == uploadStatus.queued)

        if (this.options.maxParallelUploads > 0) {
            var uploadingFilesCount = this.queuedFiles
                .filter(file=> file.uploadStatus == uploadStatus.uploading)
                .length;

            var count = this.options.maxParallelUploads - uploadingFilesCount;

            if (count <= 0) {
                return [];
            }

            result = result.slice(0, count);
        }

        return result;
    }
}

export class UploadStatusStatic {
    static queued: string = 'queued';
    static uploading: string = 'uploading';
    static uploaded: string = 'uploaded';
    static failed: string = 'failed';
    static canceled: string = 'canceled';
    static removed: string = 'removed';
}

export var uploadStatus: IUploadStatus = <any>UploadStatusStatic;
