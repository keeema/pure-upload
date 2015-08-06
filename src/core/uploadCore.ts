class UploadStatusStatic   {
    static queued:string = 'queued';
    static uploading:string = 'uploading';
    static uploaded:string = 'uploaded';
    static failed:string = 'failed';
    static canceled:string = 'canceled';

}

var uploadStatus:IUploadStatus = <any>UploadStatusStatic;

var getUploadCore = function (options: IUploadOptions): IUploadCore {
    return new UploaderCore(options);
}

class UploaderCore implements IUploadCore {
    constructor(private options: IUploadOptions) {
        this.options = this.getFullOptions(options);
    }

    upload(fileList: File[]| Object): void {
        var files = this.castFiles(fileList);
        files.forEach((file: IUploadFile) => this.processFile(file));
    }

    private processFile(file: IUploadFile): void {
        var xhr = this.createRequest();
        this.setCallbacks(xhr, file);
        this.send(xhr, file);
    }

    private castFiles(fileList: File[]| Object): File[] {
        let files: IUploadFile[];

        if (typeof fileList === 'object') {
            files = Object.keys(fileList).map((key) => fileList[key]);
        } else {
            files = <IUploadFile[]>fileList;
        }

        files.forEach((file: IUploadFile) => {
            file.uploadStatus = uploadStatus.uploading
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

    private setCallbacks(xhr: XMLHttpRequest, file: IUploadFile) {
        file.cancel = () => {
            xhr.abort();
            file.uploadStatus = uploadStatus.canceled;
            this.options.onCancelledCallback(file);
        }

        xhr.onload = (e) => this.onload(file, xhr)
        xhr.onerror = () => this.handleError(file, xhr);
        xhr.upload.onprogress = (e: ProgressEvent) => this.updateProgress(file, e);
    }

    private send(xhr: XMLHttpRequest, file: IUploadFile) {
        var formData = this.createFormData(file)
        this.options.onUploadStartedCallback(file);
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
        this.options.onErrorCallback(file);
        this.options.onFinishedCallback(file);
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
        this.options.onProgressCallback(file);
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
        this.options.onUploadedCallback(file);
        this.options.onFinishedCallback(file);
    };

    private setResponse(file: IUploadFile, xhr: XMLHttpRequest) {
        file.responseCode = xhr.status;
        file.responseText = (xhr.statusText || xhr.status ? xhr.status.toString() : '' || 'Invalid response from server');
    }

    private getFullOptions(options: IUploadOptions) {
        return <IUploadOptions>{
            url: options.url,
            method: options.method,
            headers: options.headers || {},
            params: options.params || {},
            withCredentials: options.withCredentials || false,
            onProgressCallback: options.onProgressCallback || (() => { }),
            onCancelledCallback: options.onCancelledCallback || (() => { }),
            onFinishedCallback: options.onFinishedCallback || (() => { }),
            onUploadedCallback: options.onUploadedCallback || (() => { }),
            onErrorCallback: options.onErrorCallback || (() => { }),
            onUploadStartedCallback: options.onUploadStartedCallback || (() => { }),
        }
    }
}
