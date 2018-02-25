interface IUploadCallbacksExt extends IUploadCallbacks {
  onFileStateChangedCallback?: (file: IUploadFile) => void;
}
