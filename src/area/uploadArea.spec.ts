describe("uploadArea", () => {
  describe("clear", () => {
    let uploadArea: UploadArea;
    const file1 = { name: "1" } as IUploadFile;
    const file2 = { name: "2" } as IUploadFile;
    const file3 = { name: "3" } as IUploadFile;
    const file4 = { name: "4" } as IUploadFile;

    beforeEach(() => {
      uploadArea = new UploadArea(
        document.createElement("div"),
        { method: "", url: "" },
        jasmine.createSpyObj("uploader", { queue: { callbacks: {} } })
      );
      uploadArea["fileList"] = [file1, file2, file3];
    });

    it("clears all files when no array of files specified", () => {
      uploadArea.clear();
      expect(uploadArea["fileList"]).toBeNull();
    });

    it("clears no file when no file specified in given array", () => {
      uploadArea.clear([]);
      expect(uploadArea["fileList"]).toEqual([file1, file2, file3]);
    });

    it("clears files specified in given array", () => {
      uploadArea.clear([file2]);
      expect(uploadArea["fileList"]).toEqual([file1, file3]);
    });

    it("clears files specified in given array files multiple times", () => {
      uploadArea.clear([file3, file1, file3]);
      expect(uploadArea["fileList"]).toEqual([file2]);
    });

    it("clears only contained files", () => {
      uploadArea.clear([file1, file4]);
      expect(uploadArea["fileList"]).toEqual([file2, file3]);
    });
  });

  describe("addFilesFromItems", () => {
    let directories: any[];
    let files: any[];
    let uploadArea: UploadArea;

    beforeEach(() => {
      directories = [];
      files = [];

      for (let i = 0; i < 2; ++i) {
        directories.push({
          isDirectory: true,
          isFile: false,
          createReader() { return { readEntries(callback: Function) { callback(files); } }; },
          webkitGetAsEntry() { return this; }
        });
      }

      for (let i = 0; i < 5; ++i) {
        files.push({
          isDirectory: false,
          isFile: true,
          name: i.toString(),
          file(callback: Function) { callback(this); },
          getAsFile() { return this; },
          webkitGetAsEntry() { return this; }
        })
      }

      uploadArea = new UploadArea(
        document.createElement("div"),
        { manualStart: true, method: "", url: "" },
        jasmine.createSpyObj("uploader", { queue: { callbacks: {} } })
      );
    });

    it("adds files from file items", () => {
      const items = files;
      uploadArea["onDrop"]({dataTransfer: {files: items, items}, stopPropagation: () => undefined} as any);
      expect(uploadArea["fileList"]).toEqual(files);
    });

    it("adds files from directory items", () => {
      const items = directories;
      uploadArea["onDrop"]({dataTransfer: {files: items, items}, stopPropagation: () => undefined} as any);
      expect(uploadArea["fileList"]).toEqual(files.concat(files));
    });

    it("adds files from directory items and file items", () => {
      const items = directories.concat([files[0]]);
      uploadArea["onDrop"]({dataTransfer: {files: items, items}, stopPropagation: () => undefined} as any);
      expect(uploadArea["fileList"]).toEqual(files.concat(files).concat([files[0]]));
    });

    it("adds files from items without webkitGetAsEntry", () => {
      const items = files;
      for (let i = 0; i < files[i]; ++i) { delete files[i].webkitGetAsEntry; }
      uploadArea["onDrop"]({dataTransfer: {files: items, items}, stopPropagation: () => undefined} as any);
      expect(uploadArea["fileList"]).toEqual(files);
    });
  });
});
