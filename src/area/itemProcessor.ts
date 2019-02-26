class ItemProcessor {
    errors: Error[] = [];
    files: File[] = [];

    processItems(items: DataTransferItem[] | DataTransferItemList, callback?: Function): void {
        callback = callbackAfter(items.length, callback);
        toValidItems(items).forEach(item => this.processEntry(item.webkitGetAsEntry(), "", callback));
    }

    private processEntries(entries: FileSystemEntry[], path: string = "", callback?: Function): void {
        callback = callbackAfter(entries.length, callback)
        entries.forEach((entry) => this.processEntry(entry, path, callback));
    }

    private processEntry(entry: FileSystemEntry, path: string = "", callback?: Function): void {
        if (entry.isDirectory) this.processDirectoryEntry(entry as FileSystemDirectoryEntry, path, callback);
        else if (entry.isFile) this.processFileEntry(entry as FileSystemFileEntry, path, callback);
        else if (callback !== undefined) callback(); // this.errors.push(new Error('...'))?
    }

    private processDirectoryEntry(entry: FileSystemDirectoryEntry, path: string = "", callback?: Function): void {
        entry.createReader().readEntries(
            (entries) => this.processEntries(entries, path + "/" + entry.name, callback),
            pushAndCallback(this.errors, callback));
    }

    private processFileEntry(entry: FileSystemFileEntry, path: string = "", callback?: Function): void {
        entry.file((file) => this.processFile(file, path, callback), pushAndCallback(this.errors, callback));
    }

    private processFile(file: File, path: string = "", callback?: Function): void {
        (file as IFileExt).fullPath = path + "/" + file.name;
        pushAndCallback(this.files, callback)(file);
    }
}

function callbackAfter(i: number, callback?: Function) {
    return () => --i === 0 && callback !== undefined ? callback() : i;
}

function pushAndCallback<T>(array: T[], callback?: Function) {
    return (item: T) => { array.push(item); if (callback !== undefined) callback(); };
}

function toValidItems(items: DataTransferItem[] | DataTransferItemList): DataTransferItem[] {
    const validItems = [];

    for (let i = 0; i < items.length; ++i) {
        if (items[i].webkitGetAsEntry) {
            validItems.push(items[i]);
        }
    }

    return validItems;
}