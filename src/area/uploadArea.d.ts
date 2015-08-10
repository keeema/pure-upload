declare class UploadArea {
    targetElement: Element;
    options: IUploadAreaOptions;
    uploader: Uploader;
    private uploadCore;
    private fileInput;
    constructor(targetElement: Element, options: IUploadAreaOptions, uploader: Uploader);
    private putFilesToQueue(fileList);
    private setupHiddenInput();
    private stopEventPropagation(e);
    destroy(): void;
}
