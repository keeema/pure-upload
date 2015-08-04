enum XhrUploadStatus {
    Uploading,
    Uploaded,
    Failed,
    Canceled
}

class XhrFile extends File {
    uploadStatus: XhrUploadStatus;
    responseCode: number;
    responseText: string;
    progress: number;
    sentBytes: number;
    cancel: () => void;
}
