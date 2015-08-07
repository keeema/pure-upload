interface IUploadQueue {
  options:IUploadQueueOptions;
  callbacks:IUploadQueueCallbacks;
  queuedFiles: IUploadFile[];

  addFiles(files: IUploadFile[]);
  removeFile(file: IUploadFile);
  filesChanged();
  clearFiles();
}
