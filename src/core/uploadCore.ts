class UploadCore {
    private options: IFullUploadOptions;
    private callbacks: IUploadCallbacksExt;

    constructor(options: IUploadOptions, callbacks: IUploadCallbacksExt = {}) {
        this.callbacks = callbacks;
        this.options = applyDefaults(options, this.getDefaultOptions());
        this.setFullCallbacks(callbacks);
    }

    upload(fileList: File[] | Object): void {
        if (!isFileApi)
            return;
        let files = castFiles(fileList, UploadStatus.uploading);
        files.forEach((file: IUploadFile) => this.processFile(file));
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
        this.setHeaders(xhr);
        return xhr;
    }

    private setHeaders(xhr: XMLHttpRequest) {
        if (!this.options.headers)
            return;

        if (!this.options.headers['Accept'])
            xhr.setRequestHeader('Accept', 'application/json');
        if (!this.options.headers['Cache-Control'])
            xhr.setRequestHeader('Cache-Control', 'no-cache');
        if (!this.options.headers['X-Requested-With'])
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        Object.keys(this.options.headers).forEach((headerName: string) => {
            if (!this.options.headers)
                return;
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
                if (this.callbacks.onCancelledCallback)
                    this.callbacks.onCancelledCallback(file);

                if (this.callbacks.onFileStateChangedCallback)
                    this.callbacks.onFileStateChangedCallback(file);

                if (this.callbacks.onFinishedCallback)
                    this.callbacks.onFinishedCallback(file);
            },
            true);

        xhr.onload = () => this.onload(file, xhr);
        xhr.onerror = () => this.handleError(file, xhr);
        xhr.upload.onprogress = (e: ProgressEvent) => this.updateProgress(file, e);
    }

    private send(xhr: XMLHttpRequest, file: IUploadFile) {
        let formData = this.createFormData(file);
        if (this.callbacks.onUploadStartedCallback)
            this.callbacks.onUploadStartedCallback(file);

        if (this.callbacks.onFileStateChangedCallback)
            this.callbacks.onFileStateChangedCallback(file);
        xhr.send(formData);
    }

    private createFormData(file: IUploadFile): FormData {
        let formData = new FormData();
        if (this.options.params) {
            Object.keys(this.options.params).forEach((paramName: string) => {
                if (!this.options.params)
                    return;
                let paramValue = this.options.params[paramName];
                if (paramValue !== undefined && paramValue !== null)
                    formData.append(paramName, paramValue);
            });
        }

        formData.append('file', file, file.name);
        return formData;
    }

    private handleError(file: IUploadFile, xhr: XMLHttpRequest): void {
        file.uploadStatus = UploadStatus.failed;
        this.setResponse(file, xhr);
        if (file.onError) {
            file.onError(file);
        }

        if (this.callbacks.onErrorCallback)
            this.callbacks.onErrorCallback(file);
        if (this.callbacks.onFileStateChangedCallback)
            this.callbacks.onFileStateChangedCallback(file);
        if (this.callbacks.onFinishedCallback)
            this.callbacks.onFinishedCallback(file);
    }

    private updateProgress(file: IUploadFile, e?: ProgressEvent) {
        if (e) {
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

        if (this.callbacks.onProgressCallback)
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

        if (this.callbacks.onUploadedCallback)
            this.callbacks.onUploadedCallback(file);
        if (this.callbacks.onFileStateChangedCallback)
            this.callbacks.onFileStateChangedCallback(file);
        if (this.callbacks.onFinishedCallback)
            this.callbacks.onFinishedCallback(file);
    };

    private setResponse(file: IUploadFile, xhr: XMLHttpRequest) {
        file.responseCode = xhr.status;
        file.responseText = xhr.responseText || xhr.statusText || (xhr.status
            ? xhr.status.toString()
            : '' || this.options.localizer.invalidResponseFromServer());
    }

    private getDefaultOptions() {
        return {
            headers: {},
            params: {},
            withCredentials: false,
            localizer: getDefaultLocalizer()
        };
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
