declare class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    uploaderOptions: IUploadQueueOptions;
    constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks);
    setOptions(options: IUploadQueueOptions): void;
    registerArea(element: Element, options: IUploadAreaOptions): void;
    unregisterArea(area: UploadArea): void;
}
