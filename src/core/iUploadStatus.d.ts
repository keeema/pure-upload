interface IUploadStatus {
    queued: IUploadStatus,
    uploading: IUploadStatus,
    uploaded: IUploadStatus,
    failed: IUploadStatus,
    canceled: IUploadStatus,
    removed: IUploadStatus;
}

declare var uploadStatus: IUploadStatus;
