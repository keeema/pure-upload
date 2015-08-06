interface IUploadOptions {
    url: string;
    method: string;
    withCredentials?: boolean;
    headers?: {[key:string]:any}
    params?: {[key:string]:any}

    onProgressCallback?: (file: IUploadFile) => void;
    onCancelledCallback?: (file: IUploadFile) => void;
    onFinishedCallback?: (file: IUploadFile) => void;
    onUploadedCallback?: (file: IUploadFile) => void;
    onErrorCallback?: (file: IUploadFile) => void;
    onUploadStartedCallback?: (file: IUploadFile) => void;
}
