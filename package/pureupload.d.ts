declare module "pure-upload" {
export function addEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void): void;
export let isFileApi: boolean;
export function castFiles(fileList: File[] | Object, status?: IUploadStatus): IUploadFile[];
export function filter<T>(input: T[], filterFn: (item: T) => boolean): T[];
export function forEach<T>(input: T[], callback: (item: T, index?: number) => void): void;
export function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst?: boolean): () => void;
export var getUploadCore: (options: IUploadOptions, callbacks: IUploadCallbacks) => UploadCore;
export var getUploader: (options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks) => Uploader;
export function newGuid(): string;
export interface IFileExt extends File {
    kind: string;
    webkitGetAsEntry: () => File;
    getAsFile: () => File;
    file: (file: any) => void;
    isFile: boolean;
    isDirectory: boolean;
    fullPath: string;
}
export function indexOf<T>(input: T[], item: T): number;
export interface IUploadAreaOptions extends IUploadOptions {
    maxFileSize?: number;
    allowDragDrop?: boolean;
    clickable?: boolean;
    accept?: string;
    multiple?: boolean;
    validateExtension?: boolean;
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
    uploadStatus: IUploadStatus;
    responseCode: number;
    responseText: string;
    progress: number;
    sentBytes: number;
    cancel: () => void;
    remove: () => void;
    start: () => void;
}
export interface IUploadOptions {
    url: string | ((file: IUploadFile) => string);
    method: string;
    withCredentials?: boolean;
    headers?: {
        [key: string]: any;
    };
    params?: {
        [key: string]: any;
    };
    localizer?: (message: string, params?: Object) => string;
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
    autoStart?: boolean;
    autoRemove?: boolean;
}
export interface IUploadStatus {
    queued: IUploadStatus;
    uploading: IUploadStatus;
    uploaded: IUploadStatus;
    failed: IUploadStatus;
    canceled: IUploadStatus;
    removed: IUploadStatus;
}
export function keys(obj: Object): any[];
export function map<T, K>(input: T[], mapper: (item: T) => K): K[];
export function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void): void;
export class UploadArea {
    targetElement: HTMLElement;
    options: IUploadAreaOptions;
    uploader: Uploader;
    private uploadCore;
    private fileInput;
    private formForNoFileApi;
    private formForNoFileApiProvided;
    private lastIframe;
    private unregisterOnClick;
    private unregisterOnDrop;
    private unregisterOnDragOver;
    private unregisterOnChange;
    private unregisterFormOnChange;
    constructor(targetElement: HTMLElement, options: IUploadAreaOptions, uploader: Uploader, formForNoFileApi?: HTMLFormElement);
    destroy(): void;
    private setFullOptions(options);
    private putFilesToQueue(fileList, form);
    private validateFile(file);
    private setupFileApiElements();
    private setupOldSchoolElements();
    private createFormWrapper();
    private decorateInputForm();
    private findInnerSubmit();
    private onFormChange(e, fileInput, submitInput);
    private addTargetIframe();
    private onChange(e);
    private onDrag(e);
    private onDrop(e);
    private isIeVersion(v?);
    private onClick();
    private addFilesFromItems(items);
    private processDirectory(directory, path);
    private handleFiles(files);
    private isFileSizeValid(file);
    private isFileTypeInvalid(file);
    private stopEventPropagation(e);
}
export class UploadCore {
    options: IUploadOptions;
    callbacks: IUploadCallbacksExt;
    constructor(options: IUploadOptions, callbacks?: IUploadCallbacksExt);
    upload(fileList: File[] | Object): void;
    getUrl(file: IUploadFile): string;
    private processFile(file);
    private createRequest(file);
    private setHeaders(xhr, fileName);
    private setCallbacks(xhr, file);
    private send(xhr, file);
    private createFormData(file);
    private handleError(file, xhr);
    private updateProgress(file, e?);
    private onload(file, xhr);
    private finished(file, xhr);
    private setResponse(file, xhr);
    private setFullOptions(options);
    private setFullCallbacks(callbacks);
}
export class Uploader {
    uploadAreas: UploadArea[];
    queue: UploadQueue;
    options: IUploadQueueOptions;
    constructor(options?: IUploadQueueOptions, callbacks?: IUploadQueueCallbacks);
    setOptions(options: IUploadQueueOptions): void;
    registerArea(element: HTMLElement, options: IUploadAreaOptions, compatibilityForm?: Element): UploadArea;
    unregisterArea(area: UploadArea): void;
}
export class UploadQueue {
    options: IUploadQueueOptions;
    callbacks: IUploadQueueCallbacksExt;
    queuedFiles: IUploadFile[];
    constructor(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacksExt);
    addFiles(files: IUploadFile[]): void;
    removeFile(file: IUploadFile, blockRecursive?: boolean): void;
    clearFiles(excludeStatuses?: IUploadStatus[], cancelProcessing?: boolean): void;
    private filesChanged();
    private checkAllFinished();
    private setFullOptions();
    private setFullCallbacks();
    private startWaitingFiles();
    private removeFinishedFiles();
    private deactivateFile(file);
    private getWaitingFiles();
}
export class UploadStatusStatic {
    static queued: string;
    static uploading: string;
    static uploaded: string;
    static failed: string;
    static canceled: string;
    static removed: string;
}
export var uploadStatus: IUploadStatus;
}