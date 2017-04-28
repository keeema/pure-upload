interface IFullUploadOptions extends IUploadOptions {
    withCredentials: boolean;
    headers: { [key: string]: string | number | boolean };
    params: { [key: string]: string | number | boolean | Blob };
    localizer: ILocalizer;
}
