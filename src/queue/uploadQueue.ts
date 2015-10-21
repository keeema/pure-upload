class UploadQueue {
    options: IUploadQueueOptions;
    callbacks: IUploadQueueCallbacksExt;
    queuedFiles: IUploadFile[] = [];

    constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacksExt) {
        this.options = options;
        this.callbacks = callbacks;
        this.setFullOptions();
        this.setFullCallbacks();
    }

    addFiles(files: IUploadFile[]): void {
        forEach(files, file => {
            this.queuedFiles.push(file);
            file.guid = newGuid();

            file.remove = decorateSimpleFunction(file.remove, () => {
                this.removeFile(file);
            });

            this.callbacks.onFileAddedCallback(file);

            if (file.uploadStatus === uploadStatus.failed) {
                if (this.callbacks.onErrorCallback) {
                    this.callbacks.onErrorCallback(file);
                }
            } else {
                file.uploadStatus = uploadStatus.queued;
            }
        });

        this.filesChanged();
    }

    removeFile(file: IUploadFile, blockRecursive: boolean = false) {
        var index = this.queuedFiles.indexOf(file);

        if (index < 0)
            return;

        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);

        this.callbacks.onFileRemovedCallback(file);

        if (!blockRecursive)
            this.filesChanged();
    }

    clearFiles(excludeStatuses: IUploadStatus[] = [], cancelProcessing: boolean = false) {
        if (!cancelProcessing)
            excludeStatuses = excludeStatuses.concat([uploadStatus.queued, uploadStatus.uploading]);

        forEach(
            filter(this.queuedFiles, (file: IUploadFile) => excludeStatuses.indexOf(file.uploadStatus) < 0),
            file => this.removeFile(file, true)
        );

        this.callbacks.onQueueChangedCallback(this.queuedFiles);
    }

    private filesChanged(): void {
        if (this.options.autoRemove)
            this.removeFinishedFiles();

        if (this.options.autoStart)
            this.startWaitingFiles();

        this.callbacks.onQueueChangedCallback(this.queuedFiles);

        this.checkAllFinished();
    }

    private checkAllFinished(): void {
        var unfinishedFiles = filter(
            this.queuedFiles,
            file => [uploadStatus.queued, uploadStatus.uploading]
                .indexOf(file.uploadStatus) >= 0
        );

        if (unfinishedFiles.length === 0) {
            this.callbacks.onAllFinishedCallback();
        }
    }

    private setFullOptions(): void {
        this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
        this.options.autoStart = this.options.autoStart || false;
        this.options.autoRemove = this.options.autoRemove || false;

    }

    private setFullCallbacks(): void {
        this.callbacks.onFileAddedCallback = this.callbacks.onFileAddedCallback || (() => { return; });
        this.callbacks.onFileRemovedCallback = this.callbacks.onFileRemovedCallback || (() => { return; });
        this.callbacks.onAllFinishedCallback = this.callbacks.onAllFinishedCallback || (() => { return; });
        this.callbacks.onQueueChangedCallback = this.callbacks.onQueueChangedCallback || (() => { return; });

        this.callbacks.onFileStateChangedCallback = () => this.filesChanged();
    }

    private startWaitingFiles(): void {
        forEach(this.getWaitingFiles(), file => file.start());
    }

    private removeFinishedFiles(): void {
        forEach(
            filter(
                this.queuedFiles,
                file => [
                    uploadStatus.uploaded,
                    uploadStatus.canceled
                ].indexOf(file.uploadStatus) >= 0
            ),
            file => this.removeFile(file, true)
        );
    }

    private deactivateFile(file: IUploadFile) {
        if (file.uploadStatus === uploadStatus.uploading)
            file.cancel();

        file.uploadStatus = uploadStatus.removed;
        file.cancel = () => { return; };
        file.remove = () => { return; };
        file.start = () => { return; };
    }

    private getWaitingFiles() {
        if (!this.options.autoStart)
            return [];

        var result = filter(
            this.queuedFiles,
            file => file.uploadStatus === uploadStatus.queued
        );

        if (this.options.maxParallelUploads > 0) {
            var uploadingFilesCount = filter(
                this.queuedFiles,
                file => file.uploadStatus === uploadStatus.uploading
            ).length;

            var count = this.options.maxParallelUploads - uploadingFilesCount;

            if (count <= 0) {
                return [];
            }

            result = result.slice(0, count);
        }

        return result;
    }
}
