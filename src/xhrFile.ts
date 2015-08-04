enum XhrUploadStatus {
    Queued,
    Uploading,
    Uploaded,
    Failed
}

class XhrFile extends File {
    xhr: XMLHttpRequest;
    uploadStatus: XhrUploadStatus;
    responseStatus: number;
    progress: number;
    sentBytes: number;
    cancel: () => void;
}
