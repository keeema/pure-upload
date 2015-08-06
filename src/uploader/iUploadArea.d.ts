interface IUploadArea {
  targetElement: Element;
  uploadCore: IUploadCore;
  uploadAreaOptions: IUploadAreaOptions;
  uploader: IUploader;

  init() : void;
}
