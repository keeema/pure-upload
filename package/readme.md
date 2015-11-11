# Pure-upload
[![npm version](https://badge.fury.io/js/pure-upload.svg)](http://badge.fury.io/js/pure-upload)  [![Bower version](https://badge.fury.io/bo/pure-upload.svg)](http://badge.fury.io/bo/pure-upload)

The pure JS (TS) upload library with no dependencies compatible with Google Chrome, Firefox, IE10+ (IE9- with auto-start by default, manual-start optionally) and mobile browsers.

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
### Upload queue options
```typescript
maxParallelUploads?: number;
autoStart?: boolean;
autoRemove?: boolean;
```
### Upload queue callbacks
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

### Upload area
Upload area defines element registred in Uploader.

Registration:
```typescript
var uploadArea = uploader.registerArea(element, uploadAreaOptions);
```

Registration for IE9- with manual-start:
```typescript
var uploadArea = uploader.registerArea(element, uploadAreaOptions, compatibilityForm);
```
The *compatibilityForm* objects has to be *form* element containing one *input* element for *file* and one *input* element for *submit*.

Unregistration:
```typescript
uploader.unregisterArea(uploadArea);
```
### Upload area options
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

### Upload file
Standard *File* object extended with additional informations and methods to manage a file in queue.
```typescript
guid: string;
uploadStatus: IUploadStatus;
responseCode: number;
responseText: string;
progress: number;
sentBytes: number;
cancel: () => void;
remove: () => void;
start: () => void;
```

### Upload status
File statuses accesible by `pu.uploadStatus`.

Library used by [GMC Software Technology](http://www.gmchk.cz).

[![npm version](https://media.licdn.com/mpr/mpr/shrink_200_200/AAEAAQAAAAAAAAKkAAAAJDA3MDA4ODRmLWM2ZjQtNDYyNi04NjY2LWFhZjk3NjU3NDg4MQ.png)](http://www.gmchk.cz)
