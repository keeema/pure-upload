interface iUploadArea {
  targetElement: Element;
  uploadCore: any;
  uploadAreaOptions: any;
  queue: IUploadQueue;

  init() : void;
}
