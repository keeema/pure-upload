interface IUploadArea {
  targetElement: Element;
  uploadCore: any;
  uploadAreaOptions: any;
  queue: IUploadQueue;

  init() : void;
}
