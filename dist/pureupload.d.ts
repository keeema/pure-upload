declare module pu {
    function addEventHandler(el: Element | HTMLElement, event: string, handler: (ev: UIEvent) => void): void;
    const isFileApi: boolean;
    function castFiles(fileList: File[] | Object, status?: UploadStatus): IUploadFile[];
    function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst?: boolean): () => void;
    function getUploadCore(options: IUploadOptions, callbacks: IUploadCallbacks): UploadCore;
    function getUploader(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader;
    function getValueOrResult<T>(valueOrGetter?: T | (() => T)): T | undefined;
    function newGuid(): string;
    interface IFileExt extends File {
        kind: string;
        webkitGetAsEntry: () => File;
        getAsFile: () => File;
        file: (callback: (file: IFileExt) => void) => void;
        createReader: Function;
        isFile: boolean;
        isDirectory: boolean;
        fullPath: string;
    }
    interface IFullUploadAreaOptions extends IUploadAreaOptions {
        maxFileSize: number;
        allowDragDrop: boolean | (() => boolean);
        clickable: boolean | (() => boolean);
        accept: string;
        multiple: boolean;
        validateExtension: boolean;
        localizer: ILocalizer;
    }
    interface IFullUploadOptions extends IUploadOptions {
        withCredentials: boolean;
        headers: {
            [key: string]: string | number | boolean;
        };
        params: {
            [key: string]: string | number | boolean;
        };
        localizer: ILocalizer;
    }
    interface ILocalizer {
        fileSizeInvalid: (maxFileSize: number) => string;
        fileTypeInvalid: (accept: string) => string;
        invalidResponseFromServer: () => string;
    }
    interface IOffsetInfo {
        running: boolean;
        fileCount: number;
    }
    interface IUploadAreaOptions extends IUploadOptions {
        maxFileSize?: number;
        allowDragDrop?: boolean | (() => boolean);
        clickable?: boolean | (() => boolean);
        accept?: string;
        multiple?: boolean;
        validateExtension?: boolean;
        manualStart?: boolean;
        onFileAdded?: (file: IUploadFile) => void;
        onFileSelected?: (file: IUploadFile) => void;
        onFileError?: (file: IUploadFile) => void;
        onFileCanceled?: (file: IUploadFile) => void;
    }
    interface IUploadCallbacks {
        onProgressCallback?: (file: IUploadFile) => void;
        onCancelledCallback?: (file: IUploadFile) => void;
        onFinishedCallback?: (file: IUploadFile) => void;
        onUploadedCallback?: (file: IUploadFile) => void;
        onErrorCallback?: (file: IUploadFile) => void;
        onUploadStartedCallback?: (file: IUploadFile) => void;
    }
    interface IUploadCallbacksExt extends IUploadCallbacks {
        onFileStateChangedCallback?: (file: IUploadFile) => void;
    }
    interface IUploadFile extends File {
        guid: string;
        url: string;
        uploadStatus: UploadStatus;
        responseCode: number;
        responseText: string;
        progress: number;
        sentBytes: number;
        cancel: () => void;
        remove: () => void;
        start: () => void;
        onError: (file: IUploadFile) => void;
        onCancel: (file: IUploadFile) => void;
    }
    interface IUploadOptions {
        url: string | ((file: IUploadFile) => string);
        method: string;
        withCredentials?: boolean;
        headers?: {
            [key: string]: string | number | boolean;
        };
        params?: {
            [key: string]: string | number | boolean;
        };
        localizer?: ILocalizer;
    }
    interface IUploadQueueCallbacks extends IUploadCallbacks {
        onFileAddedCallback?: (file: IUploadFile) => void;
        onFileRemovedCallback?: (file: IUploadFile) => void;
        onAllFinishedCallback?: () => void;
        onQueueChangedCallback?: (queue: IUploadFile[]) => void;
    }
    interface IUploadQueueCallbacksExt extends IUploadQueueCallbacks, IUploadCallbacksExt {
    }
    interface IUploadQueueOptions {
        maxParallelUploads?: number;
        parallelBatchOffset?: number;
        autoStart?: boolean;
        autoRemove?: boolean;
    }
    function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void): void;
    class UploadArea {
        targetElement: HTMLElement;
        uploader: Uploader;
        options: IFullUploadAreaOptions;
        private uploadCore;
        private fileInput;
        private fileList?;
        private unregisterOnClick;
        private unregisterOnDrop;
        private unregisterOnDragOver;
        private unregisterOnChange;
        constructor(targetElement: HTMLElement, options: IUploadAreaOptions, uploader: Uploader);
        start(autoClear?: boolean): void;
        clear(): void;
        destroy(): void;
        private defaultOptions();
        private selectFiles(fileList);
        private putFilesToQueue();
        private validateFile(file);
        private setupFileApiElements();
        private onChange(e);
        private onDrag(e);
        private onDrop(e);
        private isIeVersion(v);
        private onClick();
        private addFilesFromItems(items);
        private processDirectory(directory, path);
        private handleFiles(files);
        private isFileSizeValid(file);
        private isFileTypeInvalid(file);
        private stopEventPropagation(e);
    }
    class UploadCore {
        options: IFullUploadOptions;
        callbacks: IUploadCallbacksExt;
        constructor(options: IUploadOptions, callbacks?: IUploadCallbacksExt);
        upload(fileList: File[] | Object): void;
        getUrl(file: IUploadFile): string;
        private processFile(file);
        private createRequest(file);
        private setHeaders(xhr);
        private setCallbacks(xhr, file);
        private send(xhr, file);
        private createFormData(file);
        private handleError(file, xhr);
        private updateProgress(file, e?);
        private onload(file, xhr);
        private finished(file, xhr);
        private setResponse(file, xhr);
        private getDefaultOptions();
        private setFullCallbacks(callbacks);
    }
    class Uploader {
        uploadAreas: UploadArea[];
        queue: UploadQueue;
        options: IUploadQueueOptions;
        constructor(options?: IUploadQueueOptions, callbacks?: IUploadQueueCallbacks);
        setOptions(options: IUploadQueueOptions): void;
        registerArea(element: HTMLElement, options: IUploadAreaOptions): UploadArea;
        unregisterArea(area: UploadArea): void;
    }
    class UploadQueue {
        offset: IOffsetInfo;
        options: IUploadQueueOptions;
        callbacks: IUploadQueueCallbacksExt;
        queuedFiles: IUploadFile[];
        constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacksExt);
        addFiles(files: IUploadFile[]): void;
        removeFile(file: IUploadFile, blockRecursive?: boolean): void;
        clearFiles(excludeStatuses?: UploadStatus[], cancelProcessing?: boolean): void;
        private filesChanged();
        private checkAllFinished();
        private setFullOptions();
        private setFullCallbacks();
        private startWaitingFiles();
        private removeFinishedFiles();
        private deactivateFile(file);
        private getWaitingFiles();
        private startOffset();
    }
    enum UploadStatus {
        queued = 0,
        uploading = 1,
        uploaded = 2,
        failed = 3,
        canceled = 4,
        removed = 5,
    }
}
