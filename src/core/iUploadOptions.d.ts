interface IUploadOptions {
    url: string;
    method: string;
    withCredentials?: boolean;
    headers?: {
        [key: string]: any;
    };
    params?: {
        [key: string]: any;
    };
}
