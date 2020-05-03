/// <reference types="jasmine" />

describe("uploadQueue", () => {
    let uploadQueue: UploadQueue;

    describe("basic logic", () => {
        beforeEach(() => {
            uploadQueue = new UploadQueue({}, {});
        });

        it("sets the 'queued' state for newly added files", () => {
            uploadQueue.addFiles([<IUploadFile>{}, <IUploadFile>{}]);
            expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.queued);
            expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.queued);
        });

        it("sets the 'queued' state only for non-failed files", () => {
            uploadQueue.addFiles([<IUploadFile>{}, <IUploadFile>{ uploadStatus: UploadStatus.failed }]);
            expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.queued);
            expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.failed);
        });

        it("assigns the remove function to the newly added files", () => {
            let file = <IUploadFile>{};
            uploadQueue.addFiles([file]);
            expect(uploadQueue.queuedFiles[0].remove).toBeDefined();
        });

        it("cancels uploading file on remove", () => {
            let cancelSpy = jasmine.createSpy("cancelSpy");
            let file = <IUploadFile>{ cancel: <() => void>cancelSpy };
            uploadQueue.addFiles([file]);
            (file.uploadStatus = UploadStatus.uploading), file.remove();
            expect(cancelSpy).toHaveBeenCalled();
        });
    });

    describe("callbacks", () => {
        let file: IUploadFile;
        let callback: jasmine.Spy;
        let queueChangedCallbackSpy: jasmine.Spy;

        beforeEach(() => {
            file = <IUploadFile>{};
            queueChangedCallbackSpy = jasmine.createSpy("queueChangedCallback");
        });

        it("triggers onFileAddedCallback and queueChangedCallback on add", () => {
            callback = jasmine.createSpy("onFileAddedCallback");
            uploadQueue = new UploadQueue(
                {},
                {
                    onFileAddedCallback: callback,
                    onQueueChangedCallback: queueChangedCallbackSpy,
                }
            );

            uploadQueue.addFiles([file]);
            expect(callback).toHaveBeenCalledWith(file);
            expect(queueChangedCallbackSpy).toHaveBeenCalledWith(uploadQueue.queuedFiles);
            expect(queueChangedCallbackSpy.calls.count()).toEqual(1);
        });

        it("triggers onFileRemovedCallback and queueChangedCallback", () => {
            callback = jasmine.createSpy("onFileRemovedCallback");
            uploadQueue = new UploadQueue(
                {},
                {
                    onFileRemovedCallback: callback,
                    onQueueChangedCallback: queueChangedCallbackSpy,
                }
            );
            uploadQueue.queuedFiles.push(file);

            uploadQueue.removeFile(file);
            expect(callback).toHaveBeenCalledWith(file);
            expect(queueChangedCallbackSpy).toHaveBeenCalledWith(uploadQueue.queuedFiles);
            expect(queueChangedCallbackSpy.calls.count()).toEqual(1);
        });

        it("triggers onAllFinishedCallback and queueChangedCallback in correct count after all files removed", () => {
            let file2: IUploadFile = <IUploadFile>{};
            callback = jasmine.createSpy("onAllFinishedCallback");
            uploadQueue = new UploadQueue(
                {},
                {
                    onAllFinishedCallback: callback,
                    onQueueChangedCallback: queueChangedCallbackSpy,
                }
            );

            uploadQueue.addFiles([file, file2]);
            file.remove();
            expect(callback).not.toHaveBeenCalled();
            file2.remove();
            expect(callback.calls.count()).toEqual(1);
            expect(queueChangedCallbackSpy).toHaveBeenCalledWith(uploadQueue.queuedFiles);
            expect(queueChangedCallbackSpy.calls.count()).toEqual(3);
        });

        it("clears file queue according to the specified scale", () => {
            let file1: IUploadFile = <IUploadFile>{
                uploadStatus: UploadStatus.queued,
                cancel: () => {
                    return;
                },
            };
            let file2: IUploadFile = <IUploadFile>{
                uploadStatus: UploadStatus.uploading,
                cancel: () => {
                    return;
                },
            };
            let file3: IUploadFile = <IUploadFile>{
                uploadStatus: UploadStatus.uploaded,
                cancel: () => {
                    return;
                },
            };

            uploadQueue = new UploadQueue({}, {});
            uploadQueue.queuedFiles = [file1, file2, file3];

            uploadQueue.clearFiles();
            expect(uploadQueue.queuedFiles).toEqual([file1, file2]);

            uploadQueue.clearFiles([UploadStatus.queued], true);
            expect(uploadQueue.queuedFiles).toEqual([file1]);

            uploadQueue.clearFiles([], true);
            expect(uploadQueue.queuedFiles).toEqual([]);
        });

        it("triggers and on clearFiles", () => {
            callback = jasmine.createSpy("onFileRemovedCallback");
            uploadQueue = new UploadQueue(
                {},
                {
                    onFileRemovedCallback: callback,
                    onQueueChangedCallback: queueChangedCallbackSpy,
                }
            );
            uploadQueue.addFiles([file]);
            uploadQueue.clearFiles([], true);

            expect(queueChangedCallbackSpy).toHaveBeenCalledWith(uploadQueue.queuedFiles);
            expect(callback.calls.count()).toEqual(1);
        });
    });

    describe("filesChanged", () => {
        describe("autoRemove", () => {
            let files: IUploadFile[] = [
                <IUploadFile>{ uploadStatus: UploadStatus.queued },
                <IUploadFile>{ uploadStatus: UploadStatus.uploading },
                <IUploadFile>{ uploadStatus: UploadStatus.uploaded },
                <IUploadFile>{ uploadStatus: UploadStatus.failed },
                <IUploadFile>{ uploadStatus: UploadStatus.canceled },
            ];

            it("does note removes finished files when autoRemove is turned off", () => {
                uploadQueue = new UploadQueue({ autoRemove: false }, {});
                files.forEach((file) => uploadQueue.queuedFiles.push(file));

                uploadQueue["filesChanged"]();
                expect(uploadQueue.queuedFiles).toEqual(files);
            });

            it("removes finished files when autoRemove is turned on", () => {
                uploadQueue = new UploadQueue({ autoRemove: true }, {});
                files.forEach((file) => uploadQueue.queuedFiles.push(file));

                uploadQueue["filesChanged"]();

                expect(uploadQueue.queuedFiles.length).toEqual(3);
                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.failed);
            });
        });

        describe("autoStart", () => {
            let files: IUploadFile[];

            beforeEach(() => {
                files = [
                    <IUploadFile>{
                        uploadStatus: UploadStatus.queued,
                        start: () => {
                            return;
                        },
                    },
                    <IUploadFile>{
                        uploadStatus: UploadStatus.queued,
                        start: () => {
                            return;
                        },
                    },
                    <IUploadFile>{
                        uploadStatus: UploadStatus.queued,
                        start: () => {
                            return;
                        },
                    },
                    <IUploadFile>{
                        uploadStatus: UploadStatus.uploading,
                        start: () => {
                            return;
                        },
                    },
                    <IUploadFile>{
                        uploadStatus: UploadStatus.uploading,
                        start: () => {
                            return;
                        },
                    },
                    <IUploadFile>{
                        uploadStatus: UploadStatus.uploaded,
                        start: () => {
                            return;
                        },
                    },
                    <IUploadFile>{
                        uploadStatus: UploadStatus.failed,
                        start: () => {
                            return;
                        },
                    },
                    <IUploadFile>{
                        uploadStatus: UploadStatus.canceled,
                        start: () => {
                            return;
                        },
                    },
                ];
                files.forEach(
                    (item) =>
                        (item.start = () => {
                            item.uploadStatus = UploadStatus.uploading;
                        })
                );
            });

            it("does not start any file when there is no limit and autoStart is turned off", () => {
                uploadQueue = new UploadQueue({ autoStart: false }, {});
                files.forEach((file) => uploadQueue.queuedFiles.push(file));

                uploadQueue["filesChanged"]();
                expect(uploadQueue.queuedFiles).toEqual(files);
            });

            it("starts all queued files when there is no limit and autoStart is turned on", () => {
                uploadQueue = new UploadQueue({ autoStart: true }, {});
                files.forEach((file) => uploadQueue.queuedFiles.push(file));
                uploadQueue["filesChanged"]();

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(UploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(UploadStatus.canceled);
            });

            it("starts only limited count of files when set limit and autoStart is turned on", () => {
                uploadQueue = new UploadQueue({ autoStart: true, maxParallelUploads: 2 }, {});
                files.forEach((file) => uploadQueue.queuedFiles.push(file));
                uploadQueue["filesChanged"]();

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(UploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(UploadStatus.canceled);

                uploadQueue.queuedFiles[4].uploadStatus = UploadStatus.uploaded;
                uploadQueue["filesChanged"]();

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(UploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(UploadStatus.canceled);

                uploadQueue.queuedFiles[0].uploadStatus = UploadStatus.uploaded;
                uploadQueue.queuedFiles[3].uploadStatus = UploadStatus.uploaded;
                uploadQueue["filesChanged"]();

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(UploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(UploadStatus.canceled);
            });

            it("starts limited count of files with offset when set limit and parallelBatchOffset and autoStart is turned on", (done: Function) => {
                uploadQueue = new UploadQueue({ autoStart: true, maxParallelUploads: 2, parallelBatchOffset: 1000 }, {});
                files.forEach((file) => uploadQueue.queuedFiles.push(file));
                uploadQueue.queuedFiles[3].uploadStatus = UploadStatus.queued;
                uploadQueue.queuedFiles[4].uploadStatus = UploadStatus.queued;
                uploadQueue["filesChanged"]();

                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(UploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(UploadStatus.canceled);

                uploadQueue.queuedFiles[0].uploadStatus = UploadStatus.uploaded;
                uploadQueue["filesChanged"]();

                // only the uploaded file changed because of offset
                expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.uploading);
                expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(UploadStatus.queued);
                expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(UploadStatus.uploaded);
                expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(UploadStatus.failed);
                expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(UploadStatus.canceled);

                setTimeout(() => {
                    expect(uploadQueue.queuedFiles[0].uploadStatus).toEqual(UploadStatus.uploaded);
                    expect(uploadQueue.queuedFiles[1].uploadStatus).toEqual(UploadStatus.uploading);
                    expect(uploadQueue.queuedFiles[2].uploadStatus).toEqual(UploadStatus.uploading);
                    expect(uploadQueue.queuedFiles[3].uploadStatus).toEqual(UploadStatus.queued);
                    expect(uploadQueue.queuedFiles[4].uploadStatus).toEqual(UploadStatus.queued);
                    expect(uploadQueue.queuedFiles[5].uploadStatus).toEqual(UploadStatus.uploaded);
                    expect(uploadQueue.queuedFiles[6].uploadStatus).toEqual(UploadStatus.failed);
                    expect(uploadQueue.queuedFiles[7].uploadStatus).toEqual(UploadStatus.canceled);

                    done();
                }, 1000);
            });
        });
    });
});
