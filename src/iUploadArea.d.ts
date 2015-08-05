interface iUploadArea {
  targetElement: Element;
  uploadCore: any;
  uploadAreaOptions: any;
  queue: iUploadQueue;

  init() : void;  
}
