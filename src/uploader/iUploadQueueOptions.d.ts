interface IUploadQueueOptions {
    maxParallelUploads?: number;
    autoStart?: boolean;
    autoRemove?: boolean;

    onFileAddedCallback?: (file: IUploadFile) => void;
    onFileRemovedCallback?: (file: IUploadFile) => void;
    onAllFinishedCallback?: () => void;
    onQueueChangedCallback?: (queue: IUploadFile[]) => void;
}
