var getUploader = function (options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): IUploader {
    return new Uploader(options, callbacks);
}

class Uploader implements IUploader {
    uploadAreas: IUploadArea[];
    queue: IUploadQueue;
    uploaderOptions: IUploadQueueOptions;

    constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks) {
        this.setOptions(options);
        this.uploadAreas = [];
        this.queue = new UploadQueue(options,callbacks);
    }

    setOptions(options: IUploadQueueOptions) : void {
        this.uploaderOptions = options;
    }

    registerArea(element: Element, options: IUploadAreaOptions) : void {
        var uploadArea = new UploadArea(element, options, this);
        this.uploadAreas.push(uploadArea);
    }

    unregisterArea(area: IUploadArea) : void {
        var areaIndex = this.uploadAreas.indexOf(area)
        if (areaIndex >= 0) {
          this.uploadAreas.splice(areaIndex, 1);
        }
    }
}
