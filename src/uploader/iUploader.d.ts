interface IUploader {
  uploadAreas: IUploadArea[];
  queue: IUploadQueue;
  uploaderOptions: IUploaderOptions;

  register(element: Element, options: any);
  setOptions(options: IUploaderOptions);
}
