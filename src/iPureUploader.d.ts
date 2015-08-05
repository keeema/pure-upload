interface iPureUploader {
  uploadAreas: iUploadArea[];
  queue: IUploadQueue;
  uploaderOptions: iUploaderOptions;

  register(element: Element, options: any);
  setOptions(options: iUploaderOptions);
}
