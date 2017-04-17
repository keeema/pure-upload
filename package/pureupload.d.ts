declare module "pure-upload" {
export function addEventHandler(el: Element | HTMLElement, event: string, handler: (ev: UIEvent) => void): void;
export const isFileApi: boolean;
export function castFiles(fileList: File[] | Object, status?: UploadStatus): IUploadFile[];
export function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst?: boolean): () => void;
export function getUploadCore(options: IUploadOptions, callbacks: IUploadCallbacks): UploadCore;
export function getUploader(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader;
export function getValueOrResult<T>(valueOrGetter?: T | (() => T)): T | undefined;
export function newGuid(): string;
export interface IFileExt extends File {
    kind: string;
    webkitGetAsEntry: () => File;
    getAsFile: () => File;
    file: (callback: (file: IFileExt) => void) => void;
    createReader: Function;
    isFile: boolean;
    isDirectory: boolean;
    fullPath: string;
}
export interface IFullUploadAreaOptions extends IUploadAreaOptions {
    maxFileSize: number;
    allowDragDrop: boolean | (() => boolean);
    clickable: boolean | (() => boolean);
    accept: string;
    multiple: boolean;
    validateExtension: boolean;
    localizer: ILocalizer;
}
export interface IFullUploadOptions extends IUploadOptions {
    withCredentials: boolean;
    headers: {
        [key: string]: string | number | boolean;
    };
    params: {
        [key: string]: string | number | boolean;
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
    onFileAdded?: (file: IUploadFile) => void;
    onFileSelected?: (file: IUploadFile) => void;
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
        [key: string]: string | number | boolean;
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
export function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void): void;
export class UploadArea {
    targetElement: HTMLElement;
    uploader: Uploader;
    options: IFullUploadAreaOptions;
    private uploadCore;
    private fileInput;
    private fileList?;
    private unregisterOnClick;
    private unregisterOnDrop;
    private unregisterOnDragOver;
    private unregisterOnDragLeave;
    private unregisterOnDragOverGlobal;
    private unregisterOnDragLeaveGlobal;
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
    private registerEvents();
    private onChange(e);
    private onDrag(e);
    private onDragLeave();
    private onDragGlobal();
    private onDragLeaveGlobal();
    private removeDragOverStyle(style?);
    private addDragOverStyle(style?);
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
export class UploadCore {
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
export class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    options: IUploadQueueOptions;
    constructor(options?: IUploadQueueOptions, callbacks?: IUploadQueueCallbacks);
    setOptions(options: IUploadQueueOptions): void;
    registerArea(element: HTMLElement, options: IUploadAreaOptions): UploadArea;
    unregisterArea(area: UploadArea): void;
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
export enum UploadStatus {
    queued = 0,
    uploading = 1,
    uploaded = 2,
    failed = 3,
    canceled = 4,
    removed = 5,
}
}