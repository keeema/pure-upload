interface IUploadQueue {
  queuedFiles: IUploadFile[];

  addFiles(files: IUploadFile[]);
  removeFile(file: IUploadFile);
  clearFiles();
}
