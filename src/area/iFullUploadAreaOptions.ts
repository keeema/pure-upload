interface IFullUploadAreaOptions extends IUploadAreaOptions {
  maxFileSize: number;
  allowDragDrop: boolean | (() => boolean);
  clickable: boolean | (() => boolean);
  accept: string;
  multiple: boolean;
  validateExtension: boolean;
  useCapture: boolean;

  localizer: ILocalizer;
}
