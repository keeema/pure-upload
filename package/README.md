# Pure-upload

[![npm version](https://badge.fury.io/js/pure-upload.svg)](https://www.npmjs.com/package/pure-upload) [![Bower version](https://badge.fury.io/bo/pure-upload.svg)](http://badge.fury.io/bo/pure-upload)

The pure JS (TS) upload library with no dependencies compatible with Google Chrome, Firefox, IE10+, Edge and modern mobile browsers.

## Installation

1. Download as a ZIP file directly from [GitHub](https://github.com/keeema/pure-upload/archive/master.zip) pages and include to your project.
2. Install with npm by `npm install pure-upload --save` or `yarn add pure-upload`.
3. Install with bower by `bower install pure-upload`.

## Example

See a simple [example](https://keeema.github.io/pure-upload).

## Api

### Using NPM package:

Import pure-upload with standard import syntax:

```typescript
import * as pu from "pure-upload";
```

### Uploader

Uploader manages upload queue and registers upload areas.

Initialization:

```typescript
let uploader = pu.getUploader(uploadQueueOptions, uploadQueueCallbacks);
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

Upload area defines element registered in Uploader.

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
```

### Upload area - manual starting

```typescript
start(autoClear?: boolean, files?: IUploadFile[]): void;
clear(files?: IUploadFile[]): void;
```

### Localizer

```typescript
fileSizeInvalid: (maxFileSize: number) => string;
fileTypeInvalid: (accept: string) => string;
invalidResponseFromServer: () => string;
```

### Upload file

Standard _File_ object extended with additional information and methods to manage a file in queue.

```typescript
guid: string;
uploadStatus?: UploadStatus;
responseCode: number;
responseText: string;
progress: number;
sentBytes: number;
errorCode: ErrorCode;
cancel: () => void;
remove: () => void;
start: () => void;
```

### Upload status

File statuses accessible by `pu.uploadStatus`.

## How to develop

### Debug and watch

```bash
npm debug-watch
```

### Build and watch example

```bash
npm run example-watch
```

### Run example solution

```bash
node example
```

### Build package

```bash
npm run build
```

Library used by [Quadient](https://quadient.cz/.

MIT, Copyright &copy; 2015 Tomáš Růt
