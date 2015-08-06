var UploadStatusStatic = (function () {
    function UploadStatusStatic() {
    }
    UploadStatusStatic.queued = 'queued';
    UploadStatusStatic.uploading = 'uploading';
    UploadStatusStatic.uploaded = 'uploaded';
    UploadStatusStatic.failed = 'failed';
    UploadStatusStatic.canceled = 'canceled';
    return UploadStatusStatic;
})();
var uploadStatus = UploadStatusStatic;
var getUploadCore = function (options) {
    return new UploaderCore(options);
};
var UploaderCore = (function () {
    function UploaderCore(options) {
        this.options = options;
        this.options = this.getFullOptions(options);
    }
    UploaderCore.prototype.upload = function (fileList) {
        var _this = this;
        var files = this.castFiles(fileList);
        files.forEach(function (file) { return _this.processFile(file); });
    };
    UploaderCore.prototype.processFile = function (file) {
        var xhr = this.createRequest();
        this.setCallbacks(xhr, file);
        this.send(xhr, file);
    };
    UploaderCore.prototype.castFiles = function (fileList) {
        var files;
        if (typeof fileList === 'object') {
            files = Object.keys(fileList).map(function (key) { return fileList[key]; });
        }
        else {
            files = fileList;
        }
        files.forEach(function (file) {
            file.uploadStatus = uploadStatus.uploading;
            file.responseCode = 0;
            file.responseText = '';
            file.progress = 0;
            file.sentBytes = 0;
            file.cancel = function () { };
        });
        return files;
    };
    UploaderCore.prototype.createRequest = function () {
        var xhr = new XMLHttpRequest();
        xhr.open(this.options.method, this.options.url, true);
        xhr.withCredentials = !!this.options.withCredentials;
        this.setHeaders(xhr);
        return xhr;
    };
    UploaderCore.prototype.setHeaders = function (xhr) {
        var _this = this;
        this.options.headers['Accept'] = this.options.headers['Accept'] || 'application/json';
        this.options.headers['Cache-Control'] = this.options.headers['Cache-Control'] || 'no-cache';
        this.options.headers['X-Requested-With'] = this.options.headers['X-Requested-With'] || 'XMLHttpRequest';
        Object.keys(this.options.headers).forEach(function (headerName) {
            var headerValue = _this.options.headers[headerName];
            if (headerValue != undefined)
                xhr.setRequestHeader(headerName, headerValue);
        });
    };
    UploaderCore.prototype.setCallbacks = function (xhr, file) {
        var _this = this;
        file.cancel = function () {
            xhr.abort();
            file.uploadStatus = uploadStatus.canceled;
            _this.options.onCancelledCallback(file);
            _this.options.onFinishedCallback(file);
        };
        xhr.onload = function (e) { return _this.onload(file, xhr); };
        xhr.onerror = function () { return _this.handleError(file, xhr); };
        xhr.upload.onprogress = function (e) { return _this.updateProgress(file, e); };
    };
    UploaderCore.prototype.send = function (xhr, file) {
        var formData = this.createFormData(file);
        this.options.onUploadStartedCallback(file);
        xhr.send(formData);
    };
    UploaderCore.prototype.createFormData = function (file) {
        var _this = this;
        var formData = new FormData();
        Object.keys(this.options.params).forEach(function (paramName) {
            var paramValue = _this.options.params[paramName];
            if (paramValue != undefined)
                formData.append(paramName, paramValue);
        });
        formData.append('file', file, file.name);
        return formData;
    };
    UploaderCore.prototype.handleError = function (file, xhr) {
        file.uploadStatus = uploadStatus.failed;
        this.setResponse(file, xhr);
        this.options.onErrorCallback(file);
        this.options.onFinishedCallback(file);
    };
    UploaderCore.prototype.updateProgress = function (file, e) {
        if (e != null) {
            file.progress = Math.round(100 * (e.loaded / e.total));
            file.sentBytes = e.loaded;
        }
        else {
            file.progress = 100;
            file.sentBytes = file.size;
        }
        file.uploadStatus = file.progress === 100 ? uploadStatus.uploaded : uploadStatus.uploading;
        this.options.onProgressCallback(file);
    };
    UploaderCore.prototype.onload = function (file, xhr) {
        if (xhr.readyState !== 4)
            return;
        if (file.progress != 100)
            this.updateProgress(file);
        if (xhr.status === 200)
            this.finished(file, xhr);
        else
            this.handleError(file, xhr);
    };
    UploaderCore.prototype.finished = function (file, xhr) {
        file.uploadStatus = uploadStatus.uploaded;
        this.setResponse(file, xhr);
        this.options.onUploadedCallback(file);
        this.options.onFinishedCallback(file);
    };
    ;
    UploaderCore.prototype.setResponse = function (file, xhr) {
        file.responseCode = xhr.status;
        file.responseText = (xhr.statusText || xhr.status ? xhr.status.toString() : '' || 'Invalid response from server');
    };
    UploaderCore.prototype.getFullOptions = function (options) {
        return {
            url: options.url,
            method: options.method,
            headers: options.headers || {},
            params: options.params || {},
            withCredentials: options.withCredentials || false,
            onProgressCallback: options.onProgressCallback || (function () { }),
            onCancelledCallback: options.onCancelledCallback || (function () { }),
            onFinishedCallback: options.onFinishedCallback || (function () { }),
            onUploadedCallback: options.onUploadedCallback || (function () { }),
            onErrorCallback: options.onErrorCallback || (function () { }),
            onUploadStartedCallback: options.onUploadStartedCallback || (function () { })
        };
    };
    return UploaderCore;
})();

var UploadQueue = (function () {
    function UploadQueue(options) {
        this.options = options;
        this.queuedFiles = [];
        this.setFullOptions();
    }
    UploadQueue.prototype.filesChanged = function () {
        if (this.options.autoRemove)
            this.removeFinishedFiles();
        if (this.options.autoStart)
            this.startWaitingFiles();
    };
    UploadQueue.prototype.addFiles = function (files) {
        var _this = this;
        files.forEach(function (file) {
            _this.queuedFiles.push(file);
            file.uploadStatus = uploadStatus.queued;
            file.remove = function () {
                _this.removeFile(file);
                _this.filesChanged();
            };
        });
        this.filesChanged();
    };
    UploadQueue.prototype.removeFile = function (file) {
        var index = this.queuedFiles.indexOf(file);
        if (index < 0)
            return;
        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);
    };
    UploadQueue.prototype.clearFiles = function () {
        var _this = this;
        this.queuedFiles.forEach(function (file) { return _this.deactivateFile(file); });
        this.queuedFiles = [];
    };
    UploadQueue.prototype.setFullOptions = function () {
        this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
        this.options.autoStart = this.options.autoStart || false;
        this.options.autoRemove = this.options.autoRemove || false;
    };
    UploadQueue.prototype.startWaitingFiles = function () {
        var files = this.getWaitingFiles().forEach(function (file) { return file.start(); });
    };
    UploadQueue.prototype.removeFinishedFiles = function () {
        var _this = this;
        this.queuedFiles
            .filter(function (file) { return [uploadStatus.uploaded, uploadStatus.failed, uploadStatus.canceled].indexOf(file.uploadStatus) >= 0; })
            .forEach(function (file) { return _this.removeFile(file); });
    };
    UploadQueue.prototype.deactivateFile = function (file) {
        if (file.uploadStatus == uploadStatus.uploading)
            file.cancel();
        file.cancel = function () { };
        file.remove = function () { };
        file.start = function () { };
    };
    UploadQueue.prototype.getWaitingFiles = function () {
        if (!this.options.autoStart)
            return [];
        var result = this.queuedFiles
            .filter(function (file) { return file.uploadStatus == uploadStatus.queued; });
        if (this.options.maxParallelUploads > 0) {
            var uploadingFilesCount = this.queuedFiles
                .filter(function (file) { return file.uploadStatus == uploadStatus.uploading; })
                .length;
            var count = this.options.maxParallelUploads - uploadingFilesCount;
            if (count <= 0) {
                return [];
            }
            result = result.slice(0, count);
        }
        return result;
    };
    return UploadQueue;
})();

var UploadArea = (function () {
    function UploadArea(element, options, queue) {
        this.targetElement = element;
        this.uploadAreaOptions = options;
        this.queue = queue;
    }
    UploadArea.prototype.init = function () {
        this.uploadCore = getUploadCore(this.uploadAreaOptions);
    };
    UploadArea.prototype.setupListeners = function () {
    };
    UploadArea.prototype.setupHiddenInput = function () {
    };
    return UploadArea;
})();

var Uploader = (function () {
    function Uploader() {
    }
    Uploader.prototype.setOptions = function (options) {
        this.uploaderOptions = options;
    };
    Uploader.prototype.registerArea = function (element, options) {
        var uploadArea = new UploadArea(element, options, this.queue);
        uploadArea.init();
        this.uploadAreas.push(uploadArea);
    };
    Uploader.prototype.unregisterArea = function (area) {
        var areaIndex = this.uploadAreas.indexOf(area);
        if (areaIndex >= 0) {
            this.uploadAreas.splice(areaIndex, 1);
        }
    };
    return Uploader;
})();
