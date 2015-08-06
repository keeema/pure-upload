var getUploader = function (options: IUploadQueueOptions): IUploader {
    return new Uploader(options);
}

class Uploader implements IUploader {
    uploadAreas: IUploadArea[];
    queue: IUploadQueue;
    uploaderOptions: IUploadQueueOptions;

    constructor(options: IUploadQueueOptions) {
        this.setOptions(options);
        this.uploadAreas = [];
        this.queue = new UploadQueue(options);
    }

    setOptions(options: IUploadQueueOptions) : void {
        this.uploaderOptions = options;
    }

    registerArea(element: Element, options: IUploadAreaOptions) : void {
        var uploadArea = new UploadArea(element, options, this);
        uploadArea.init();
        this.uploadAreas.push(uploadArea);
    }

    unregisterArea(area: IUploadArea) : void {
        var areaIndex = this.uploadAreas.indexOf(area)
        if (areaIndex >= 0) {
          this.uploadAreas.splice(areaIndex, 1);
        }
    }
}
