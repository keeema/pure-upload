declare module pu {
    function addEventHandler(el: Element | HTMLElement, event: string, handler: (ev: UIEvent) => void): void;
    const isFileApi: boolean;
    function castFiles(fileList: File[] | Object, status?: UploadStatus): IUploadFile[];
    function filter<T>(input: T[], filterFn: (item: T) => boolean): T[];
    function forEach<T>(input: T[], callback: (item: T, index?: number) => void): void;
    function decorateSimpleFunction(origFn: () => void, newFn: () => void, newFirst?: boolean): () => void;
    function getUploadCore(options: IUploadOptions, callbacks: IUploadCallbacks): UploadCore;
    function getUploader(options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks): Uploader;
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
    function indexOf<T>(input: T[], item: T): number;
    interface IUploadAreaOptions extends IUploadOptions {
        maxFileSize?: number;
        allowDragDrop?: boolean;
        clickable?: boolean;
        accept?: string;
        multiple?: boolean;
        validateExtension?: boolean;
        onFileAdded?: (file: IUploadFile) => void;
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
        localizer?: (message: string, params?: Object) => string;
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
        autoStart?: boolean;
        autoRemove?: boolean;
    }
    function keys(obj: Object): string[];
    function map<T, K>(input: T[], mapper: (item: T) => K): K[];
    function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void): void;
    class UploadArea {
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
        private putFilesToQueue(fileList);
        private validateFile(file);
        private setupFileApiElements();
        private setupOldSchoolElements();
        private createFormWrapper();
        private decorateInputForm();
        private findInnerSubmit();
        private fileListToList(files);
        private onFormChange(e, fileInput, submitInput);
        private addTargetIframe();
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
        options: IUploadOptions;
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
        private setFullOptions(options);
        private setFullCallbacks(callbacks);
    }
    class Uploader {
        uploadAreas: UploadArea[];
        queue: UploadQueue;
        options: IUploadQueueOptions;
        constructor(options?: IUploadQueueOptions, callbacks?: IUploadQueueCallbacks);
        setOptions(options: IUploadQueueOptions): void;
        registerArea(element: HTMLElement, options: IUploadAreaOptions, compatibilityForm?: Element): UploadArea;
        unregisterArea(area: UploadArea): void;
    }
    class UploadQueue {
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
