declare var getUploadCore: (options: IUploadOptions, callbacks:IUploadCallbacks) => IUploadCore;

interface IUploadCore {
    options: IUploadOptions;
    callbacks:IUploadCallbacks
    upload(fileList: File[]| Object): void
}
