function http(url, success, failure) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
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
;
function mockXhr() {
    /* tslint:disable */
    XMLHttpRequest = XhrMock;
    /* tslint:enable */
    FormData = FormDataMock;
}
;
function resolveEnvironment() {
    if (window.location.href.toString().toLowerCase().indexOf('file://') >= 0) {
        mockXhr();
        return;
    }
    http('api/check', function (result) {
        if (result !== 'API OK')
            mockXhr();
    }, function () {
        mockXhr();
    });
}
;
var FormDataMock = (function () {
    function FormDataMock() {
        this.data = {};
    }
    FormDataMock.prototype.append = function (key, data, additional) {
        this.data[key] = { data: data, additional: additional };
    };
    ;
    FormDataMock.prototype.delete = function () { ; };
    FormDataMock.prototype.get = function (key) { return this.data[key].data; };
    FormDataMock.prototype.getAll = function () { return []; };
    FormDataMock.prototype.has = function (key) { return this.data[key] !== undefined; };
    FormDataMock.prototype.set = function (_key, _value) { ; };
    return FormDataMock;
}());
var XhrMock = (function () {
    function XhrMock() {
        this.readyState = 0;
        this.status = 0;
        this.upload = { onprogress: function () { ; } };
        this.loaded = 0;
        this.step = 2000000;
    }
    XhrMock.prototype.open = function () { ; };
    XhrMock.prototype.setRequestHeader = function () { ; };
    XhrMock.prototype.send = function (formData) {
        this.file = formData.data['file'].data;
        this.performStep();
    };
    XhrMock.prototype.abort = function () {
        window.clearTimeout(this.timeoutId);
    };
    XhrMock.prototype.performStep = function () {
        var _this = this;
        this.timeoutId = window.setTimeout(function () {
            if (_this.addStep() === _this.file.size) {
                _this.readyState = 4;
                _this.status = 200;
                _this.onload(new Event('loaded'));
            }
            else {
                var e = {
                    lengthComputable: true,
                    loaded: _this.loaded,
                    total: _this.file.size
                };
                _this.upload.onprogress(e);
                _this.performStep();
            }
        }, 100);
    };
    XhrMock.prototype.addStep = function () {
        var newValue = this.loaded + this.step;
        this.loaded = newValue > this.file.size ? this.file.size : newValue;
        return this.loaded;
    };
    return XhrMock;
}());
