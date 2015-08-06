interface IUploadQueue {
  queuedFiles: IUploadFile[];

  addFiles(files: IUploadFile[]);
  removeFile(file: IUploadFile);
  getWaitingFiles();
  getWaitingFiles(maxParallelCount:number);
  clearFiles();
}
