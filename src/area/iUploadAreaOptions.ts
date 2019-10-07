interface IUploadAreaOptions extends IUploadOptions {
  maxFileSize?: number;
  allowDragDrop?: boolean | (() => boolean);
  clickable?: boolean | (() => boolean);
  accept?: string;
  multiple?: boolean;
  validateExtension?: boolean;
  manualStart?: boolean;
  allowEmptyFile?: boolean;
  dragOverStyle?: string;
  dragOverGlobalStyle?: string;
  useCapture?: boolean;

  onFileAdded?: (file: IUploadFile) => void;
  onFileSelected?: (file: IUploadFile) => void;
  onFilesSelected?: (file: IUploadFile[]) => void;
  onFileError?: (file: IUploadFile) => void;
  onFileCanceled?: (file: IUploadFile) => void;
}
