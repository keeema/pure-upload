declare var getUploadCore: (options: IUploadOptions) => IUploadCore;

interface IUploadCore {
    upload(fileList: File[]| Object): void
}

interface IUploadStatus {
    uploading: IUploadStatus,
    uploaded: IUploadStatus,
    failed: IUploadStatus,
    canceled: IUploadStatus
}

declare var uploadStatus: IUploadStatus;
