interface IUploadArea {
  targetElement: Element;
  options: IUploadAreaOptions;
  uploader: IUploader;

  destroy() : void;
}

interface IUploadAreaOptions extends IUploadOptions {
  maxFileSize: number;
  allowDragDrop: boolean;
  clickable: boolean;
  accept: string;
  multiple: boolean;
}

interface IUploadCallbacks {
    onProgressCallback?: (file: IUploadFile) => void;
    onCancelledCallback?: (file: IUploadFile) => void;
    onFinishedCallback?: (file: IUploadFile) => void;
    onUploadedCallback?: (file: IUploadFile) => void;
    onErrorCallback?: (file: IUploadFile) => void;
    onUploadStartedCallback?: (file: IUploadFile) => void;
}

declare var getUploadCore: (options: IUploadOptions, callbacks:IUploadCallbacks) => IUploadCore;

interface IUploadCore {
    options: IUploadOptions;
    callbacks:IUploadCallbacks
    upload(fileList: File[]| Object): void
}

interface IUploadFile extends File {
    uploadStatus: IUploadStatus;
    responseCode: number;
    responseText: string;
    progress: number;
    sentBytes: number;

    cancel: () => void;
    remove: () => void;
    start: () => void;
}

interface IUploadOptions {
    url: string;
    method: string;
    withCredentials?: boolean;
    headers?: {[key:string]:any}
    params?: {[key:string]:any}
}

interface IUploadStatus {
    queued: IUploadStatus,
    uploading: IUploadStatus,
    uploaded: IUploadStatus,
    failed: IUploadStatus,
    canceled: IUploadStatus,
    removed: IUploadStatus;
}

declare var uploadStatus: IUploadStatus;

interface IUploadQueue {
  options:IUploadQueueOptions;
  callbacks:IUploadQueueCallbacks;
  queuedFiles: IUploadFile[];

  addFiles(files: IUploadFile[]);
  removeFile(file: IUploadFile);
  clearFiles();
}

interface IUploadQueueCallbacks extends IUploadCallbacks {
    onFileAddedCallback?: (file: IUploadFile) => void;
    onFileRemovedCallback?: (file: IUploadFile) => void;
    onAllFinishedCallback?: () => void;
    onQueueChangedCallback?: (queue: IUploadFile[]) => void;
}

interface IUploadQueueOptions {
    maxParallelUploads?: number;
    autoStart?: boolean;
    autoRemove?: boolean;
}

declare var getUploader: (options: IUploadQueueOptions, callbacks: IUploadQueueCallbacks) => IUploader;

interface IUploader {
  uploadAreas: IUploadArea[];
  queue: IUploadQueue;
  uploaderOptions: IUploadQueueOptions;

  registerArea(element: Element, options: IUploadAreaOptions) : void;
  unregisterArea(area: IUploadArea) : void;
  setOptions(options: IUploadQueueOptions) : void;
}
