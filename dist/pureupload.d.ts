declare module pu {
    function addEventHandler(el: Element | HTMLElement, event: string, handler: EventListenerOrEventListenerObject, useCapture: boolean): void;
    enum ErrorCode {
        NoError = 0,
        FileSizeExceeded = 1,
        UnsupportedFileFormat = 2,
        XhrResponseError = 3
    }
    const isFileApi: boolean;
    function castFiles(fileList: File[] | Object, status?: UploadStatus): IUploadFile[];
    function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst?: boolean): () => void;
    function getUploadCore(options: IUploadOptions, callbacks: IUploadCallbacks): UploadCore;
    function getUploader(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader;
    function getValueOrResult<T>(valueOrGetter?: T | (() => T)): T | undefined;
    function newGuid(): string;
    type FilesCallback = (file: File[]) => void;
    interface IFullUploadAreaOptions extends IUploadAreaOptions {
        maxFileSize: number;
        allowDragDrop: boolean | (() => boolean);
        clickable: boolean | (() => boolean);
        accept: string;
        multiple: boolean;
        validateExtension: boolean;
        validateMissingExtension: boolean;
        useCapture: boolean;
        localizer: ILocalizer;
    }
    interface IFullUploadOptions extends IUploadOptions {
        withCredentials: boolean;
        headers: {
            [key: string]: string | number | boolean;
        };
        params: {
            [key: string]: string | number | boolean | Blob;
        };
        localizer: ILocalizer;
    }
    interface ILocalizer {
        fileSizeInvalid: (maxFileSize: number) => string;
        fileTypeInvalid: (accept: string) => string;
        fileTypeMissing: () => string;
        invalidResponseFromServer: () => string;
    }
    interface IOffsetInfo {
        running: boolean;
        fileCount: number;
    }
    class ItemProcessor {
        errors: Error[];
        files: File[];
        private constructor();
        static processItems(items: DataTransferItem[] | DataTransferItemList, callback?: FilesCallback): void;
        processItems(items: DataTransferItem[] | DataTransferItemList, callback?: () => void): void;
        private processEntries;
        private processEntry;
        private processDirectoryEntry;
        private processFileEntry;
        private processFile;
        private callbackAfter;
        private pushAndCallback;
        private toValidItems;
        private isFileSystemFileEntry;
        private isFileSystemDirectoryEntry;
    }
    interface IUploadAreaOptions extends IUploadOptions {
        maxFileSize?: number;
        allowDragDrop?: boolean | (() => boolean);
        clickable?: boolean | (() => boolean);
        accept?: string;
        multiple?: boolean;
        validateExtension?: boolean;
        validateMissingExtension?: boolean;
        manualStart?: boolean;
        allowEmptyFile?: boolean;
        dragOverStyle?: string;
        dragOverGlobalStyle?: string;
        useCapture?: boolean;
        onFileAdded?: (file: IUploadFile) => void;
        onFileSelected?: (file: IUploadFile) => void;
        onFilesSelected?: (file: IUploadFile[]) => void;
        onFileError?: (file: IUploadFile) => void;
        onFileCanceled?: (file: IUploadFile) => void;
        onDragEnter?: () => void;
        onDragOver?: () => void;
        onDragLeave?: () => void;
        onDragEnterGlobal?: () => void;
        onDragOverGlobal?: () => void;
        onDragLeaveGlobal?: () => void;
        onDrop?: () => void;
        onDropGlobal?: () => void;
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
        uploadStatus?: UploadStatus;
        responseCode: number;
        responseText: string;
        progress: number;
        sentBytes: number;
        errorCode: ErrorCode;
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
            [key: string]: string | number | boolean | Blob;
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
    function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    class UploadArea {
        targetElement: HTMLElement;
        uploader: Uploader;
        options: IFullUploadAreaOptions;
        private uploadCore;
        private _fileInput?;
        private fileList?;
        private unregisterOnClick?;
        private unregisterOnDrop?;
        private unregisterOnDropGlobal?;
        private unregisterOnDragEnter?;
        private unregisterOnDragOver?;
        private unregisterOnDragLeave?;
        private unregisterOnDragEnterGlobal?;
        private unregisterOnDragOverGlobal?;
        private unregisterOnDragLeaveGlobal?;
        private unregisterOnChange?;
        constructor(targetElement: HTMLElement, options: IUploadAreaOptions, uploader: Uploader);
        start(autoClear?: boolean, files?: IUploadFile[]): void;
        clear(files?: IUploadFile[]): void;
        destroy(): void;
        get fileInput(): HTMLInputElement | undefined;
        private defaultOptions;
        private selectFiles;
        private putFilesToQueue;
        private validateFile;
        private setupFileApiElements;
        private registerEvents;
        private onChange;
        private onDragEnter;
        private onDragOver;
        private onDragLeave;
        private onDragEnterGlobal;
        private onDragOverGlobal;
        private onDragLeaveGlobal;
        private removeDragOverStyle;
        private addDragOverStyle;
        private onDrop;
        private onDropGlobal;
        private isIeVersion;
        private onClick;
        private isFileSizeValid;
        private fileTypeMissing;
        private isFileTypeInvalid;
        private stopEventPropagation;
    }
    class UploadCore {
        options: IFullUploadOptions;
        callbacks: IUploadCallbacksExt;
        constructor(options: IUploadOptions, callbacks?: IUploadCallbacksExt);
        upload(fileList: File[] | Object): void;
        getUrl(file: IUploadFile): string;
        private processFile;
        private createRequest;
        private setHeaders;
        private setCallbacks;
        private send;
        private createFormData;
        private castParamType;
        private isNumber;
        private isBoolean;
        private handleError;
        private updateProgress;
        private onload;
        private finished;
        private setResponse;
        private getDefaultOptions;
        private setFullCallbacks;
    }
    class Uploader {
        uploadAreas: UploadArea[];
        queue: UploadQueue;
        options: IUploadQueueOptions;
        constructor(options?: IUploadQueueOptions, callbacks?: IUploadQueueCallbacks);
        registerArea(element: HTMLElement, options: IUploadAreaOptions): UploadArea;
        unregisterArea(area: UploadArea): void;
        get firstUploadArea(): UploadArea | undefined;
    }
    class UploadQueue {
        offset: IOffsetInfo;
        options: IUploadQueueOptions;
        callbacks: IUploadQueueCallbacksExt;
        queuedFiles: IUploadFile[];
        constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacksExt);
        addFiles(files: IUploadFile[]): void;
        removeFile(file: IUploadFile, blockRecursive?: boolean): void;
        clearFiles(excludeStatuses?: Array<UploadStatus | undefined>, cancelProcessing?: boolean): void;
        private filesChanged;
        private checkAllFinished;
        private setFullOptions;
        private setFullCallbacks;
        private startWaitingFiles;
        private removeFinishedFiles;
        private deactivateFile;
        private getWaitingFiles;
        private startOffset;
    }
    enum UploadStatus {
        queued = 0,
        uploading = 1,
        uploaded = 2,
        failed = 3,
        canceled = 4,
        removed = 5
    }
}
