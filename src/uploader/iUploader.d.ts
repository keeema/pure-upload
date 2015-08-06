declare var getUploader: (options: IUploaderOptions) => IUploader;

interface IUploader {
  uploadAreas: IUploadArea[];
  queue: IUploadQueue;
  uploaderOptions: IUploadQueueOptions;

  registerArea(element: Element, options: IUploadAreaOptions) : void;
  unregisterArea(area: IUploadArea) : void;
  setOptions(options: IUploadQueueOptions) : void;
}
