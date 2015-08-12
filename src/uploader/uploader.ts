class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    options: IUploadQueueOptions;

    constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks) {
        this.setOptions(options);
        this.uploadAreas = [];
        this.queue = new UploadQueue(options,callbacks);
    }

    setOptions(options: IUploadQueueOptions) : void {
        this.options = options;
    }

    registerArea(element: Element, options: IUploadAreaOptions) : UploadArea {
        var uploadArea = new UploadArea(element, options, this);
        this.uploadAreas.push(uploadArea);
        return uploadArea;
    }

    unregisterArea(area: UploadArea) : void {
        var areaIndex = this.uploadAreas.indexOf(area)
        if (areaIndex >= 0) {
          this.uploadAreas[areaIndex].destroy();
          this.uploadAreas.splice(areaIndex, 1);
        }
    }
}
