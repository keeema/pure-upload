class UploadQueue implements IUploadQueue {
    private queuedFiles: IUploadFile[] = [];

    addFiles(files: IUploadFile[]): void {
        files.forEach(file => {
            this.queuedFiles.push(file)
            file.remove = () => this.removeFile(file);
        });
    }

    removeFile(file: IUploadFile) {
        var index = this.queuedFiles.indexOf(file);

        if (index < 0)
            return;

        this.deactivateFile(file);
    }

    private deactivateFile(file: IUploadFile) {
        if (file.uploadStatus == uploadStatus.uploading)
            file.cancel();

        file.cancel = () => { };
        file.remove = () => { };
        file.start = () => { };
    }

    clearFiles() {
        this.queuedFiles.forEach(file => this.deactivateFile(file));
        this.queuedFiles = [];
    }
}
