class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    options: IUploadQueueOptions;

    constructor(options: IUploadQueueOptions = {}, callbacks: IUploadQueueCallbacks = {}) {
        this.options = options;
        this.uploadAreas = [];
        this.queue = new UploadQueue(options, callbacks);
    }

    registerArea(element: HTMLElement, options: IUploadAreaOptions): UploadArea {
        const uploadArea = new UploadArea(element, options, this);
        this.uploadAreas.push(uploadArea);
        return uploadArea;
    }

    unregisterArea(area: UploadArea): void {
        const areaIndex = this.uploadAreas.indexOf(area);
        if (areaIndex >= 0) {
            this.uploadAreas[areaIndex]!.destroy();
            this.uploadAreas.splice(areaIndex, 1);
        }
    }

    get firstUploadArea(): UploadArea | undefined {
        return this.uploadAreas[0];
    }
}
