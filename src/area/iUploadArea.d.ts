interface IUploadArea {
  targetElement: Element;
  options: IUploadAreaOptions;
  uploader: IUploader;

  destroy() : void;
}
