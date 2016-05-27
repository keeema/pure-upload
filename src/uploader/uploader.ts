class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    options: IUploadQueueOptions;

    constructor(options: IUploadQueueOptions = {}, callbacks: IUploadQueueCallbacks = {}) {
        this.setOptions(options);
        this.uploadAreas = [];
        this.queue = new UploadQueue(options, callbacks);
    }

    setOptions(options: IUploadQueueOptions): void {
        this.options = options;
    }

    registerArea(element: HTMLElement, options: IUploadAreaOptions, compatibilityForm?: Element): UploadArea {
        let uploadArea = new UploadArea(element, options, this, <HTMLFormElement>compatibilityForm);
        this.uploadAreas.push(uploadArea);
        return uploadArea;
    }

    unregisterArea(area: UploadArea): void {
        let areaIndex = indexOf(this.uploadAreas, area);
        if (areaIndex >= 0) {
            this.uploadAreas[areaIndex].destroy();
            this.uploadAreas.splice(areaIndex, 1);
        }
    }
}
