interface IUploadArea {
  targetElement: Element;
  uploadCore: IUploadCore;
  uploadAreaOptions: IUploadAreaOptions;
  queue: IUploadQueue;

  init() : void;
}
