function castFiles(fileList: File[]| Object, status?: UploadStatus): IUploadFile[] {
    let files: IUploadFile[];

    if (typeof fileList === 'object') {
        files = map(
            filter(keys(fileList), (key) => key !== 'length'),
            (key) => fileList[key]
        );
    } else {
        files = <IUploadFile[]>fileList;
    }

    forEach(files, (file: IUploadFile) => {
      file.uploadStatus = status || file.uploadStatus;
      file.responseCode = file.responseCode || 0;
      file.responseText = file.responseText || '';
      file.progress = file.progress || 0;
      file.sentBytes = file.sentBytes || 0;
      file.cancel = file.cancel || (() => { return; });
    });

    return files;
}
