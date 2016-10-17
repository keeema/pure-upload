class UploadCore {
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
