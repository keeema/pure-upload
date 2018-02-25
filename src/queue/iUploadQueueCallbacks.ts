interface IUploadQueueCallbacks extends IUploadCallbacks {
  onFileAddedCallback?: (file: IUploadFile) => void;
  onFileRemovedCallback?: (file: IUploadFile) => void;
  onAllFinishedCallback?: () => void;
  onQueueChangedCallback?: (queue: IUploadFile[]) => void;
}
