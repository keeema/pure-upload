let http = (url: string, success?: (result: string) => void, failure?: (status: number, statusText: string) => void) => {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);

    request.onreadystatechange = () => {
        if (request.readyState === 4) {
            if (request.status === 200) {
                success(request.responseText);
            } else if (failure) {
                failure(request.status, request.statusText);
            }
        }
    };
};

let mockXhr = () => {
    /* tslint:disable */
    XMLHttpRequest = <any>XhrMock;
    /* tslint:enable */
    FormData = FormDataMock;
};

let resolveEnvironment = (): void => {
    if (window.location.href.toString().toLowerCase().indexOf('file://') >= 0) {
        mockXhr();
        return;
    }

    http(
        'api/check',
        (result: string) => {
            if (result !== 'API OK')
                mockXhr();
        },
        () => {
            mockXhr();
        });
};

class FormDataMock {
    data: { [key: string]: { data: File, additional: string } } = {};
    append(key: string, data: File, additional?: string) {
        this.data[key] = { data, additional };
    }
}

class XhrMock {
    readyState: number = 0;
    status: number = 0;
    upload: { onprogress: (e: ProgressEvent) => void } = { onprogress: () => { ; } };
    onload: (e: Event) => void;

    private loaded: number = 0;
    private step: number = 2000000;
    private file: File;
    private timeoutId: number;

    open(method: string, url: string, async?: boolean) { ; }

    setRequestHeader(name: string, value: string) { ; }

    send(formData: FormDataMock): void {
        this.file = (<FormDataMock>formData).data['file'].data;
        this.performStep();
    }

    abort() {
        window.clearTimeout(this.timeoutId);
    }

    private performStep(): void {
        this.timeoutId = window.setTimeout(
            () => {
                if (this.addStep() === this.file.size) {
                    this.readyState = 4;
                    this.status = 200;
                    this.onload(new Event('loaded'));
                } else {
                    let e = <ProgressEvent>{
                        lengthComputable: true,
                        loaded: this.loaded,
                        total: this.file.size
                    };

                    this.upload.onprogress(e);
                    this.performStep();
                }
            },
            100);
    }

    private addStep(): number {
        let newValue = this.loaded + this.step;
        this.loaded = newValue > this.file.size ? this.file.size : newValue;
        return this.loaded;
    }
}
