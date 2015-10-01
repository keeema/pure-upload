interface IFileExt extends File {
    kind: string;
    webkitGetAsEntry: () => File;
    getAsFile: () => File;
    file: (file: any) => void;

    isFile: boolean;
    isDirectory: boolean;
    fullPath: string;
}
