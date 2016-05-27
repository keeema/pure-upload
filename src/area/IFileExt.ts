interface IFileExt extends File {
    kind: string;
    webkitGetAsEntry: () => File;
    getAsFile: () => File;
    file: (callback: (file: IFileExt) => void) => void;

    isFile: boolean;
    isDirectory: boolean;
    fullPath: string;
}
