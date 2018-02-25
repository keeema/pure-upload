interface IFileExt extends File {
  kind: string;
  webkitGetAsEntry: () => File;
  getAsFile: () => File;
  file: (callback: (file: IFileExt) => void) => void;
  createReader: Function;
  isFile: boolean;
  isDirectory: boolean;
  fullPath: string;
}
