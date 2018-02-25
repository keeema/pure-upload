function getUploadCore(
  options: IUploadOptions,
  callbacks: IUploadCallbacks
): UploadCore {
  return new UploadCore(options, callbacks);
}
