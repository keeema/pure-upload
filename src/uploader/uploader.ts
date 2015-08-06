var getUploader = function (options: IUploaderOptions): IUploader {
    return new Uploader(options);
}

class Uploader implements IUploader {
    uploadAreas: IUploadArea[];
    queue: IUploadQueue;
    uploaderOptions: IUploaderOptions;

    constructor(options: IUploaderOptions) {
        this.setOptions(options);
        this.uploadAreas = [];
    }

    setOptions(options: IUploaderOptions) : void {
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
