describe('uploadQueue', () => {
  let uploadQueue: IUploadQueue;

  beforeEach(()=>{
    uploadQueue = new UploadQueue({});
  })

  it('sets the \'queued\' state for newly added files',()=>{
      uploadQueue.addFiles([ <IUploadFile>{}, <IUploadFile>{}]);

      expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(uploadStatus.queued);
      expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(uploadStatus.queued);
  })

  it('assigns the remove function to the newly added files',()=>{
      var file = <IUploadFile>{};

      uploadQueue.addFiles([file]);
      expect(uploadQueue.queuedFiles[0].remove).toBeDefined();

      file.remove();
      expect(uploadQueue.queuedFiles.length).toEqual(0);
  })
});
