var getUploader = function (options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader {
    return new Uploader(options, callbacks);
}
