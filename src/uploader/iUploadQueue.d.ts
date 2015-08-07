interface IUploadQueue {
  options:IUploadQueueOptions;
  queuedFiles: IUploadFile[];

  addFiles(files: IUploadFile[]);
  removeFile(file: IUploadFile);
  filesChanged();
  clearFiles();
}
