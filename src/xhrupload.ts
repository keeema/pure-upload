export class XhrUploader {
    upload(files: File[], options: IXhrUploadOptions, element: Element): void {
        var xhr = new XMLHttpRequest();
        options = this.getFullOptions(options);

        files.forEach((file: XhrFile) => {
            file.xhr = xhr
            file.uploadStatus = XhrUploadStatus.Queued
        });

        xhr.onload = (e) => this.onload(<XhrFile[]>files, xhr, e)
        xhr.onerror = () => this.onerror(<XhrFile[]>files);
        xhr.onprogress = (e: ProgressEvent) => this.updateProgress(<XhrFile[]>files, e);

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

        var formData = new FormData();
        /*if (this.options.params) {
            _ref1 = this.options.params;
            for (key in _ref1) {
                value = _ref1[key];
                formData.append(key, value);
            }
        }*/

        files.forEach((file: XhrFile, index: number) => {
            formData.append('file[' + index + ']', file, file.name);
        })

        xhr.open(options.method, options.url, true);
        xhr.withCredentials = !!options.withCredentials;
        xhr.send(formData);
    }

    private handleError(files: XhrFile[]): void {
        files.forEach((file: XhrFile) => {
            file.uploadStatus = XhrUploadStatus.Failed
            file.responseStatus = file.xhr.status
        });
    }

    private updateProgress(files: XhrFile[], e?: ProgressEvent) {
        if (e != null) {
            let progress = 100 * e.loaded / e.total;
            files.forEach((file: XhrFile) => {
                file.progress = progress;
                file.total = e.total;
                file.sentBytes = e.loaded;
            })
        } else {
            let progress = 100;

            files.forEach((file: XhrFile) => {
                file.progress = progress;
                file.sentBytes = file.total;
            });
        }

        files.forEach((file: XhrFile) => {
            file.uploadStatus = file.progress === file.total ? XhrUploadStatus.Uploaded : XhrUploadStatus.Uploading;
        });
    }

    private onload(files: XhrFile[], xhr: XMLHttpRequest, e: Event) {
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
        this.updateProgress(files);
        if (xhr.status === 200)
            this.finished(files, e);
        else
            this.handleError(files);
    }

    private finished(files: XhrFile[], e: Event) {
        files.forEach((file: XhrFile) => {
            file.uploadStatus = XhrUploadStatus.Uploaded
            file.responseStatus = file.xhr.status
        });
    };

    onerror(files: XhrFile[]) {
        /*if (files[0].status === Dropzone.CANCELED) {
          return;
        }*/
        this.handleError(files);
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
            autoProcessQueue: options.autoProcessQueue || false
        }
    }
}
