class UploadArea implements IUploadArea {
    targetElement: Element;
    uploadCore: IUploadCore;
    uploadAreaOptions: IUploadAreaOptions;
    queue: IUploadQueue;

    constructor(element: Element, options: IUploadAreaOptions, queue: IUploadQueue) {
        this.targetElement = element;
        this.uploadAreaOptions = options;
        this.queue = queue;
    }

    init() : void {
        this.uploadCore = getUploadCore(this.uploadAreaOptions);
    }

    private setupListeners(): void {

    }

    private setupHiddenInput(): void {
      
    }
}
