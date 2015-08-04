interface IXhrUploadOptions {
    url: string;
    method: string;
    withCredentials?: boolean;
    headers?: {[key:string]:any}
    params?: {[key:string]:any}

      onProgressCallback?: (file: XhrFile) => void;
    onCancelledCallback?: (file: XhrFile) => void;
    onFinishedCallback?: (file: XhrFile) => void;
    onUploadedCallback?: (file: XhrFile) => void;
    onErrorCallback?: (file: XhrFile) => void;
    onUploadStartedCallback?: (file: XhrFile) => void;

}
