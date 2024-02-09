function castFiles(
  fileList: File[] | Object,
  status?: UploadStatus
): IUploadFile[] {
  let files: IUploadFile[];

  if (typeof fileList === "object") {
    files = Object.keys(fileList)
      .filter(key => key !== "length")
      .map(key => (<IFileOrObjectWithIndexer>fileList)[key]!);
  } else {
    files = <IUploadFile[]>fileList;
  }

  files.forEach((file: IUploadFile) => {
    file.uploadStatus = status || file.uploadStatus;
    file.responseCode = file.responseCode || 0;
    file.responseText = file.responseText || "";
    file.errorCode = file.errorCode;
    file.progress = file.progress || 0;
    file.sentBytes = file.sentBytes || 0;
    file.cancel =
      file.cancel ||
      (() => {
        return;
      });
  });

  return files;
}

interface IFileOrObjectWithIndexer {
  [key: string]: IUploadFile;
}
