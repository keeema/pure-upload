declare class UploadCore {
    options: IUploadOptions;
    callbacks: IUploadCallbacksExt;
    constructor(options: IUploadOptions, callbacks: IUploadCallbacksExt);
    upload(fileList: File[] | Object): void;
    private processFile(file);
    private createRequest();
    private setHeaders(xhr);
    private setCallbacks(xhr, file);
    private send(xhr, file);
    private createFormData(file);
    private handleError(file, xhr);
    private updateProgress(file, e?);
    private onload(file, xhr);
    private finished(file, xhr);
    private setResponse(file, xhr);
    private setFullOptions(options);
    private setFullCallbacks(callbacks);
}
