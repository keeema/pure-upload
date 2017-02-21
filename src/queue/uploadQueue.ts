class UploadQueue {
    offset: IOffsetInfo = { fileCount: 0, running: false };
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
        files.forEach(file => {
            if (!this.queuedFiles.some(queuedFile => queuedFile === file || (!!queuedFile.guid && queuedFile.guid === file.guid))) {
                this.queuedFiles.push(file);

                file.remove = decorateSimpleFunction(file.remove, () => {
                    this.removeFile(file);
                });
            }

            if (this.callbacks.onFileAddedCallback)
                this.callbacks.onFileAddedCallback(file);

            if (file.uploadStatus === UploadStatus.failed) {
                if (this.callbacks.onErrorCallback) {
                    this.callbacks.onErrorCallback(file);
                }
            } else {
                file.uploadStatus = UploadStatus.queued;
            }
        });

        this.filesChanged();
    }

    removeFile(file: IUploadFile, blockRecursive: boolean = false) {
        let index = this.queuedFiles.indexOf(file);

        if (index < 0)
            return;

        this.deactivateFile(file);
        this.queuedFiles.splice(index, 1);

        if (this.callbacks.onFileRemovedCallback)
            this.callbacks.onFileRemovedCallback(file);

        if (!blockRecursive)
            this.filesChanged();
    }

    clearFiles(excludeStatuses: UploadStatus[] = [], cancelProcessing: boolean = false) {
        if (!cancelProcessing)
            excludeStatuses = excludeStatuses.concat([UploadStatus.queued, UploadStatus.uploading]);

        this.queuedFiles
            .filter((file: IUploadFile) => excludeStatuses.indexOf(file.uploadStatus) < 0)
            .forEach(file => this.removeFile(file, true)
            );

        if (this.callbacks.onQueueChangedCallback)
            this.callbacks.onQueueChangedCallback(this.queuedFiles);
    }

    private filesChanged(): void {
        if (this.options.autoRemove)
            this.removeFinishedFiles();

        if (this.options.autoStart)
            this.startWaitingFiles();

        if (this.callbacks.onQueueChangedCallback)
            this.callbacks.onQueueChangedCallback(this.queuedFiles);

        this.checkAllFinished();
    }

    private checkAllFinished(): void {
        const unfinishedFiles = this.queuedFiles
            .filter(file => [UploadStatus.queued, UploadStatus.uploading].indexOf(file.uploadStatus) >= 0);

        if (unfinishedFiles.length === 0 && this.callbacks.onAllFinishedCallback) {
            this.callbacks.onAllFinishedCallback();
        }
    }

    private setFullOptions(): void {
        this.options.maxParallelUploads = this.options.maxParallelUploads || 0;
        this.options.parallelBatchOffset = this.options.parallelBatchOffset || 0;
        this.options.autoStart = isFileApi && (this.options.autoStart || false);
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
        this.getWaitingFiles().forEach(file => file.start());
    }

    private removeFinishedFiles(): void {
        this.queuedFiles
            .filter(file => [UploadStatus.uploaded, UploadStatus.canceled].indexOf(file.uploadStatus) >= 0)
            .forEach(file => this.removeFile(file, true));
    }

    private deactivateFile(file: IUploadFile) {
        if (file.uploadStatus === UploadStatus.uploading)
            file.cancel();

        file.uploadStatus = UploadStatus.removed;
        file.cancel = () => { return; };
        file.remove = () => { return; };
        file.start = () => { return; };
    }

    private getWaitingFiles() {
        if (!this.options.autoStart)
            return [];

        let result = this.queuedFiles.filter(file => file.uploadStatus === UploadStatus.queued);

        if (this.options.maxParallelUploads) {
            const uploadingFilesCount = this.queuedFiles.filter(file => file.uploadStatus === UploadStatus.uploading).length;

            let count = Math.min(result.length, this.options.maxParallelUploads - uploadingFilesCount);

            if (count <= 0) {
                return [];
            }

            if (this.options.parallelBatchOffset) {
                if (!this.offset.running) {
                    this.startOffset();
                }

                count = Math.min(this.offset.fileCount + count, this.options.maxParallelUploads) - this.offset.fileCount;
                this.offset.fileCount += count;
            }

            result = result.slice(0, count);
        }

        return result;
    }

    private startOffset() {
        this.offset.fileCount = 0;
        this.offset.running = true;

        setTimeout(
            () => {
                this.offset.fileCount = 0;
                this.offset.running = false;
                this.filesChanged();
            },
            this.options.parallelBatchOffset
        );
    }
}
