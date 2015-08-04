class XhrUploader {

    constructor(private options: IXhrUploadOptions) {
        this.options = this.getFullOptions(options);
    }

    upload(fileList: File[]| Object): void {
        let files: XhrFile[];
        if (typeof fileList === 'object') {
            files = Object.keys(fileList).map((key) => fileList[key]);

        } else {
            files = <XhrFile[]>fileList;
        }


        files.forEach((file: XhrFile) => this.sendFile(file));

    }

    private sendFile(file: XhrFile): void {
        var xhr = new XMLHttpRequest();
        file.xhr = xhr
        file.uploadStatus = XhrUploadStatus.Queued
        file.cancel = () => file.xhr.abort();

        xhr.onload = (e) => this.onload(file, xhr, e)
        xhr.onerror = () => this.onerror(file);
        //xhr.onprogress = (e: ProgressEvent) => this.updateProgress(file, e);
        xhr.open(this.options.method, this.options.url, true);
        xhr.withCredentials = !!this.options.withCredentials;

        let headers = {
            "Accept": "application/json",
            "Cache-Control": "no-cache",
            "X-Requested-With": "XMLHttpRequest"
        };
        /*if (this.options.headers) {
          extend(headers, this.options.headers);
        }*/
        for (var headerName in headers) {
            var headerValue = headers[headerName];
            xhr.setRequestHeader(headerName, headerValue);
        }

        xhr.upload.addEventListener('progress', (e: ProgressEvent) => this.updateProgress(file, e));

        var formData = new FormData();
        /*if (this.options.params) {
            _ref1 = this.options.params;
            for (key in _ref1) {
                value = _ref1[key];
                formData.append(key, value);
            }
        }*/

        formData.append('file', file, file.name);
        xhr.send(formData);

        // setTimeout(()=>{
        //   var c = xhr;
        // },100);
    }

    private handleError(file: XhrFile): void {
        file.uploadStatus = XhrUploadStatus.Failed
        file.responseStatus = file.xhr.status
    }

    private updateProgress(file: XhrFile, e?: ProgressEvent) {

        if (e != null) {
            var ratio = e.loaded / e.total;
            file.progress = 100 * (ratio);
            file.sentBytes = e.loaded;

        } else {
            file.progress = 100;
            file.sentBytes = file.size;
        }

        file.uploadStatus = file.progress === 100 ? XhrUploadStatus.Uploaded : XhrUploadStatus.Uploading;
        this.options.onProgressCallback(file);
    }

    private onload(file: XhrFile, xhr: XMLHttpRequest, e: Event) {
        if (xhr.readyState !== 4) {
            return;
        }

        /*let response = xhr.responseText;
        if (xhr.getResponseHeader("content-type") && xhr.getResponseHeader("content-type").indexOf("application/json")) {
            try {
                response = JSON.parse(response);
            } catch (_error) {
                e = _error;
                response = "Invalid JSON response from server.";
            }
        }*/
        this.updateProgress(file);
        if (xhr.status === 200)
            this.finished(file, e);
        else
            this.handleError(file);
    }

    private finished(file: XhrFile, e: Event) {
        file.uploadStatus = XhrUploadStatus.Uploaded
        file.responseStatus = file.xhr.status
    };

    onerror(file: XhrFile) {
        /*if (files[0].status === Dropzone.CANCELED) {
          return;
        }*/
        this.handleError(file);
    };


    private getFullOptions(options: IXhrUploadOptions) {
        return <IXhrUploadOptions>{
            url: options.url,
            method: options.method,
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
