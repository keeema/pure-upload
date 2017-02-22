interface IUploadAreaOptions extends IUploadOptions {
    maxFileSize?: number;
    allowDragDrop?: boolean | (() => boolean);
    clickable?: boolean | (() => boolean);
    accept?: string;
    multiple?: boolean;
    validateExtension?: boolean;
    manualStart?: boolean;

    onFileAdded?: (file: IUploadFile) => void;
    onFileSelected?: (file: IUploadFile) => void;
    onFileError?: (file: IUploadFile) => void;
    onFileCanceled?: (file: IUploadFile) => void;
}

interface IFullUploadAreaOptions extends IUploadAreaOptions {
    maxFileSize: number;
    allowDragDrop: boolean | (() => boolean);
    clickable: boolean | (() => boolean);
    accept: string;
    multiple: boolean;
    validateExtension: boolean;

    localizer: ILocalizer;
}