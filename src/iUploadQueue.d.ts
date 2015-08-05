interface iUploadQueue {
  queuedFiles: any[];

  addFiles(files: any[]);
  removeFile(file: any);
  clearFiles();
}
