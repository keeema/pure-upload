class Uploader implements IUploader {
    uploadAreas: IUploadArea[];
    queue: IUploadQueue;
    uploaderOptions: IUploaderOptions;

    setOptions(options: IUploaderOptions) : void {
        this.uploaderOptions = options;
    }

    registerArea(element: Element, options: IUploadAreaOptions) : void {
        var uploadArea = new UploadArea(element, options, this.queue);
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
