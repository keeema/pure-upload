interface IXhrUploadOptions {
  url: string;
  method: string;
  withCredentials?: boolean;
  parallelUploads?: number;
  uploadMultiple?: boolean,
  maxFileSize?: number;
  maxFiles?: number;
  acceptedFiles?: string;
  acceptedMimeTypes?: string;
  autoProcessQueue?: boolean;
}
