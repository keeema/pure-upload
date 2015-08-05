interface iPureUploader {
  uploadAreas: iUploadArea[];
  queue: iUploadQueue;
  uploaderOptions: iUploaderOptions;

  register(element: Element, options: any);
  setOptions(options: iUploaderOptions);
}
