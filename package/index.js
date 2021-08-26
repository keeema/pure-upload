"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadStatus = exports.UploadQueue = exports.Uploader = exports.UploadCore = exports.UploadArea = exports.removeEventHandler = exports.ItemProcessor = exports.newGuid = exports.getValueOrResult = exports.getUploader = exports.getUploadCore = exports.decorateSimpleFunction = exports.castFiles = exports.isFileApi = exports.ErrorCode = exports.addEventHandler = void 0;
function addEventHandler(el, event, handler, useCapture) {
    if (el.addEventListener) {
        el.addEventListener(event, handler, useCapture);
    }
    else {
        var elem = el;
        if (elem.attachEvent) {
            elem.attachEvent("on" + event, handler);
        }
        else {
            elem[event] = handler;
        }
    }
}
exports.addEventHandler = addEventHandler;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["NoError"] = 0] = "NoError";
    ErrorCode[ErrorCode["FileSizeExceeded"] = 1] = "FileSizeExceeded";
    ErrorCode[ErrorCode["UnsupportedFileFormat"] = 2] = "UnsupportedFileFormat";
    ErrorCode[ErrorCode["XhrResponseError"] = 3] = "XhrResponseError";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
exports.isFileApi = !!(window.File && window.FormData);
function castFiles(fileList, status) {
    var files;
    if (typeof fileList === "object") {
        files = Object.keys(fileList)
            .filter(function (key) { return key !== "length"; })
            .map(function (key) { return fileList[key]; });
    }
    else {
        files = fileList;
    }
    files.forEach(function (file) {
        file.uploadStatus = status || file.uploadStatus;
        file.responseCode = file.responseCode || 0;
        file.responseText = file.responseText || "";
        file.errorCode = file.errorCode;
        file.progress = file.progress || 0;
        file.sentBytes = file.sentBytes || 0;
        file.cancel =
            file.cancel ||
                (function () {
                    return;
                });
    });
    return files;
}
exports.castFiles = castFiles;
function decorateSimpleFunction(origFn, newFn, newFirst) {
    if (newFirst === void 0) { newFirst = false; }
    if (!origFn)
        return newFn;
    return newFirst
        ? function () {
            newFn();
            origFn();
        }
        : function () {
            origFn();
            newFn();
        };
}
exports.decorateSimpleFunction = decorateSimpleFunction;
function applyDefaults(target, source) {
    var to = Object(target);
    for (var nextKey in source) {
        if (Object.prototype.hasOwnProperty.call(source, nextKey) &&
            (to[nextKey] === undefined || to[nextKey] === null)) {
            to[nextKey] = source[nextKey];
        }
    }
    return to;
}
function getUploadCore(options, callbacks) {
    return new UploadCore(options, callbacks);
}
exports.getUploadCore = getUploadCore;
function getUploader(options, callbacks) {
    return new Uploader(options, callbacks);
}
exports.getUploader = getUploader;
function getValueOrResult(valueOrGetter) {
    if (isGetter(valueOrGetter))
        return valueOrGetter();
    return valueOrGetter;
}
exports.getValueOrResult = getValueOrResult;
function isGetter(valueOrGetter) {
    return typeof valueOrGetter === "function";
}
function newGuid() {
    var d = new Date().getTime();
    /* cSpell:disable*/
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        /* cSpell:enable*/
        /* tslint:disable */
        var r = ((d + Math.random() * 16) % 16) | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        /* tslint:enable */
    });
    return uuid;
}
exports.newGuid = newGuid;
function getDefaultLocalizer() {
    return {
        fileSizeInvalid: function (maxFileSize) {
            return "The selected file exceeds the allowed size of " + maxFileSize + " or its size is 0 MB. Please choose another file.";
        },
        fileTypeInvalid: function (accept) { return "File format is not allowed. Only " + (accept ? accept : "") + " files are allowed."; },
        fileTypeMissing: function () { return "File without format is not allowed."; },
        invalidResponseFromServer: function () { return "Invalid response from server"; },
    };
}
var ItemProcessor = /** @class */ (function () {
    function ItemProcessor() {
        this.errors = [];
        this.files = [];
    }
    ItemProcessor.processItems = function (items, callback) {
        var processor = new ItemProcessor();
        processor.processItems(items, function () { return callback && callback(processor.files); });
    };
    ItemProcessor.prototype.processItems = function (items, callback) {
        var _this = this;
        callback = this.callbackAfter(items.length, callback);
        this.toValidItems(items).forEach(function (item) { return _this.processEntry(item.webkitGetAsEntry(), "", callback); });
    };
    ItemProcessor.prototype.processEntries = function (entries, path, callback) {
        var _this = this;
        if (path === void 0) { path = ""; }
        callback = this.callbackAfter(entries.length, callback);
        entries.forEach(function (entry) { return _this.processEntry(entry, path, callback); });
    };
    ItemProcessor.prototype.processEntry = function (entry, path, callback) {
        if (path === void 0) { path = ""; }
        if (this.isFileSystemDirectoryEntry(entry))
            this.processDirectoryEntry(entry, path, callback);
        else if (this.isFileSystemFileEntry(entry))
            this.processFileEntry(entry, path, callback);
        else if (callback !== undefined)
            callback(); // this.errors.push(new Error('...'))?
    };
    ItemProcessor.prototype.processDirectoryEntry = function (entry, path, callback) {
        var _this = this;
        if (path === void 0) { path = ""; }
        entry
            .createReader()
            .readEntries(function (entries) { return _this.processEntries(entries, path + "/" + entry.name, callback); }, this.pushAndCallback(this.errors, callback));
    };
    ItemProcessor.prototype.processFileEntry = function (entry, path, callback) {
        var _this = this;
        if (path === void 0) { path = ""; }
        entry.file(function (file) { return _this.processFile(file, path, callback); }, this.pushAndCallback(this.errors, callback));
    };
    ItemProcessor.prototype.processFile = function (file, path, callback) {
        if (path === void 0) { path = ""; }
        file.fullPath = path + "/" + file.name;
        this.pushAndCallback(this.files, callback)(file);
    };
    ItemProcessor.prototype.callbackAfter = function (i, callback) {
        return function () { return (--i === 0 && callback !== undefined ? callback() : i); };
    };
    ItemProcessor.prototype.pushAndCallback = function (array, callback) {
        return function (item) {
            array.push(item);
            if (callback !== undefined)
                callback();
        };
    };
    ItemProcessor.prototype.toValidItems = function (items) {
        var validItems = [];
        for (var i = 0; i < items.length; ++i) {
            if (items[i].webkitGetAsEntry !== undefined && items[i].webkitGetAsEntry !== null) {
                validItems.push(items[i]);
            }
        }
        return validItems;
    };
    ItemProcessor.prototype.isFileSystemFileEntry = function (entry) {
        return entry.isFile;
    };
    ItemProcessor.prototype.isFileSystemDirectoryEntry = function (entry) {
        return entry.isDirectory;
    };
    return ItemProcessor;
}());
exports.ItemProcessor = ItemProcessor;
function removeEventHandler(el, event, handler) {
    if (el.removeEventListener) {
        el.removeEventListener(event, handler);
    }
    else {
        var elem = el;
        if (elem.detachEvent) {
            elem.detachEvent("on" + event, handler);
        }
        else {
            elem[event] = null;
        }
    }
}
exports.removeEventHandler = removeEventHandler;
var UploadArea = /** @class */ (function () {
    function UploadArea(targetElement, options, uploader) {
        this.targetElement = targetElement;
        this.options = applyDefaults(options, this.defaultOptions());
        this.uploader = uploader;
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        if (exports.isFileApi) {
            this.setupFileApiElements();
        }
        else {
            throw "Only browsers with FileAPI supported.";
        }
    }
    UploadArea.prototype.start = function (autoClear, files) {
        if (autoClear === void 0) { autoClear = false; }
        if (this.options.manualStart && (files || this.fileList)) {
            this.putFilesToQueue(files);
            if (autoClear)
                this.clear(files);
        }
    };
    UploadArea.prototype.clear = function (files) {
        this.fileList = this.fileList && files ? this.fileList.filter(function (file) { return files.indexOf(file) < 0; }) : null;
    };
    UploadArea.prototype.destroy = function () {
        if (this.unregisterOnClick)
            this.unregisterOnClick();
        if (this.unregisterOnDrop)
            this.unregisterOnDrop();
        if (this.unregisterOnDropGlobal)
            this.unregisterOnDropGlobal();
        if (this.unregisterOnChange)
            this.unregisterOnChange();
        if (this.unregisterOnDragEnter)
            this.unregisterOnDragEnter();
        if (this.unregisterOnDragOver)
            this.unregisterOnDragOver();
        if (this.unregisterOnDragLeave)
            this.unregisterOnDragLeave();
        if (this.unregisterOnDragEnterGlobal)
            this.unregisterOnDragEnterGlobal();
        if (this.unregisterOnDragOverGlobal)
            this.unregisterOnDragOverGlobal();
        if (this.unregisterOnDragLeaveGlobal)
            this.unregisterOnDragLeaveGlobal();
        if (this._fileInput)
            document.body.removeChild(this._fileInput);
    };
    Object.defineProperty(UploadArea.prototype, "fileInput", {
        get: function () {
            return this._fileInput;
        },
        enumerable: false,
        configurable: true
    });
    UploadArea.prototype.defaultOptions = function () {
        return {
            localizer: getDefaultLocalizer(),
            maxFileSize: 1024,
            allowDragDrop: true,
            clickable: true,
            accept: "*.*",
            validateExtension: false,
            validateMissingExtension: false,
            multiple: true,
            allowEmptyFile: false,
            useCapture: false,
        };
    };
    UploadArea.prototype.selectFiles = function (fileList) {
        var _this = this;
        this.fileList = castFiles(fileList);
        if (this.options.onFileSelected)
            this.fileList.forEach(function (file) {
                if (_this.options.onFileSelected)
                    _this.options.onFileSelected(file);
            });
        if (this.options.onFilesSelected) {
            var files_1 = [];
            this.fileList.forEach(function (file) {
                files_1.push(file);
            });
            this.options.onFilesSelected(files_1);
        }
        if (!this.options.manualStart)
            this.putFilesToQueue();
    };
    UploadArea.prototype.putFilesToQueue = function (files) {
        var _this = this;
        files = this.fileList && files ? this.fileList.filter(function (file) { return files && files.indexOf(file) >= 0; }) : this.fileList || undefined;
        if (!files)
            return;
        files.forEach(function (file) {
            file.guid = newGuid();
            delete file.uploadStatus;
            file.url = _this.uploadCore.getUrl(file);
            file.onError =
                _this.options.onFileError ||
                    (function () {
                        return;
                    });
            file.onCancel =
                _this.options.onFileCanceled ||
                    (function () {
                        return;
                    });
            if (_this.validateFile(file)) {
                file.start = function () {
                    _this.uploadCore.upload([file]);
                    if (_this.options.onFileAdded) {
                        _this.options.onFileAdded(file);
                    }
                    file.start = function () {
                        return;
                    };
                };
            }
            else {
                file.onError(file);
            }
        });
        this.uploader.queue.addFiles(files);
    };
    UploadArea.prototype.validateFile = function (file) {
        if (!this.isFileSizeValid(file)) {
            file.uploadStatus = UploadStatus.failed;
            file.responseText = this.options.localizer.fileSizeInvalid(this.options.maxFileSize);
            file.errorCode = ErrorCode.FileSizeExceeded;
            return false;
        }
        if (this.fileTypeMissing(file)) {
            file.uploadStatus = UploadStatus.failed;
            file.responseText = this.options.localizer.fileTypeMissing();
            file.errorCode = ErrorCode.UnsupportedFileFormat;
            return false;
        }
        if (this.isFileTypeInvalid(file)) {
            file.uploadStatus = UploadStatus.failed;
            file.responseText = this.options.localizer.fileTypeInvalid(this.options.accept);
            file.errorCode = ErrorCode.UnsupportedFileFormat;
            return false;
        }
        file.errorCode = ErrorCode.NoError;
        return true;
    };
    UploadArea.prototype.setupFileApiElements = function () {
        var _this = this;
        this._fileInput = document.createElement("input");
        this._fileInput.setAttribute("type", "file");
        this._fileInput.setAttribute("accept", this.options.accept ? this.options.accept : "");
        this._fileInput.style.display = "none";
        var onChange = function (e) { return _this.onChange(e); };
        addEventHandler(this._fileInput, "change", onChange, this.options.useCapture);
        this.unregisterOnChange = function () {
            if (_this._fileInput)
                removeEventHandler(_this._fileInput, "change", onchange);
        };
        if (this.options.multiple) {
            this._fileInput.setAttribute("multiple", "");
        }
        this.registerEvents();
        // attach to body
        document.body.appendChild(this._fileInput);
    };
    UploadArea.prototype.registerEvents = function () {
        var _this = this;
        var onClick = function () { return _this.onClick(); };
        var useCapture = this.options.useCapture;
        addEventHandler(this.targetElement, "click", onClick, useCapture);
        this.unregisterOnClick = function () { return removeEventHandler(_this.targetElement, "click", onClick); };
        var onDragEnter = function () { return _this.onDragEnter(); };
        addEventHandler(this.targetElement, "dragenter", onDragEnter, useCapture);
        this.unregisterOnDragEnter = function () { return removeEventHandler(_this.targetElement, "dragenter", onDragEnter); };
        var onDragOver = (function (e) { return _this.onDragOver(e); });
        addEventHandler(this.targetElement, "dragover", onDragOver, useCapture);
        this.unregisterOnDragOver = function () { return removeEventHandler(_this.targetElement, "dragover", onDragOver); };
        var onDragLeave = function () { return _this.onDragLeave(); };
        addEventHandler(this.targetElement, "dragleave", onDragLeave, useCapture);
        this.unregisterOnDragLeave = function () { return removeEventHandler(_this.targetElement, "dragleave", onDragLeave); };
        var onDragEnterGlobal = function () { return _this.onDragEnterGlobal(); };
        addEventHandler(document.body, "dragenter", onDragEnterGlobal, useCapture);
        this.unregisterOnDragEnterGlobal = function () { return removeEventHandler(document.body, "dragenter", onDragEnterGlobal); };
        var onDragOverGlobal = function () { return _this.onDragOverGlobal(); };
        addEventHandler(document.body, "dragover", onDragOverGlobal, useCapture);
        this.unregisterOnDragOverGlobal = function () { return removeEventHandler(document.body, "dragover", onDragOverGlobal); };
        var onDragLeaveGlobal = function () { return _this.onDragLeaveGlobal(); };
        addEventHandler(document.body, "dragleave", onDragLeaveGlobal, useCapture);
        this.unregisterOnDragLeaveGlobal = function () { return removeEventHandler(document.body, "dragleave", onDragLeaveGlobal); };
        var onDrop = (function (e) { return _this.onDrop(e); });
        addEventHandler(this.targetElement, "drop", onDrop, useCapture);
        this.unregisterOnDrop = function () { return removeEventHandler(_this.targetElement, "drop", onDrop); };
        var onDropGlobal = (function (e) { return _this.onDropGlobal(e); });
        addEventHandler(document.body, "drop", onDropGlobal, useCapture);
        this.unregisterOnDropGlobal = function () { return removeEventHandler(document.body, "drop", onDropGlobal); };
    };
    UploadArea.prototype.onChange = function (e) {
        this.selectFiles(e.target.files);
    };
    UploadArea.prototype.onDragEnter = function () {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;
        this.options.onDragEnter && this.options.onDragEnter();
    };
    UploadArea.prototype.onDragOver = function (e) {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;
        this.options.onDragOver && this.options.onDragOver();
        this.addDragOverStyle(this.options.dragOverStyle);
        var effect = undefined;
        if (e.dataTransfer) {
            try {
                effect = e.dataTransfer.effectAllowed;
            }
            catch (_a) {
                true;
            }
            e.dataTransfer.dropEffect = "move" === effect || "linkMove" === effect ? "move" : "copy";
        }
        this.stopEventPropagation(e);
    };
    UploadArea.prototype.onDragLeave = function () {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;
        this.options.onDragLeave && this.options.onDragLeave();
        this.removeDragOverStyle(this.options.dragOverStyle);
    };
    UploadArea.prototype.onDragEnterGlobal = function () {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;
        this.options.onDragEnterGlobal && this.options.onDragEnterGlobal();
    };
    UploadArea.prototype.onDragOverGlobal = function () {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;
        this.options.onDragOverGlobal && this.options.onDragOverGlobal();
        this.addDragOverStyle(this.options.dragOverGlobalStyle);
    };
    UploadArea.prototype.onDragLeaveGlobal = function () {
        if (!getValueOrResult(this.options.allowDragDrop))
            return;
        this.options.onDragLeaveGlobal && this.options.onDragLeaveGlobal();
        this.removeDragOverStyle(this.options.dragOverGlobalStyle);
    };
    UploadArea.prototype.removeDragOverStyle = function (style) {
        if (!style)
            return;
        this.targetElement.classList.remove(style);
    };
    UploadArea.prototype.addDragOverStyle = function (style) {
        if (!style)
            return;
        this.targetElement.classList.add(style);
    };
    UploadArea.prototype.onDrop = function (e) {
        var _this = this;
        if (!getValueOrResult(this.options.allowDragDrop))
            return;
        this.options.onDrop && this.options.onDrop();
        if (!e.dataTransfer) {
            return;
        }
        this.removeDragOverStyle(this.options.dragOverStyle);
        var files = e.dataTransfer.files;
        if (files.length) {
            if (!this.options.multiple)
                files = [files[0]];
            var items = e.dataTransfer.items;
            if (items && items.length && items[0].webkitGetAsEntry !== null) {
                var itemsToProcess = this.options.multiple ? items : [items[0]];
                ItemProcessor.processItems(itemsToProcess, function (files) { return _this.selectFiles(files); });
            }
            else {
                this.selectFiles(files);
            }
        }
    };
    UploadArea.prototype.onDropGlobal = function (e) {
        this.stopEventPropagation(e);
        this.options.onDropGlobal && this.options.onDropGlobal();
    };
    UploadArea.prototype.isIeVersion = function (v) {
        return RegExp("msie" + (!isNaN(v) ? "\\s" + v.toString() : ""), "i").test(navigator.userAgent);
    };
    UploadArea.prototype.onClick = function () {
        var _this = this;
        if (!getValueOrResult(this.options.clickable) || !this._fileInput)
            return;
        this._fileInput.value = "";
        if (this.isIeVersion(10)) {
            setTimeout(function () {
                if (_this._fileInput)
                    _this._fileInput.click();
            }, 200);
        }
        else {
            this._fileInput.click();
        }
    };
    UploadArea.prototype.isFileSizeValid = function (file) {
        var maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
        if (file.size > maxFileSize || (!this.options.allowEmptyFile && file.size === 0))
            return false;
        return true;
    };
    UploadArea.prototype.fileTypeMissing = function (file) {
        return this.options.validateMissingExtension && file.name.indexOf(".") === -1;
    };
    UploadArea.prototype.isFileTypeInvalid = function (file) {
        if (file.name &&
            this.options.accept &&
            this.options.accept.trim() !== "*" &&
            this.options.accept.trim() !== "*.*" &&
            this.options.validateExtension &&
            this.options.accept.indexOf("/") === -1) {
            var acceptedExtensions = this.options.accept.split(",");
            var fileExtension = file.name.substring(file.name.lastIndexOf("."), file.name.length);
            if (fileExtension.indexOf(".") === -1)
                return true;
            var isFileExtensionExisted = true;
            for (var i = 0; i < acceptedExtensions.length; i++) {
                if (acceptedExtensions[i].toUpperCase().trim() === fileExtension.toUpperCase()) {
                    isFileExtensionExisted = false;
                }
            }
            return isFileExtensionExisted;
        }
        return false;
    };
    UploadArea.prototype.stopEventPropagation = function (e) {
        e.stopPropagation();
        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
    };
    return UploadArea;
}());
exports.UploadArea = UploadArea;
var UploadCore = /** @class */ (function () {
    function UploadCore(options, callbacks) {
        if (callbacks === void 0) { callbacks = {}; }
        this.callbacks = callbacks;
        this.options = applyDefaults(options, this.getDefaultOptions());
        this.setFullCallbacks(callbacks);
    }
    UploadCore.prototype.upload = function (fileList) {
        var _this = this;
        if (!exports.isFileApi)
            return;
        var files = castFiles(fileList, UploadStatus.uploading);
        files.forEach(function (file) { return _this.processFile(file); });
    };
    UploadCore.prototype.getUrl = function (file) {
        return typeof this.options.url === "function"
            ? this.options.url(file)
            : this.options.url;
    };
    UploadCore.prototype.processFile = function (file) {
        var xhr = this.createRequest(file);
        this.setCallbacks(xhr, file);
        this.send(xhr, file);
    };
    UploadCore.prototype.createRequest = function (file) {
        var xhr = new XMLHttpRequest();
        var url = file.url || this.getUrl(file);
        xhr.open(this.options.method, url, true);
        xhr.withCredentials = !!this.options.withCredentials;
        this.setHeaders(xhr);
        return xhr;
    };
    UploadCore.prototype.setHeaders = function (xhr) {
        var _this = this;
        if (!this.options.headers)
            return;
        if (!this.options.headers["Accept"])
            xhr.setRequestHeader("Accept", "application/json");
        if (!this.options.headers["Cache-Control"])
            xhr.setRequestHeader("Cache-Control", "no-cache");
        if (!this.options.headers["X-Requested-With"])
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        Object.keys(this.options.headers).forEach(function (headerName) {
            if (!_this.options.headers)
                return;
            var headerValue = _this.options.headers[headerName];
            if (headerValue !== undefined && headerValue !== null)
                xhr.setRequestHeader(headerName, (headerValue || "").toString());
        });
    };
    UploadCore.prototype.setCallbacks = function (xhr, file) {
        var _this = this;
        file.cancel = decorateSimpleFunction(file.cancel, function () {
            xhr.abort();
            file.uploadStatus = UploadStatus.canceled;
            if (file.onCancel)
                file.onCancel(file);
            if (_this.callbacks.onCancelledCallback)
                _this.callbacks.onCancelledCallback(file);
            if (_this.callbacks.onFileStateChangedCallback)
                _this.callbacks.onFileStateChangedCallback(file);
            if (_this.callbacks.onFinishedCallback)
                _this.callbacks.onFinishedCallback(file);
        }, true);
        xhr.onload = function () { return _this.onload(file, xhr); };
        xhr.onerror = function () { return _this.handleError(file, xhr); };
        xhr.upload.onprogress = function (e) { return _this.updateProgress(file, e); };
    };
    UploadCore.prototype.send = function (xhr, file) {
        var formData = this.createFormData(file);
        if (this.callbacks.onUploadStartedCallback)
            this.callbacks.onUploadStartedCallback(file);
        if (this.callbacks.onFileStateChangedCallback)
            this.callbacks.onFileStateChangedCallback(file);
        xhr.send(formData);
    };
    UploadCore.prototype.createFormData = function (file) {
        var _this = this;
        var formData = new FormData();
        if (this.options.params) {
            Object.keys(this.options.params).forEach(function (paramName) {
                if (!_this.options.params)
                    return;
                var paramValue = _this.options.params[paramName];
                if (paramValue !== undefined && paramValue !== null)
                    formData.append(paramName, _this.castParamType(paramValue));
            });
        }
        formData.append("file", file, file.name);
        return formData;
    };
    UploadCore.prototype.castParamType = function (param) {
        return this.isBoolean(param) || this.isNumber(param)
            ? param.toString()
            : param;
    };
    UploadCore.prototype.isNumber = function (param) {
        return typeof param === "number";
    };
    UploadCore.prototype.isBoolean = function (param) {
        return typeof param === "number";
    };
    UploadCore.prototype.handleError = function (file, xhr) {
        file.responseCode = ErrorCode.XhrResponseError;
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
    };
    UploadCore.prototype.updateProgress = function (file, e) {
        if (e) {
            if (e.lengthComputable) {
                file.progress = Math.round(100 * (e.loaded / e.total));
                file.sentBytes = e.loaded;
            }
            else {
                file.progress = 0;
                file.sentBytes = 0;
            }
        }
        else {
            file.progress = 100;
            file.sentBytes = file.size;
        }
        if (this.callbacks.onProgressCallback)
            this.callbacks.onProgressCallback(file);
    };
    UploadCore.prototype.onload = function (file, xhr) {
        if (xhr.readyState !== 4)
            return;
        if (file.progress !== 100)
            this.updateProgress(file);
        if (xhr.status === 200) {
            this.finished(file, xhr);
        }
        else {
            this.handleError(file, xhr);
        }
    };
    UploadCore.prototype.finished = function (file, xhr) {
        file.uploadStatus = UploadStatus.uploaded;
        this.setResponse(file, xhr);
        if (this.callbacks.onUploadedCallback)
            this.callbacks.onUploadedCallback(file);
        if (this.callbacks.onFileStateChangedCallback)
            this.callbacks.onFileStateChangedCallback(file);
        if (this.callbacks.onFinishedCallback)
            this.callbacks.onFinishedCallback(file);
    };
    UploadCore.prototype.setResponse = function (file, xhr) {
        file.responseCode = xhr.status;
        file.responseText =
            xhr.responseText ||
                xhr.statusText ||
                (xhr.status
                    ? xhr.status.toString()
                    : "" || this.options.localizer.invalidResponseFromServer());
    };
    UploadCore.prototype.getDefaultOptions = function () {
        return {
            headers: {},
            params: {},
            withCredentials: false,
            localizer: getDefaultLocalizer()
        };
    };
    UploadCore.prototype.setFullCallbacks = function (callbacks) {
        this.callbacks.onProgressCallback =
            callbacks.onProgressCallback ||
                (function () {
                    return;
                });
        this.callbacks.onCancelledCallback =
            callbacks.onCancelledCallback ||
                (function () {
                    return;
                });
        this.callbacks.onFinishedCallback =
            callbacks.onFinishedCallback ||
                (function () {
                    return;
                });
        this.callbacks.onUploadedCallback =
            callbacks.onUploadedCallback ||
                (function () {
                    return;
                });
        this.callbacks.onErrorCallback =
            callbacks.onErrorCallback ||
                (function () {
                    return;
                });
        this.callbacks.onUploadStartedCallback =
            callbacks.onUploadStartedCallback ||
                (function () {
                    return;
                });
        this.callbacks.onFileStateChangedCallback =
            callbacks.onFileStateChangedCallback ||
                (function () {
                    return;
                });
    };
    return UploadCore;
}());
exports.UploadCore = UploadCore;
var Uploader = /** @class */ (function () {
    function Uploader(options, callbacks) {
        if (options === void 0) { options = {}; }
        if (callbacks === void 0) { callbacks = {}; }
        this.options = options;
        this.uploadAreas = [];
        this.queue = new UploadQueue(options, callbacks);
    }
    Uploader.prototype.registerArea = function (element, options) {
        var uploadArea = new UploadArea(element, options, this);
        this.uploadAreas.push(uploadArea);
        return uploadArea;
    };
    Uploader.prototype.unregisterArea = function (area) {
        var areaIndex = this.uploadAreas.indexOf(area);
        if (areaIndex >= 0) {
            this.uploadAreas[areaIndex].destroy();
            this.uploadAreas.splice(areaIndex, 1);
        }
    };
    Object.defineProperty(Uploader.prototype, "firstUploadArea", {
        get: function () {
            return this.uploadAreas[0];
        },
        enumerable: false,
        configurable: true
    });
    return Uploader;
}());
exports.Uploader = Uploader;
var UploadQueue = /** @class */ (function () {
    function UploadQueue(options, callbacks) {
        this.offset = { fileCount: 0, running: false };
        this.queuedFiles = [];
        this.options = options;
        this.callbacks = callbacks;
        this.setFullOptions();
        this.setFullCallbacks();
    }
    UploadQueue.prototype.addFiles = function (files) {
        var _this = this;
        files.forEach(function (file) {
            if (!_this.queuedFiles.some(function (queuedFile) {
                return queuedFile === file ||
                    (!!queuedFile.guid && queuedFile.guid === file.guid);
            })) {
                _this.queuedFiles.push(file);
                file.remove = decorateSimpleFunction(file.remove, function () {
                    _this.removeFile(file);
                });
            }
            if (_this.callbacks.onFileAddedCallback)
                _this.callbacks.onFileAddedCallback(file);
            if (file.uploadStatus === UploadStatus.failed) {
                if (_this.callbacks.onErrorCallback) {
                    _this.callbacks.onErrorCallback(file);
                }
            }
            else {
                file.uploadStatus = UploadStatus.queued;
            }
        });
        this.filesChanged();
    };
    UploadQueue.prototype.removeFile = function (file, blockRecursive) {
        if (blockRecursive === void 0) { blockRecursive = false; }
        var index = this.queuedFiles.indexOf(file);
        if (index < 0)
            return;
        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);
        if (this.callbacks.onFileRemovedCallback)
            this.callbacks.onFileRemovedCallback(file);
        if (!blockRecursive)
            this.filesChanged();
    };
    UploadQueue.prototype.clearFiles = function (excludeStatuses, cancelProcessing) {
        var _this = this;
        if (excludeStatuses === void 0) { excludeStatuses = []; }
        if (cancelProcessing === void 0) { cancelProcessing = false; }
        if (!cancelProcessing)
            excludeStatuses = excludeStatuses.concat([
                UploadStatus.queued,
                UploadStatus.uploading
            ]);
        this.queuedFiles
            .filter(function (file) { return excludeStatuses.indexOf(file.uploadStatus) < 0; })
            .forEach(function (file) { return _this.removeFile(file, true); });
        if (this.callbacks.onQueueChangedCallback)
            this.callbacks.onQueueChangedCallback(this.queuedFiles);
    };
    UploadQueue.prototype.filesChanged = function () {
        if (this.options.autoRemove)
            this.removeFinishedFiles();
        if (this.options.autoStart)
            this.startWaitingFiles();
        if (this.callbacks.onQueueChangedCallback)
            this.callbacks.onQueueChangedCallback(this.queuedFiles);
        this.checkAllFinished();
    };
    UploadQueue.prototype.checkAllFinished = function () {
        var unfinishedFiles = this.queuedFiles.filter(function (file) {
            return [UploadStatus.queued, UploadStatus.uploading].indexOf(file.uploadStatus) >= 0;
        });
        if (unfinishedFiles.length === 0 && this.callbacks.onAllFinishedCallback) {
            this.callbacks.onAllFinishedCallback();
        }
    };
    UploadQueue.prototype.setFullOptions = function () {
        this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
        this.options.parallelBatchOffset = this.options.parallelBatchOffset || 0;
        this.options.autoStart = exports.isFileApi && (this.options.autoStart || false);
        this.options.autoRemove = this.options.autoRemove || false;
    };
    UploadQueue.prototype.setFullCallbacks = function () {
        var _this = this;
        this.callbacks.onFileAddedCallback =
            this.callbacks.onFileAddedCallback ||
                (function () {
                    return;
                });
        this.callbacks.onFileRemovedCallback =
            this.callbacks.onFileRemovedCallback ||
                (function () {
                    return;
                });
        this.callbacks.onAllFinishedCallback =
            this.callbacks.onAllFinishedCallback ||
                (function () {
                    return;
                });
        this.callbacks.onQueueChangedCallback =
            this.callbacks.onQueueChangedCallback ||
                (function () {
                    return;
                });
        this.callbacks.onFileStateChangedCallback = function () { return _this.filesChanged(); };
    };
    UploadQueue.prototype.startWaitingFiles = function () {
        this.getWaitingFiles().forEach(function (file) { return file.start(); });
    };
    UploadQueue.prototype.removeFinishedFiles = function () {
        var _this = this;
        this.queuedFiles
            .filter(function (file) {
            return [UploadStatus.uploaded, UploadStatus.canceled].indexOf(file.uploadStatus) >= 0;
        })
            .forEach(function (file) { return _this.removeFile(file, true); });
    };
    UploadQueue.prototype.deactivateFile = function (file) {
        if (file.uploadStatus === UploadStatus.uploading)
            file.cancel();
        file.uploadStatus = UploadStatus.removed;
        file.cancel = function () {
            return;
        };
        file.remove = function () {
            return;
        };
        file.start = function () {
            return;
        };
    };
    UploadQueue.prototype.getWaitingFiles = function () {
        if (!this.options.autoStart)
            return [];
        var result = this.queuedFiles.filter(function (file) { return file.uploadStatus === UploadStatus.queued; });
        if (this.options.maxParallelUploads) {
            var uploadingFilesCount = this.queuedFiles.filter(function (file) { return file.uploadStatus === UploadStatus.uploading; }).length;
            var count = Math.min(result.length, this.options.maxParallelUploads - uploadingFilesCount);
            if (count <= 0) {
                return [];
            }
            if (this.options.parallelBatchOffset) {
                if (!this.offset.running) {
                    this.startOffset();
                }
                count =
                    Math.min(this.offset.fileCount + count, this.options.maxParallelUploads) - this.offset.fileCount;
                this.offset.fileCount += count;
            }
            result = result.slice(0, count);
        }
        return result;
    };
    UploadQueue.prototype.startOffset = function () {
        var _this = this;
        this.offset.fileCount = 0;
        this.offset.running = true;
        setTimeout(function () {
            _this.offset.fileCount = 0;
            _this.offset.running = false;
            _this.filesChanged();
        }, this.options.parallelBatchOffset);
    };
    return UploadQueue;
}());
exports.UploadQueue = UploadQueue;
var UploadStatus;
(function (UploadStatus) {
    UploadStatus[UploadStatus["queued"] = 0] = "queued";
    UploadStatus[UploadStatus["uploading"] = 1] = "uploading";
    UploadStatus[UploadStatus["uploaded"] = 2] = "uploaded";
    UploadStatus[UploadStatus["failed"] = 3] = "failed";
    UploadStatus[UploadStatus["canceled"] = 4] = "canceled";
    UploadStatus[UploadStatus["removed"] = 5] = "removed";
})(UploadStatus = exports.UploadStatus || (exports.UploadStatus = {}));
