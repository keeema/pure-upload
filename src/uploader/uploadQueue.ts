class UploadQueue implements IUploadQueue {
    queuedFiles: IUploadFile[] = [];

    constructor(public options: IUploadQueueOptions, public callbacks:IUploadQueueCallbacks) {
        this.setFullOptions();
        this.setFullCallbacks();
    }

    filesChanged(): void {
        if (this.options.autoRemove)
            this.removeFinishedFiles();

        if (this.options.autoStart)
            this.startWaitingFiles();

        this.checkAllFinished();
        this.callbacks.onQueueChangedCallback(this.queuedFiles);
    }

    private checkAllFinished(): void {
        var unfinishedFiles = this.queuedFiles
            .filter(file=> [uploadStatus.queued, uploadStatus.uploading]
              .indexOf(file.uploadStatus) >= 0)

        if(unfinishedFiles.length == 0){
          this.callbacks.onAllFinishedCallback();
        }
    }

    addFiles(files: IUploadFile[]): void {
        files.forEach(file => {
            this.queuedFiles.push(file);
            file.uploadStatus = uploadStatus.queued;

            file.remove = () => {
                this.removeFile(file);
            }

            if (!file.start)
                file.start = () => { }

            if (!file.cancel)
                file.cancel = () => { }

            this.callbacks.onFileAddedCallback(file);
        });

        this.filesChanged()
    }

    removeFile(file: IUploadFile) {
        var index = this.queuedFiles.indexOf(file);

        if (index < 0)
            return;

        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);

        this.callbacks.onFileRemovedCallback(file);
        this.filesChanged()
    }

    clearFiles() {
        this.queuedFiles.forEach(file => this.deactivateFile(file));
        this.queuedFiles = [];
    }

    private setFullOptions(): void {
        this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
        this.options.autoStart = this.options.autoStart || false;
        this.options.autoRemove = this.options.autoRemove || false;

    }

    private setFullCallbacks(): void {
        this.callbacks.onFileAddedCallback = this.callbacks.onFileAddedCallback || (() => { });
        this.callbacks.onFileRemovedCallback = this.callbacks.onFileRemovedCallback || (() => { });
        this.callbacks.onAllFinishedCallback = this.callbacks.onAllFinishedCallback || (() => { });
        this.callbacks.onQueueChangedCallback = this.callbacks.onQueueChangedCallback || (() => { });
    }

    private startWaitingFiles(): void {
        var files = this.getWaitingFiles().forEach(file=> file.start())
    }

    private removeFinishedFiles(): void {
        this.queuedFiles
            .filter(file=> [
              uploadStatus.uploaded,
              uploadStatus.failed,
              uploadStatus.canceled
            ].indexOf(file.uploadStatus) >= 0)
            .forEach(file => this.removeFile(file));
    }

    private deactivateFile(file: IUploadFile) {
        if (file.uploadStatus == uploadStatus.uploading)
            file.cancel();

        file.uploadStatus = uploadStatus.removed;
        file.cancel = () => { };
        file.remove = () => { };
        file.start = () => { };
    }

    private getWaitingFiles() {
        if (!this.options.autoStart)
            return [];

        var result = this.queuedFiles
            .filter(file=> file.uploadStatus == uploadStatus.queued)

        if (this.options.maxParallelUploads > 0) {
            var uploadingFilesCount = this.queuedFiles
                .filter(file=> file.uploadStatus == uploadStatus.uploading)
                .length;

            var count = this.options.maxParallelUploads - uploadingFilesCount;

            if (count <= 0) {
                return [];
            }

            result = result.slice(0, count);
        }

        return result;
    }
}
