declare module pu {
    export function addEventHandler(el: Element | HTMLElement, event: string, handler: EventListenerOrEventListenerObject, useCapture: boolean): void;
    export const isFileApi: boolean;
    export function castFiles(fileList: File[] | Object, status?: UploadStatus): IUploadFile[];
    export function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst?: boolean): () => void;
    export function getUploadCore(options: IUploadOptions, callbacks: IUploadCallbacks): UploadCore;
    export function getUploader(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader;
    export function getValueOrResult<T>(valueOrGetter?: T | (() => T)): T | undefined;
    export function newGuid(): string;
    export type ErrorCallback = (err: DOMException) => void;
    type FilesCallback = (file: File[]) => void;
    export interface IFullUploadAreaOptions extends IUploadAreaOptions {
        maxFileSize: number;
        allowDragDrop: boolean | (() => boolean);
        clickable: boolean | (() => boolean);
        accept: string;
        multiple: boolean;
        validateExtension: boolean;
        useCapture: boolean;
        localizer: ILocalizer;
    }
    export interface IFullUploadOptions extends IUploadOptions {
        withCredentials: boolean;
        headers: {
            [key: string]: string | number | boolean;
        };
        params: {
            [key: string]: string | number | boolean | Blob;
        };
        localizer: ILocalizer;
    }
    export interface ILocalizer {
        fileSizeInvalid: (maxFileSize: number) => string;
        fileTypeInvalid: (accept: string) => string;
        invalidResponseFromServer: () => string;
    }
    export interface IOffsetInfo {
        running: boolean;
        fileCount: number;
    }
    export class ItemProcessor {
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
    export interface IUploadAreaOptions extends IUploadOptions {
        maxFileSize?: number;
        allowDragDrop?: boolean | (() => boolean);
        clickable?: boolean | (() => boolean);
        accept?: string;
        multiple?: boolean;
        validateExtension?: boolean;
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
    }
    export interface IUploadCallbacks {
        onProgressCallback?: (file: IUploadFile) => void;
        onCancelledCallback?: (file: IUploadFile) => void;
        onFinishedCallback?: (file: IUploadFile) => void;
        onUploadedCallback?: (file: IUploadFile) => void;
        onErrorCallback?: (file: IUploadFile) => void;
        onUploadStartedCallback?: (file: IUploadFile) => void;
    }
    export interface IUploadCallbacksExt extends IUploadCallbacks {
        onFileStateChangedCallback?: (file: IUploadFile) => void;
    }
    export interface IUploadFile extends File {
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
    export interface IUploadOptions {
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
    export interface IUploadQueueCallbacks extends IUploadCallbacks {
        onFileAddedCallback?: (file: IUploadFile) => void;
        onFileRemovedCallback?: (file: IUploadFile) => void;
        onAllFinishedCallback?: () => void;
        onQueueChangedCallback?: (queue: IUploadFile[]) => void;
    }
    export interface IUploadQueueCallbacksExt extends IUploadQueueCallbacks, IUploadCallbacksExt {
    }
    export interface IUploadQueueOptions {
        maxParallelUploads?: number;
        parallelBatchOffset?: number;
        autoStart?: boolean;
        autoRemove?: boolean;
    }
    export function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: EventListenerOrEventListenerObject): void;
    export class UploadArea {
        targetElement: HTMLElement;
        uploader: Uploader;
        options: IFullUploadAreaOptions;
        private uploadCore;
        private _fileInput?;
        private fileList?;
        private unregisterOnClick?;
        private unregisterOnDrop?;
        private unregisterOnDragOver?;
        private unregisterOnDragLeave?;
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
        private onDrag;
        private onDragLeave;
        private onDragGlobal;
        private onDragLeaveGlobal;
        private removeDragOverStyle;
        private addDragOverStyle;
        private onDrop;
        private isIeVersion;
        private onClick;
        private isFileSizeValid;
        private isFileTypeInvalid;
        private stopEventPropagation;
    }
    export class UploadCore {
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
    export class Uploader {
        uploadAreas: UploadArea[];
        queue: UploadQueue;
        options: IUploadQueueOptions;
        constructor(options?: IUploadQueueOptions, callbacks?: IUploadQueueCallbacks);
        registerArea(element: HTMLElement, options: IUploadAreaOptions): UploadArea;
        unregisterArea(area: UploadArea): void;
        get firstUploadArea(): UploadArea | undefined;
    }
    export class UploadQueue {
        offset: IOffsetInfo;
        options: IUploadQueueOptions;
        callbacks: IUploadQueueCallbacksExt;
        queuedFiles: IUploadFile[];
        constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacksExt);
        addFiles(files: IUploadFile[]): void;
        removeFile(file: IUploadFile, blockRecursive?: boolean): void;
        clearFiles(excludeStatuses?: UploadStatus[], cancelProcessing?: boolean): void;
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
    export enum UploadStatus {
        queued = 0,
        uploading = 1,
        uploaded = 2,
        failed = 3,
        canceled = 4,
        removed = 5
    }
    export {};
}
