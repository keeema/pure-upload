class UploadQueue implements IUploadQueue {
    queuedFiles: IUploadFile[] = [];

    addFiles(files: IUploadFile[]): void {
        files.forEach(file => {
            this.queuedFiles.push(file);
            file.uploadStatus = uploadStatus.queued;
            file.remove = () => this.removeFile(file);
        });
    }

    removeFile(file: IUploadFile) {
        var index = this.queuedFiles.indexOf(file);

        if (index < 0)
            return;

        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);
    }

    private deactivateFile(file: IUploadFile) {
        if (file.uploadStatus == uploadStatus.uploading)
            file.cancel();

        file.cancel = () => { };
        file.remove = () => { };
        file.start = () => { };
    }

    getWaitingFiles(maxParallelCount: number = 0) {
        var result = this.queuedFiles
            .filter(file=> file.uploadStatus == uploadStatus.queued)

        if (maxParallelCount > 0) {
            var uploadingFilesCount = this.queuedFiles
              .filter(file=> file.uploadStatus == uploadStatus.uploading)
              .length;

            var count = maxParallelCount - uploadingFilesCount;

            if(count <= 0)
              return [];

            result = result.slice(0, count);
        }

        return result;
    }

    clearFiles() {
        this.queuedFiles.forEach(file => this.deactivateFile(file));
        this.queuedFiles = [];
    }
}
