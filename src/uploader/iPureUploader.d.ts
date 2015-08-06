interface IPureUploader {
  uploadAreas: IUploadArea[];
  queue: IUploadQueue;
  uploaderOptions: IUploaderOptions;

  registerArea(element: Element, options: IUploadAreaOptions) : void;
  unregisterArea(area: IUploadArea) : void;
  setOptions(options: IUploaderOptions) : void;
}
