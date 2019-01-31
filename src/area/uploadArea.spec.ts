describe("uploadArea", () => {
  describe("clear", () => {
    let htmlElement: HTMLElement;
    let uploadArea: UploadArea;
    let uploadAreaOptions: IUploadAreaOptions;
    let uploader: Uploader;
    let uploadQueue: UploadQueue;

    beforeEach(() => {
      htmlElement = {} as HTMLElement;
      uploadAreaOptions = {} as IUploadAreaOptions;
      uploadQueue = {} as UploadQueue;
      uploader = {queue: uploadQueue} as Uploader;
      uploadArea = new UploadArea(htmlElement, uploadAreaOptions, uploader);
      uploadArea["fileList"] = [{name: "1"}, {name: "2"}, {name: "3"}] as IUploadFile[];
    });

    it("clears all files", () => {
      uploadArea.clear();
      expect(uploadArea["fileList"]).toBeNull();
    });

    it("clears 0 files", () => {
      uploadArea.clear!([]);
      expect(uploadArea["fileList"]).toEqual([{name: "1"}, {name: "2"}, {name: "3"}] as IUploadFile[]);
    });

    it("clears 1 files", () => {
      uploadArea.clear!([uploadArea["fileList"]![1]]);
      expect(uploadArea["fileList"]).toEqual([{name: "1"}, {name: "3"}] as IUploadFile[]);
    });

    it("clears n files", () => {
      uploadArea.clear([uploadArea["fileList"]![2], uploadArea["fileList"]![0], uploadArea["fileList"]![2]]);
      expect(uploadArea["fileList"]).toEqual([{name: "2"}] as IUploadFile[]);
    });
  });
});
