# Pure-upload
[![npm version](https://badge.fury.io/js/pure-upload.svg)](http://badge.fury.io/js/pure-upload)  [![Bower version](https://badge.fury.io/bo/pure-upload.svg)](http://badge.fury.io/bo/pure-upload)

The pure JS (TS) upload library with no dependencies compatible with Google Chrome, Firefox, IE10+, Edge and modern mobile browsers.

## Installation
1. Dowload as a ZIP file directly from [GitHub](https://github.com/keeema/pure-upload/archive/master.zip) pages and include to your project.
2. Install with npm by `npm install pure-upload --save` or `yarn add pure-upload`.
3. Install with bower by `bower install pure-upload`.

## Example
See a simple [example](http://keeema.github.io/pure-upload).

## Api

### Using NPM package:
Import pure-upload with standard import syntax:

```typescript
import * as pu from 'pure-upload';
```

### Uploader
Uploader manages upload queue and registers upload areas.

Initialization:
```typescript
let uploader = pu.getUploader(uploadQueueOptions, uploadQueueCallbacks)
```
### Upload queue options
```typescript
maxParallelUploads?: number;
parallelBatchOffset?: number;
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
let uploadArea = uploader.registerArea(element, uploadAreaOptions);
```

Unregistration:
```typescript
uploader.unregisterArea(uploadArea);
```
### Upload area options
```typescript
url: string;
method: string;
withCredentials?: boolean;
headers?: { [key: string]: string; };
params?: { [key: string]: string; };
localizer?: ILocalizer;
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
```
### Upload area - manual starting
```typescript
start(autoClear?: boolean): void;
clear(): void;
```
### Localizer
```typescript
fileSizeInvalid: (maxFileSize: number) => string;
fileTypeInvalid: (accept: string) => string;
```
### Upload file
Standard *File* object extended with additional informations and methods to manage a file in queue.
```typescript
guid: string;
uploadStatus: UploadStatus;
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

MIT, Copyright &copy; 2015 Tomáš Růt
