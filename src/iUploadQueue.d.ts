interface IUploadQueue {
  addFiles(files: IUploadFile[]);
  removeFile(file: IUploadFile);
  clearFiles();
}
