interface IUploadAreaOptions extends IUploadOptions {
    maxFileSize?: number;
    allowDragDrop?: boolean;
    clickable?: boolean;
    accept?: string;
    multiple?: boolean;
    validateExtension?: boolean;
    
    onFileAdded?: (file: IUploadFile) => void;
    onFileError?: (file: IUploadFile) => void; 
}
