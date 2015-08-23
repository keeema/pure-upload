# Pure-upload
[![npm version](https://badge.fury.io/js/pure-upload.svg)](http://badge.fury.io/js/pure-upload)

## Installation
1. Dowload as a ZIP file directly from [GitHub](https://github.com/keeema/pure-upload/archive/master.zip) pages and include to your project.
2. Install with npm by `npm install pure-upload --save`.
3. Install with bower by `bower install pure-upload`.

## Example
See a simple [example](http://keeema.github.io/pure-upload).

## Api
### Uploader
Uploader manages upload queue and registers upload areas.

Initialization:
```typescript
var uploader = pu.getUploader(uploadQueueOptions, uploadQueueCallbacks)
```


### UploadQueue options
```typescript
maxParallelUploads?: number;
autoStart?: boolean;
autoRemove?: boolean;
```
### UploadQueue callbacks
```typescript
onProgressCallback?: (file: IUploadFile) => void;
onCancelledCallback?: (file: IUploadFile) => void;
onFinishedCallback?: (file: IUploadFile) => void;
onUploadedCallback?: (file: IUploadFile) => void;
onErrorCallback?: (file: IUploadFile) => void;
onUploadStartedCallback?: (file: IUploadFile) => void;
onFileAddedCallback?: (file: IUploadFile) => void;
onFileRemovedCallback?: (file: IUploadFile) => void;
onAllFinishedCallback?: () => void;
onQueueChangedCallback?: (queue: IUploadFile[]) => void;
onFilesAddedErrorCallback?: (files: IUploadFile[]) => void;
```

### UploadArea
Upload area defines element registred in Uploader.

Registration:
```typescript
var uploadArea = uploader.registerArea(element, uploadAreaOptions);
```
Unregistration:
```typescript
uploader.unregisterArea(uploadArea);
```
### UploadAreaOptions
```typescript
url: string;
method: string;
withCredentials?: boolean;
headers?: { [key: string]: any; };
params?: { [key: string]: any; };
maxFileSize?: number;
allowDragDrop?: boolean;
clickable?: boolean;
accept?: string;
multiple?: boolean;
```
