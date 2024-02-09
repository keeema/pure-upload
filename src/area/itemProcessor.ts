class ItemProcessor {
    errors: Error[] = [];
    files: File[] = [];

    private constructor() {}

    static processItems(items: DataTransferItem[] | DataTransferItemList, callback?: FilesCallback): void {
        const processor = new ItemProcessor();
        processor.processItems(items, () => callback && callback(processor.files));
    }

    processItems(items: DataTransferItem[] | DataTransferItemList, callback?: () => void): void {
        callback = this.callbackAfter(items.length, callback);
        this.toValidItems(items).forEach((item) => this.processEntry(item.webkitGetAsEntry(), "", callback));
    }

    private processEntries(entries: FileSystemEntry[], path: string = "", callback?: () => void): void {
        callback = this.callbackAfter(entries.length, callback);
        entries.forEach((entry) => this.processEntry(entry, path, callback));
    }

    private processEntry(entry: FileSystemEntry | null, path: string = "", callback?: () => void): void {
        if (!entry) return;
        if (this.isFileSystemDirectoryEntry(entry)) this.processDirectoryEntry(entry, path, callback);
        else if (this.isFileSystemFileEntry(entry)) this.processFileEntry(entry, path, callback);
        else if (callback !== undefined) callback(); // this.errors.push(new Error('...'))?
    }

    private processDirectoryEntry(entry: FileSystemDirectoryEntry, path: string = "", callback?: () => void): void {
        entry
            .createReader()
            .readEntries(
                (entries) => this.processEntries(entries, path + "/" + entry.name, callback),
                this.pushAndCallback(this.errors, callback)
            );
    }

    private processFileEntry(entry: FileSystemFileEntry, path: string = "", callback?: () => void): void {
        entry.file((file) => this.processFile(file, path, callback), this.pushAndCallback(this.errors, callback));
    }

    private processFile(file: File, path: string = "", callback?: () => void): void {
        (file as IFileExt).fullPath = path + "/" + file.name;
        this.pushAndCallback(this.files, callback)(file);
    }

    private callbackAfter(i: number, callback?: () => void) {
        return () => (--i === 0 && callback !== undefined ? callback() : i);
    }

    private pushAndCallback<T>(array: T[], callback?: () => void) {
        return (item: T) => {
            array.push(item);
            if (callback !== undefined) callback();
        };
    }

    private toValidItems(items: DataTransferItem[] | DataTransferItemList): DataTransferItem[] {
        const validItems = [];

        for (let i = 0; i < items.length; ++i) {
            if (items[i]!.webkitGetAsEntry !== undefined && items[i]!.webkitGetAsEntry !== null) {
                validItems.push(items[i]!);
            }
        }

        return validItems;
    }

    private isFileSystemFileEntry(entry: FileSystemEntry | FileSystemFileEntry): entry is FileSystemFileEntry {
        return entry.isFile;
    }

    private isFileSystemDirectoryEntry(entry: FileSystemEntry | FileSystemDirectoryEntry): entry is FileSystemDirectoryEntry {
        return entry.isDirectory;
    }
}
