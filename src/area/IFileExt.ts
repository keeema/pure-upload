// See: https://wicg.github.io/entries-api

type ErrorCallback = (err: DOMException) => void;

type FileCallback = (file: File) => void;

type FileSystemEntriesCallback = (entries: FileSystemEntry[]) => void;

interface FileSystemEntry {
    readonly isDirectory: boolean;
    readonly isFile: boolean;
    readonly name: string;
};

interface FileSystemDirectoryEntry extends FileSystemEntry {
    createReader(): FileSystemDirectoryReader;
};

interface FileSystemDirectoryReader {
    readEntries(successCallback: FileSystemEntriesCallback, errorCallback?: ErrorCallback): void;
};

interface FileSystemFileEntry extends FileSystemEntry {
    getAsFile(): File | null;
    file(successCallback: FileCallback, errorCallback?: ErrorCallback): void;
};

interface IFileExt extends File {
    fullPath: string;
    kind: string;
};