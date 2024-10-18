"use strict";
function http(url, success, failure) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                if (success)
                    success(request.responseText);
            }
            else if (failure) {
                failure(request.status, request.statusText);
            }
        }
    };
}
function mockXhr() {
    /* tslint:disable */
    XMLHttpRequest = XhrMock;
    /* tslint:enable */
    FormData = FormDataMock;
}
function resolveEnvironment() {
    if (window.location.href.toString().toLowerCase().indexOf("file://") >= 0) {
        mockXhr();
        return;
    }
    http("api/check", function (result) {
        if (result !== "API OK")
            mockXhr();
    }, function () {
        mockXhr();
    });
}
var FormDataMock = /** @class */ (function () {
    function FormDataMock() {
        this.data = {};
    }
    FormDataMock.prototype.append = function (name, value, filename) {
        if (value instanceof Blob) {
            this.data[name] = { data: value, additional: filename };
        }
        else {
            this.data[name] = { data: new Blob([value]), additional: undefined };
        }
    };
    //   this.data[key] = { data, additional };
    // }
    FormDataMock.prototype.delete = function () { };
    FormDataMock.prototype.get = function (key) {
        return this.data[key].data;
    };
    FormDataMock.prototype.getAll = function () {
        return [];
    };
    FormDataMock.prototype.has = function (key) {
        return this.data[key] !== undefined;
    };
    FormDataMock.prototype.set = function (name, value, filename) {
        this.append(name, value, filename);
    };
    FormDataMock.prototype.forEach = function (_callbackfn) {
        return;
    };
    return FormDataMock;
}());
var XhrMock = /** @class */ (function () {
    function XhrMock() {
        this.readyState = 0;
        this.status = 0;
        this.upload = { onprogress: function () { } };
        this.loaded = 0;
        this.step = 2000000;
    }
    XhrMock.prototype.open = function () {
        return;
    };
    XhrMock.prototype.setRequestHeader = function () {
        return;
    };
    XhrMock.prototype.send = function (formData) {
        this.file = formData.data["file"].data;
        this.performStep();
    };
    XhrMock.prototype.abort = function () {
        if (this.timeoutId)
            window.clearTimeout(this.timeoutId);
    };
    XhrMock.prototype.performStep = function () {
        var _this = this;
        this.timeoutId = window.setTimeout(function () {
            if (_this.file && _this.addStep() === _this.file.size) {
                _this.readyState = 4;
                _this.status = 200;
                if (_this.onload)
                    _this.onload(new Event("loaded"));
            }
            else {
                var e = {
                    lengthComputable: true,
                    loaded: _this.loaded,
                    total: _this.file ? _this.file.size : 0,
                };
                _this.upload.onprogress(e);
                _this.performStep();
            }
        }, 100);
    };
    XhrMock.prototype.addStep = function () {
        var newValue = this.loaded + this.step;
        this.loaded = this.file && newValue > this.file.size ? this.file.size : newValue;
        return this.loaded;
    };
    return XhrMock;
}());
