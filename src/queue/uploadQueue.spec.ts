describe('uploadQueue', () => {
    let uploadQueue: UploadQueue;

    describe('basic logic', () => {
        let filesChangedSpy: jasmine.Spy;

        beforeEach(() => {
            uploadQueue = new UploadQueue({}, {});
        })

        it('sets the \'queued\' state for newly added files', () => {
            uploadQueue.addFiles([<IUploadFile>{}, <IUploadFile>{}]);
            expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(uploadStatus.queued);
            expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(uploadStatus.queued);
        })

        it('assigns the remove function to the newly added files', () => {
            let file = <IUploadFile>{};
            uploadQueue.addFiles([file]);
            expect(uploadQueue.queuedFiles[0].remove).toBeDefined();
        })

        it('removes file callbacks on remove', () => {
            let file = <IUploadFile>{};
            uploadQueue.addFiles([file]);
            file.remove();
            expect(file.cancel.toString()).toEqual((() => { }).toString());
            expect(file.start.toString()).toEqual((() => { }).toString());
            expect(file.remove.toString()).toEqual((() => { }).toString());
        })

        it('cancels uploading file on remove', () => {
            var cancelSpy = jasmine.createSpy('cancelSpy');
            let file = <IUploadFile>{ cancel: <any>cancelSpy };
            uploadQueue.addFiles([file]);
            file.uploadStatus = uploadStatus.uploading,
            file.remove();
            expect(cancelSpy).toHaveBeenCalled();
        })
    });

    describe('callbacks', () => {
        let file: IUploadFile;
        let callback: jasmine.Spy;
        let queueChangedCallbackSpy: jasmine.Spy;
        let uploadQueue: UploadQueue;

        beforeEach(() => {
            file = <IUploadFile>{};
            queueChangedCallbackSpy = jasmine.createSpy('queueChangedCallback');
        })

        it('triggers onFileAddedCallback and queueChangedCallback on add', () => {
            callback = jasmine.createSpy('onFileAddedCallback');
            uploadQueue = new UploadQueue({}, { onFileAddedCallback: callback, onQueueChangedCallback: queueChangedCallbackSpy });

            uploadQueue.addFiles([file]);
            expect(callback).toHaveBeenCalledWith(file);
            expect(queueChangedCallbackSpy).toHaveBeenCalledWith(uploadQueue.queuedFiles);
            expect(queueChangedCallbackSpy.calls.count()).toEqual(1);
        })

        it('triggers onFileRemovedCallback and queueChangedCallback', () => {
            callback = jasmine.createSpy('onFileRemovedCallback');
            uploadQueue = new UploadQueue({}, { onFileRemovedCallback: callback, onQueueChangedCallback: queueChangedCallbackSpy });
            uploadQueue.queuedFiles.push(file);

            uploadQueue.removeFile(file);
            expect(callback).toHaveBeenCalledWith(file);
            expect(queueChangedCallbackSpy).toHaveBeenCalledWith(uploadQueue.queuedFiles);
            expect(queueChangedCallbackSpy.calls.count()).toEqual(1);
        })

        it('triggers onAllFinishedCallback and queueChangedCallback in correct count after all files removed', () => {
            let file2: IUploadFile = <IUploadFile>{};
            callback = jasmine.createSpy('onAllFinishedCallback');
            uploadQueue = new UploadQueue({}, { onAllFinishedCallback: callback, onQueueChangedCallback: queueChangedCallbackSpy });

            uploadQueue.addFiles([file, file2]);
            file.remove();
            expect(callback).not.toHaveBeenCalled();
            file2.remove();
            expect(callback.calls.count()).toEqual(1);
            expect(queueChangedCallbackSpy).toHaveBeenCalledWith(uploadQueue.queuedFiles);
            expect(queueChangedCallbackSpy.calls.count()).toEqual(3);
        })
    })

    describe('filesChanged', () => {
        describe('autoRemove', () => {
            let files: IUploadFile[] = [
                <IUploadFile>{ uploadStatus: uploadStatus.queued },
                <IUploadFile>{ uploadStatus: uploadStatus.uploading },
                <IUploadFile>{ uploadStatus: uploadStatus.uploaded },
                <IUploadFile>{ uploadStatus: uploadStatus.failed },
                <IUploadFile>{ uploadStatus: uploadStatus.canceled },
            ];

            it('does note removes finished files when autoRemove is turned off', () => {
                uploadQueue = new UploadQueue({ autoRemove: false }, {});
                files.forEach(file=> uploadQueue.queuedFiles.push(file));

                uploadQueue['filesChanged']()
                expect(uploadQueue.queuedFiles).toEqual(files);
            })

            it('removes finished files when autoRemove is turned on', () => {
                uploadQueue = new UploadQueue({ autoRemove: true }, {});
                files.forEach(file=> uploadQueue.queuedFiles.push(file));

                uploadQueue['filesChanged']()

                expect(uploadQueue.queuedFiles.length).toEqual(2);
                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(uploadStatus.queued);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(uploadStatus.uploading);
            })
        });

        describe('autoStart', () => {
            let startFunction = function() { this.uploadStatus = uploadStatus.uploading };
            let files: IUploadFile[];

            beforeEach(() => {
                files = [
                    <IUploadFile>{ uploadStatus: uploadStatus.queued, start: startFunction },
                    <IUploadFile>{ uploadStatus: uploadStatus.queued, start: startFunction },
                    <IUploadFile>{ uploadStatus: uploadStatus.queued, start: startFunction },
                    <IUploadFile>{ uploadStatus: uploadStatus.uploading, start: startFunction },
                    <IUploadFile>{ uploadStatus: uploadStatus.uploading, start: startFunction },
                    <IUploadFile>{ uploadStatus: uploadStatus.uploaded, start: startFunction },
                    <IUploadFile>{ uploadStatus: uploadStatus.failed, start: startFunction },
                    <IUploadFile>{ uploadStatus: uploadStatus.canceled, start: startFunction },
                ];
            })

            it('does not start any file when there is no limit and autoStart is turned off', () => {
                uploadQueue = new UploadQueue({ autoStart: false }, {});
                files.forEach(file=> uploadQueue.queuedFiles.push(file));

                uploadQueue['filesChanged']();
                expect(uploadQueue.queuedFiles).toEqual(files);
            })

            it('starts all queued files when there is no limit and autoStart is turned on', () => {
                uploadQueue = new UploadQueue({ autoStart: true }, {});
                files.forEach(file=> uploadQueue.queuedFiles.push(file));
                uploadQueue['filesChanged']()

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(uploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(uploadStatus.canceled);
            })

            it('starts only limited count of files when set limit and autoStart is turned on', () => {
                uploadQueue = new UploadQueue({ autoStart: true, maxParallelUploads: 2 }, {});
                files.forEach(file=> uploadQueue.queuedFiles.push(file));
                uploadQueue['filesChanged']()

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(uploadStatus.queued);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(uploadStatus.queued);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(uploadStatus.queued);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(uploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(uploadStatus.canceled);

                uploadQueue.queuedFiles[4].uploadStatus = uploadStatus.uploaded;
                uploadQueue['filesChanged']();

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(uploadStatus.queued);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(uploadStatus.queued);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(uploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(uploadStatus.canceled);

                uploadQueue.queuedFiles[0].uploadStatus = uploadStatus.uploaded;
                uploadQueue.queuedFiles[3].uploadStatus = uploadStatus.uploaded;
                uploadQueue['filesChanged']();

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(uploadStatus.uploading);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(uploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(uploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(uploadStatus.canceled);
            })
        });
    })
});
