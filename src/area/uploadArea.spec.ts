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
});
