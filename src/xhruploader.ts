class XhrUploader {
    constructor(private options: IXhrUploadOptions) {
        this.options = this.getFullOptions(options);
    }

    upload(fileList: File[]| Object): void {
        var files = this.castFiles(fileList);
        files.forEach((file: XhrFile) => this.processFile(file));
    }

    private processFile(file: XhrFile): void {
        var xhr = this.createRequest();
        this.setCallbacks(xhr, file);
        this.send(xhr, file);
    }

    private castFiles(fileList: File[]| Object): File[] {
        let files: XhrFile[];

        if (typeof fileList === 'object') {
            files = Object.keys(fileList).map((key) => fileList[key]);
        } else {
            files = <XhrFile[]>fileList;
        }

        files.forEach((file: XhrFile) => {
            file.uploadStatus = XhrUploadStatus.Uploading
            file.responseCode = 0;
            file.responseText = '';
            file.progress = 0;
            file.sentBytes = 0;
            file.cancel = () => { };
        });

        return files;
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

    private setCallbacks(xhr: XMLHttpRequest, file: XhrFile) {
        file.cancel = () => {
            xhr.abort();
            file.uploadStatus = XhrUploadStatus.Canceled;
            this.options.onCancelledCallback(file);
        }

        xhr.onload = (e) => this.onload(file, xhr)
        xhr.onerror = () => this.handleError(file, xhr);
        xhr.upload.onprogress = (e: ProgressEvent) => this.updateProgress(file, e);
    }

    private send(xhr: XMLHttpRequest, file: XhrFile) {
        var formData = this.createFormData(file)
        this.options.onUploadStartedCallback(file);
        xhr.send(formData);
    }

    private createFormData(file: XhrFile): FormData {
        var formData = new FormData();
        Object.keys(this.options.params).forEach((paramName: string) => {
            var paramValue = this.options.params[paramName];
            if (paramValue != undefined)
                formData.append(paramName, paramValue);
        })

        formData.append('file', file, file.name);
        return formData;
    }

    private handleError(file: XhrFile, xhr: XMLHttpRequest): void {
        file.uploadStatus = XhrUploadStatus.Failed
        file.responseText = xhr.statusText;
        file.responseCode = xhr.status

        this.options.onErrorCallback(file);
        this.options.onFinishedCallback(file);
    }

    private updateProgress(file: XhrFile, e?: ProgressEvent) {
        if (e != null) {
            file.progress = 100 * (e.loaded / e.total);
            file.sentBytes = e.loaded;

        } else {
            file.progress = 100;
            file.sentBytes = file.size;
        }

        file.uploadStatus = file.progress === 100 ? XhrUploadStatus.Uploaded : XhrUploadStatus.Uploading;
        this.options.onProgressCallback(file);
    }

    private onload(file: XhrFile, xhr: XMLHttpRequest) {
        if (xhr.readyState !== 4)
            return;

        if (file.progress != 100)
            this.updateProgress(file);

        if (xhr.status === 200)
            this.finished(file, xhr);
        else
            this.handleError(file, xhr);
    }

    private finished(file: XhrFile, xhr: XMLHttpRequest) {
        file.uploadStatus = XhrUploadStatus.Uploaded;
        file.responseText = xhr.statusText;
        file.responseCode = xhr.status

        this.options.onUploadedCallback(file);
        this.options.onFinishedCallback(file);
    };


    private getFullOptions(options: IXhrUploadOptions) {
        return <IXhrUploadOptions>{
            url: options.url,
            method: options.method,
            headers: options.headers || {},
            params: options.params || {},
            withCredentials: options.withCredentials || false,
            parallelUploads: options.parallelUploads || 2,
            uploadMultiple: options.uploadMultiple || false,
            maxFileSize: options.maxFileSize || 104857600, // 100 MB
            maxFiles: options.maxFiles || 10,
            acceptedFiles: options.acceptedFiles || '',
            acceptedMimeTypes: options.acceptedMimeTypes || '',
            autoProcessQueue: options.autoProcessQueue || false,

            onProgressCallback: options.onProgressCallback || (() => { }),
            onCancelledCallback: options.onCancelledCallback || (() => { }),
            onFinishedCallback: options.onFinishedCallback || (() => { }),
            onUploadedCallback: options.onUploadedCallback || (() => { }),
            onErrorCallback: options.onErrorCallback || (() => { }),
            onUploadStartedCallback: options.onUploadStartedCallback || (() => { }),
        }
    }
}
