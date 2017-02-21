var pu;
(function (pu) {
    function addEventHandler(el, event, handler) {
        if (el.addEventListener) {
            el.addEventListener(event, handler);
        }
        else {
            var elem = el;
            if (elem.attachEvent) {
                elem.attachEvent('on' + event, handler);
            }
            else {
                elem[event] = handler;
            }
        }
    }
    pu.addEventHandler = addEventHandler;
    pu.isFileApi = !!(window.File && window.FormData);
    function castFiles(fileList, status) {
        var files;
        if (typeof fileList === 'object') {
            files = map(filter(keys(fileList), function (key) { return key !== 'length'; }), function (key) { return fileList[key]; });
        }
        else {
            files = fileList;
        }
        forEach(files, function (file) {
            file.uploadStatus = status || file.uploadStatus;
            file.responseCode = file.responseCode || 0;
            file.responseText = file.responseText || '';
            file.progress = file.progress || 0;
            file.sentBytes = file.sentBytes || 0;
            file.cancel = file.cancel || (function () { return; });
        });
        return files;
    }
    pu.castFiles = castFiles;
    function filter(input, filterFn) {
        if (!input)
            return null;
        var result = [];
        forEach(input, function (item) {
            if (filterFn(item))
                result.push(item);
        });
        return result;
    }
    pu.filter = filter;
    function forEach(input, callback) {
        if (!input)
            return;
        for (var i = 0; i < input.length; i++) {
            callback(input[i], i);
        }
    }
    pu.forEach = forEach;
    function decorateSimpleFunction(origFn, newFn, newFirst) {
        if (newFirst === void 0) { newFirst = false; }
        if (!origFn)
            return newFn;
        return newFirst
            ? function () { newFn(); origFn(); }
            : function () { origFn(); newFn(); };
    }
    pu.decorateSimpleFunction = decorateSimpleFunction;
    function getUploadCore(options, callbacks) {
        return new UploadCore(options, callbacks);
    }
    pu.getUploadCore = getUploadCore;
    ;
    function getUploader(options, callbacks) {
        return new Uploader(options, callbacks);
    }
    pu.getUploader = getUploader;
    ;
    function newGuid() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            /* tslint:disable */
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            /* tslint:enable */
        });
        return uuid;
    }
    pu.newGuid = newGuid;
    ;
    function indexOf(input, item) {
        if (!input)
            return -1;
        for (var i = 0; i < input.length; i++) {
            if (input[i] === item)
                return i;
        }
        return -1;
    }
    pu.indexOf = indexOf;
    function keys(obj) {
        if (Object && Object.keys)
            return Object.keys(obj);
        var keys = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }
        return keys;
    }
    pu.keys = keys;
    function map(input, mapper) {
        if (!input)
            return null;
        var result = [];
        forEach(input, function (item) {
            result.push(mapper(item));
        });
        return result;
    }
    pu.map = map;
    function removeEventHandler(el, event, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(event, handler);
        }
        else {
            var elem = el;
            if (elem.detachEvent) {
                elem.detachEvent('on' + event, handler);
            }
            else {
                elem[event] = null;
            }
        }
    }
    pu.removeEventHandler = removeEventHandler;
    var UploadArea = (function () {
        function UploadArea(targetElement, options, uploader, formForNoFileApi) {
            if (formForNoFileApi) {
                this.formForNoFileApi = formForNoFileApi.tagName.toLowerCase() === 'form'
                    ? formForNoFileApi
                    : formForNoFileApi.getElementsByTagName('form')[0];
            }
            this.targetElement = targetElement;
            this.options = options;
            this.uploader = uploader;
            this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
            this.setFullOptions(options);
            if (pu.isFileApi) {
                this.setupFileApiElements();
            }
            else {
                this.setupOldSchoolElements();
            }
        }
        UploadArea.prototype.destroy = function () {
            if (pu.isFileApi) {
                if (this.unregisterOnClick)
                    this.unregisterOnClick();
                if (this.unregisterOnDrop)
                    this.unregisterOnDrop();
                if (this.unregisterOnChange)
                    this.unregisterOnChange();
                if (this.unregisterOnDragOver)
                    this.unregisterOnDragOver();
                this.targetElement.removeEventListener('dragover', this.onDrag);
                this.targetElement.removeEventListener('drop', this.onDrop);
                document.body.removeChild(this.fileInput);
            }
            else {
                if (this.unregisterFormOnChange)
                    this.unregisterFormOnChange();
                if (this.lastIframe)
                    this.formForNoFileApi.parentNode.removeChild(this.lastIframe);
                if (!this.formForNoFileApiProvided) {
                    this.formForNoFileApi.parentNode.insertBefore(this.targetElement, this.formForNoFileApi.nextSibling || null);
                    this.targetElement.parentNode.removeChild(this.formForNoFileApi);
                }
            }
        };
        UploadArea.prototype.setFullOptions = function (options) {
            this.options.maxFileSize = options.maxFileSize || 1024;
            this.options.allowDragDrop = pu.isFileApi &&
                (options.allowDragDrop === undefined || options.allowDragDrop === null ? true : options.allowDragDrop);
            this.options.clickable = options.clickable === undefined || options.clickable === null ? true : options.clickable;
            this.options.accept = options.accept || '*.*';
            this.options.validateExtension = !!options.validateExtension;
            this.options.multiple = pu.isFileApi &&
                (options.multiple === undefined || options.multiple === null ? true : options.multiple);
        };
        UploadArea.prototype.putFilesToQueue = function (fileList, form) {
            var _this = this;
            var uploadFiles = castFiles(fileList);
            forEach(uploadFiles, function (file) {
                file.guid = newGuid();
                file.url = _this.uploadCore.getUrl(file);
                file.onError = _this.options.onFileError || (function () { ; });
                file.onCancel = _this.options.onFileCanceled || (function () { ; });
                if (_this.validateFile(file)) {
                    file.start = function () {
                        _this.uploadCore.upload([file]);
                        if (_this.options.onFileAdded) {
                            _this.options.onFileAdded(file);
                        }
                        file.start = function () { return; };
                    };
                }
                else {
                    file.onError(file);
                }
            });
            this.uploader.queue.addFiles(uploadFiles);
        };
        UploadArea.prototype.validateFile = function (file) {
            if (!this.isFileSizeValid(file)) {
                file.uploadStatus = UploadStatus.failed;
                file.responseText = !!this.options.localizer
                    ? this.options.localizer('The selected file exceeds the allowed size of { maxFileSize } MB or its size is 0 MB. Please choose another file.', this.options)
                    : 'The selected file exceeds the allowed size of ' + this.options.maxFileSize
                        + ' or its size is 0 MB. Please choose another file.';
                return false;
            }
            if (this.isFileTypeInvalid(file)) {
                file.uploadStatus = UploadStatus.failed;
                file.responseText = !!this.options.localizer
                    ? this.options.localizer('File format is not allowed. Only { accept } files are allowed.', this.options)
                    : 'File format is not allowed. Only ' + this.options.accept.split('.').join(' ') + ' files are allowed.';
                return false;
            }
            return true;
        };
        UploadArea.prototype.setupFileApiElements = function () {
            var _this = this;
            this.fileInput = document.createElement('input');
            this.fileInput.setAttribute('type', 'file');
            this.fileInput.setAttribute('accept', this.options.accept);
            this.fileInput.style.display = 'none';
            if (this.formForNoFileApi)
                this.formForNoFileApi.style.display = 'none';
            var onChange = function (e) { return _this.onChange(e); };
            addEventHandler(this.fileInput, 'change', onChange);
            this.unregisterOnChange = function () { return removeEventHandler(_this.fileInput, 'change', onchange); };
            if (this.options.multiple) {
                this.fileInput.setAttribute('multiple', '');
            }
            if (this.options.clickable) {
                var onClick_1 = function () { return _this.onClick(); };
                addEventHandler(this.targetElement, 'click', onClick_1);
                this.unregisterOnClick = function () { return removeEventHandler(_this.targetElement, 'click', onClick_1); };
            }
            if (this.options.allowDragDrop) {
                var onDrag_1 = function (e) { return _this.onDrag(e); };
                addEventHandler(this.targetElement, 'dragover', onDrag_1);
                this.unregisterOnDragOver = function () { return removeEventHandler(_this.targetElement, 'dragover', onDrag_1); };
                var onDrop_1 = function (e) { return _this.onDrop(e); };
                addEventHandler(this.targetElement, 'drop', onDrop_1);
                this.unregisterOnDrop = function () { return removeEventHandler(_this.targetElement, 'drop', onDrop_1); };
            }
            // attach to body
            document.body.appendChild(this.fileInput);
        };
        UploadArea.prototype.setupOldSchoolElements = function () {
            var _this = this;
            if (!this.options.clickable)
                return;
            if (this.formForNoFileApi) {
                this.decorateInputForm();
            }
            else {
                this.createFormWrapper();
            }
            var submitInput = this.findInnerSubmit();
            var handler = function (e) { return _this.onFormChange(e, _this.fileInput, submitInput); };
            addEventHandler(this.fileInput, 'change', handler);
            this.unregisterFormOnChange = function () { return removeEventHandler(_this.fileInput, 'change', handler); };
        };
        UploadArea.prototype.createFormWrapper = function () {
            this.fileInput = document.createElement('input');
            this.fileInput.setAttribute('type', 'file');
            this.fileInput.setAttribute('accept', this.options.accept);
            this.fileInput.setAttribute('name', 'file');
            this.fileInput.style.position = 'absolute';
            this.fileInput.style.left = '0';
            this.fileInput.style.right = '0';
            this.fileInput.style.top = '0';
            this.fileInput.style.bottom = '0';
            this.fileInput.style.width = '100%';
            this.fileInput.style.height = '100%';
            this.fileInput.style.fontSize = '10000%'; //IE one click
            this.fileInput.style.opacity = '0';
            this.fileInput.style.filter = 'alpha(opacity=0)';
            this.fileInput.style.cursor = 'pointer';
            this.formForNoFileApi = document.createElement('form');
            this.formForNoFileApi.setAttribute('method', this.uploadCore.options.method);
            this.formForNoFileApi.setAttribute('enctype', 'multipart/form-data');
            this.formForNoFileApi.setAttribute('encoding', 'multipart/form-data');
            this.formForNoFileApi.style.position = 'relative';
            this.formForNoFileApi.style.display = 'block';
            this.formForNoFileApi.style.overflow = 'hidden';
            this.formForNoFileApi.style.width = this.targetElement.offsetWidth.toString() + 'px';
            this.formForNoFileApi.style.height = this.targetElement.offsetHeight.toString() + 'px';
            if (this.targetElement.clientHeight === 0 || this.targetElement.clientWidth === 0) {
                console.warn('upload element height and width has to be set to be able catch upload');
            }
            this.targetElement.parentNode.insertBefore(this.formForNoFileApi, this.targetElement.nextSibling || null);
            this.formForNoFileApi.appendChild(this.targetElement);
            this.formForNoFileApi.appendChild(this.fileInput);
        };
        UploadArea.prototype.decorateInputForm = function () {
            this.formForNoFileApiProvided = true;
            this.targetElement.style.display = 'none';
            this.formForNoFileApi.setAttribute('method', this.uploadCore.options.method);
            this.formForNoFileApi.setAttribute('enctype', 'multipart/form-data');
            this.formForNoFileApi.setAttribute('encoding', 'multipart/form-data');
            var inputs = this.formForNoFileApi.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                var el = inputs[i];
                if (el.type === 'file') {
                    this.fileInput = el;
                }
            }
        };
        UploadArea.prototype.findInnerSubmit = function () {
            var inputs = this.formForNoFileApi.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                var el = inputs[i];
                if (el.type === 'submit') {
                    return el;
                }
            }
            return undefined;
        };
        UploadArea.prototype.onFormChange = function (e, fileInput, submitInput) {
            var _this = this;
            var files = e.target
                ? e.target.files
                    ? e.target.files
                    : e.target.value
                        ? [{ name: e.target.value.replace(/^.+\\/, '') }]
                        : []
                : fileInput.value
                    ? [{ name: fileInput.value.replace(/^.+\\/, '') }]
                    : [];
            forEach(files, function (file) {
                file.guid = file.guid || newGuid();
                file.url = _this.uploadCore.getUrl(file);
            });
            if (files.length === 0)
                return;
            this.addTargetIframe();
            this.formForNoFileApi.setAttribute('action', files[0].url);
            if (!submitInput) {
                this.formForNoFileApi.submit();
            }
        };
        UploadArea.prototype.addTargetIframe = function () {
            if (this.lastIframe) {
                this.formForNoFileApi.parentNode.removeChild(this.lastIframe);
            }
            var iframeName = 'uploadIframe' + Date.now();
            var iframe = this.lastIframe = document.createElement('iframe');
            iframe.setAttribute('id', iframeName);
            iframe.setAttribute('name', iframeName);
            iframe.style.border = 'none';
            iframe.style.display = 'none';
            iframe.style.width = '0';
            iframe.style.height = '0';
            this.formForNoFileApi.setAttribute('target', iframeName);
            this.formForNoFileApi.parentNode.insertBefore(iframe, this.formForNoFileApi.nextSibling || null);
            window.frames[iframeName].name = iframeName;
        };
        UploadArea.prototype.onChange = function (e) {
            this.putFilesToQueue(e.target.files, this.fileInput);
        };
        UploadArea.prototype.onDrag = function (e) {
            var efct;
            try {
                efct = e.dataTransfer.effectAllowed;
            }
            catch (err) {
                ;
            }
            e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
            this.stopEventPropagation(e);
        };
        UploadArea.prototype.onDrop = function (e) {
            this.stopEventPropagation(e);
            if (!e.dataTransfer) {
                return;
            }
            var files = e.dataTransfer.files;
            if (files.length) {
                if (!this.options.multiple)
                    files = [files[0]];
                var items = e.dataTransfer.items;
                if (items && items.length && (items[0].webkitGetAsEntry !== null)) {
                    if (!this.options.multiple) {
                        var newItems = [items[0]];
                        this.addFilesFromItems(newItems);
                    }
                    else {
                        this.addFilesFromItems(items);
                    }
                }
                else {
                    this.handleFiles(files);
                }
            }
        };
        UploadArea.prototype.isIeVersion = function (v) {
            return RegExp('msie' + (!isNaN(v) ? ('\\s' + v.toString()) : ''), 'i').test(navigator.userAgent);
        };
        UploadArea.prototype.onClick = function () {
            var _this = this;
            this.fileInput.value = '';
            if (this.isIeVersion(10)) {
                setTimeout(function () { _this.fileInput.click(); }, 200);
            }
            else {
                this.fileInput.click();
            }
        };
        UploadArea.prototype.addFilesFromItems = function (items) {
            var entry;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if ((item.webkitGetAsEntry) && (entry = item.webkitGetAsEntry())) {
                    if (entry.isFile) {
                        this.putFilesToQueue([item.getAsFile()], this.fileInput);
                    }
                    else if (entry.isDirectory) {
                        this.processDirectory(entry, entry.name);
                    }
                }
                else if (item.getAsFile) {
                    if (!item.kind || item.kind === 'file') {
                        this.putFilesToQueue([item.getAsFile()], this.fileInput);
                    }
                }
            }
        };
        UploadArea.prototype.processDirectory = function (directory, path) {
            var _this = this;
            var dirReader = directory.createReader();
            var self = this;
            var entryReader = function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.isFile) {
                        entry.file(function (file) {
                            if (file.name.substring(0, 1) === '.') {
                                return;
                            }
                            file.fullPath = '' + path + '/' + file.name;
                            self.putFilesToQueue([file], _this.fileInput);
                        });
                    }
                    else if (entry.isDirectory) {
                        self.processDirectory(entry, '' + path + '/' + entry.name);
                    }
                }
            };
            dirReader.readEntries(entryReader, function (error) {
                return typeof console !== 'undefined' && console !== null
                    ? typeof console.log === 'function' ? console.log(error) : void 0
                    : void 0;
            });
        };
        UploadArea.prototype.handleFiles = function (files) {
            for (var i = 0; i < files.length; i++) {
                this.putFilesToQueue([files[i]], this.fileInput);
            }
        };
        UploadArea.prototype.isFileSizeValid = function (file) {
            var maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
            if (file.size > maxFileSize || file.size === 0)
                return false;
            return true;
        };
        UploadArea.prototype.isFileTypeInvalid = function (file) {
            if (file.name && (this.options.accept.trim() !== '*' || this.options.accept.trim() !== '*.*') &&
                this.options.validateExtension && this.options.accept.indexOf('/') === -1) {
                var acceptedExtensions = this.options.accept.split(',');
                var fileExtension = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
                if (fileExtension.indexOf('.') === -1)
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
                return e.returnValue = false;
            }
        };
        return UploadArea;
    }());
    pu.UploadArea = UploadArea;
    var UploadCore = (function () {
        function UploadCore(options, callbacks) {
            if (callbacks === void 0) { callbacks = {}; }
            this.options = options;
            this.callbacks = callbacks;
            this.setFullOptions(options);
            this.setFullCallbacks(callbacks);
        }
        UploadCore.prototype.upload = function (fileList) {
            var _this = this;
            if (!pu.isFileApi)
                return;
            var files = castFiles(fileList, UploadStatus.uploading);
            forEach(files, function (file) { return _this.processFile(file); });
        };
        UploadCore.prototype.getUrl = function (file) {
            return typeof this.options.url === 'function'
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
            this.setHeaders(xhr, file.name);
            return xhr;
        };
        UploadCore.prototype.setHeaders = function (xhr, fileName) {
            var _this = this;
            if (!this.options.headers['Accept'])
                xhr.setRequestHeader('Accept', 'application/json');
            if (!this.options.headers['Cache-Control'])
                xhr.setRequestHeader('Cache-Control', 'no-cache');
            if (!this.options.headers['X-Requested-With'])
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            forEach(keys(this.options.headers), function (headerName) {
                var headerValue = _this.options.headers[headerName];
                if (headerValue !== undefined && headerValue !== null)
                    xhr.setRequestHeader(headerName, (headerValue || '').toString());
            });
        };
        UploadCore.prototype.setCallbacks = function (xhr, file) {
            var _this = this;
            file.cancel = decorateSimpleFunction(file.cancel, function () {
                xhr.abort();
                file.uploadStatus = UploadStatus.canceled;
                if (file.onCancel)
                    file.onCancel(file);
                _this.callbacks.onCancelledCallback(file);
                _this.callbacks.onFileStateChangedCallback(file);
                _this.callbacks.onFinishedCallback(file);
            }, true);
            xhr.onload = function (e) { return _this.onload(file, xhr); };
            xhr.onerror = function () { return _this.handleError(file, xhr); };
            xhr.upload.onprogress = function (e) { return _this.updateProgress(file, e); };
        };
        UploadCore.prototype.send = function (xhr, file) {
            var formData = this.createFormData(file);
            this.callbacks.onUploadStartedCallback(file);
            this.callbacks.onFileStateChangedCallback(file);
            xhr.send(formData);
        };
        UploadCore.prototype.createFormData = function (file) {
            var _this = this;
            var formData = new FormData();
            forEach(keys(this.options.params), function (paramName) {
                var paramValue = _this.options.params[paramName];
                if (paramValue !== undefined && paramValue !== null)
                    formData.append(paramName, paramValue);
            });
            formData.append('file', file, file.name);
            return formData;
        };
        UploadCore.prototype.handleError = function (file, xhr) {
            file.uploadStatus = UploadStatus.failed;
            this.setResponse(file, xhr);
            if (file.onError) {
                file.onError(file);
            }
            this.callbacks.onErrorCallback(file);
            this.callbacks.onFileStateChangedCallback(file);
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
            this.callbacks.onUploadedCallback(file);
            this.callbacks.onFileStateChangedCallback(file);
            this.callbacks.onFinishedCallback(file);
        };
        ;
        UploadCore.prototype.setResponse = function (file, xhr) {
            file.responseCode = xhr.status;
            var response = xhr.responseText || xhr.statusText || (xhr.status
                ? xhr.status.toString()
                : '' || 'Invalid response from server');
            file.responseText = !!this.options.localizer
                ? this.options.localizer(response, {})
                : response;
        };
        UploadCore.prototype.setFullOptions = function (options) {
            this.options.url = options.url;
            this.options.method = options.method;
            this.options.headers = options.headers || {};
            this.options.params = options.params || {};
            this.options.withCredentials = options.withCredentials || false;
            this.options.localizer = options.localizer;
        };
        UploadCore.prototype.setFullCallbacks = function (callbacks) {
            this.callbacks.onProgressCallback = callbacks.onProgressCallback || (function () { return; });
            this.callbacks.onCancelledCallback = callbacks.onCancelledCallback || (function () { return; });
            this.callbacks.onFinishedCallback = callbacks.onFinishedCallback || (function () { return; });
            this.callbacks.onUploadedCallback = callbacks.onUploadedCallback || (function () { return; });
            this.callbacks.onErrorCallback = callbacks.onErrorCallback || (function () { return; });
            this.callbacks.onUploadStartedCallback = callbacks.onUploadStartedCallback || (function () { return; });
            this.callbacks.onFileStateChangedCallback = callbacks.onFileStateChangedCallback || (function () { return; });
        };
        return UploadCore;
    }());
    pu.UploadCore = UploadCore;
    var Uploader = (function () {
        function Uploader(options, callbacks) {
            if (options === void 0) { options = {}; }
            if (callbacks === void 0) { callbacks = {}; }
            this.setOptions(options);
            this.uploadAreas = [];
            this.queue = new UploadQueue(options, callbacks);
        }
        Uploader.prototype.setOptions = function (options) {
            this.options = options;
        };
        Uploader.prototype.registerArea = function (element, options, compatibilityForm) {
            var uploadArea = new UploadArea(element, options, this, compatibilityForm);
            this.uploadAreas.push(uploadArea);
            return uploadArea;
        };
        Uploader.prototype.unregisterArea = function (area) {
            var areaIndex = indexOf(this.uploadAreas, area);
            if (areaIndex >= 0) {
                this.uploadAreas[areaIndex].destroy();
                this.uploadAreas.splice(areaIndex, 1);
            }
        };
        return Uploader;
    }());
    pu.Uploader = Uploader;
    var UploadQueue = (function () {
        function UploadQueue(options, callbacks) {
            this.queuedFiles = [];
            this.options = options;
            this.callbacks = callbacks;
            this.setFullOptions();
            this.setFullCallbacks();
        }
        UploadQueue.prototype.addFiles = function (files) {
            var _this = this;
            forEach(files, function (file) {
                _this.queuedFiles.push(file);
                file.remove = decorateSimpleFunction(file.remove, function () {
                    _this.removeFile(file);
                });
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
            var index = indexOf(this.queuedFiles, file);
            if (index < 0)
                return;
            this.deactivateFile(file);
            this.queuedFiles.splice(index, 1);
            this.callbacks.onFileRemovedCallback(file);
            if (!blockRecursive)
                this.filesChanged();
        };
        UploadQueue.prototype.clearFiles = function (excludeStatuses, cancelProcessing) {
            var _this = this;
            if (excludeStatuses === void 0) { excludeStatuses = []; }
            if (cancelProcessing === void 0) { cancelProcessing = false; }
            if (!cancelProcessing)
                excludeStatuses = excludeStatuses.concat([UploadStatus.queued, UploadStatus.uploading]);
            forEach(filter(this.queuedFiles, function (file) { return indexOf(excludeStatuses, file.uploadStatus) < 0; }), function (file) { return _this.removeFile(file, true); });
            this.callbacks.onQueueChangedCallback(this.queuedFiles);
        };
        UploadQueue.prototype.filesChanged = function () {
            if (this.options.autoRemove)
                this.removeFinishedFiles();
            if (this.options.autoStart)
                this.startWaitingFiles();
            this.callbacks.onQueueChangedCallback(this.queuedFiles);
            this.checkAllFinished();
        };
        UploadQueue.prototype.checkAllFinished = function () {
            var unfinishedFiles = filter(this.queuedFiles, function (file) { return indexOf([UploadStatus.queued, UploadStatus.uploading], file.uploadStatus) >= 0; });
            if (unfinishedFiles.length === 0) {
                this.callbacks.onAllFinishedCallback();
            }
        };
        UploadQueue.prototype.setFullOptions = function () {
            this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
            this.options.autoStart = pu.isFileApi && (this.options.autoStart || false);
            this.options.autoRemove = this.options.autoRemove || false;
        };
        UploadQueue.prototype.setFullCallbacks = function () {
            var _this = this;
            this.callbacks.onFileAddedCallback = this.callbacks.onFileAddedCallback || (function () { return; });
            this.callbacks.onFileRemovedCallback = this.callbacks.onFileRemovedCallback || (function () { return; });
            this.callbacks.onAllFinishedCallback = this.callbacks.onAllFinishedCallback || (function () { return; });
            this.callbacks.onQueueChangedCallback = this.callbacks.onQueueChangedCallback || (function () { return; });
            this.callbacks.onFileStateChangedCallback = function () { return _this.filesChanged(); };
        };
        UploadQueue.prototype.startWaitingFiles = function () {
            forEach(this.getWaitingFiles(), function (file) { return file.start(); });
        };
        UploadQueue.prototype.removeFinishedFiles = function () {
            var _this = this;
            forEach(filter(this.queuedFiles, function (file) { return indexOf([
                UploadStatus.uploaded,
                UploadStatus.canceled
            ], file.uploadStatus) >= 0; }), function (file) { return _this.removeFile(file, true); });
        };
        UploadQueue.prototype.deactivateFile = function (file) {
            if (file.uploadStatus === UploadStatus.uploading)
                file.cancel();
            file.uploadStatus = UploadStatus.removed;
            file.cancel = function () { return; };
            file.remove = function () { return; };
            file.start = function () { return; };
        };
        UploadQueue.prototype.getWaitingFiles = function () {
            if (!this.options.autoStart)
                return [];
            var result = filter(this.queuedFiles, function (file) { return file.uploadStatus === UploadStatus.queued; });
            if (this.options.maxParallelUploads > 0) {
                var uploadingFilesCount = filter(this.queuedFiles, function (file) { return file.uploadStatus === UploadStatus.uploading; }).length;
                var count = this.options.maxParallelUploads - uploadingFilesCount;
                if (count <= 0) {
                    return [];
                }
                result = result.slice(0, count);
            }
            return result;
        };
        return UploadQueue;
    }());
    pu.UploadQueue = UploadQueue;
    (function (UploadStatus) {
        UploadStatus[UploadStatus["queued"] = 0] = "queued";
        UploadStatus[UploadStatus["uploading"] = 1] = "uploading";
        UploadStatus[UploadStatus["uploaded"] = 2] = "uploaded";
        UploadStatus[UploadStatus["failed"] = 3] = "failed";
        UploadStatus[UploadStatus["canceled"] = 4] = "canceled";
        UploadStatus[UploadStatus["removed"] = 5] = "removed";
    })(pu.UploadStatus || (pu.UploadStatus = {}));
    var UploadStatus = pu.UploadStatus;
})(pu || (pu = {}));
