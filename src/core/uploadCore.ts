//internal interface
interface IUploadCallbacksExt extends IUploadCallbacks {
    onFileStateChangedCallback?: (file: IUploadFile) => void;
}

var getUploadCore = function(options: IUploadOptions, callbacks: IUploadCallbacks): IUploadCore {
    return new UploaderCore(options, callbacks);
}

class UploaderCore implements IUploadCore {
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
        xhr.send(formData);
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
