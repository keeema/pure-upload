class UploadArea {
  public targetElement: HTMLElement;
  public uploader: Uploader;
  public options: IFullUploadAreaOptions;
  private uploadCore: UploadCore;
  private _fileInput?: HTMLInputElement;
  private fileList?: IUploadFile[] | null;
  private unregisterOnClick?: () => void;
  private unregisterOnDrop?: () => void;
  private unregisterOnDragOver?: () => void;
  private unregisterOnDragLeave?: () => void;
  private unregisterOnDragOverGlobal?: () => void;
  private unregisterOnDragLeaveGlobal?: () => void;
  private unregisterOnChange?: () => void;

  constructor(
    targetElement: HTMLElement,
    options: IUploadAreaOptions,
    uploader: Uploader
  ) {
    this.targetElement = targetElement;
    this.options = applyDefaults(options, this.defaultOptions());
    this.uploader = uploader;
    this.uploadCore = getUploadCore(
      this.options,
      this.uploader.queue.callbacks
    );
    if (isFileApi) {
      this.setupFileApiElements();
    } else {
      throw "Only browsers with FileAPI supported.";
    }
  }

  start(autoClear: boolean = false, files?: IUploadFile[]) {
    if (this.options.manualStart && (files || this.fileList)) {
      this.putFilesToQueue(files);
      if (autoClear) this.clear(files);
    }
  }

  clear(files?: IUploadFile[]) {
    if (this.fileList && files !== undefined) {
      const fileList: IUploadFile[] = [];

      for (let i = 0; i < this.fileList.length; ++i) {
        let exists = false;

        for (let j = 0; j < files.length; ++j) {
          exists = this.fileList[i] === files[j];
          if (exists) break;
        }

        if (!exists) fileList.push(this.fileList[i]);
      }

      this.fileList = fileList;
    } else {
      this.fileList = null;
    }
  }

  destroy(): void {
    if (this.unregisterOnClick) this.unregisterOnClick();

    if (this.unregisterOnDrop) this.unregisterOnDrop();

    if (this.unregisterOnChange) this.unregisterOnChange();

    if (this.unregisterOnDragOver) this.unregisterOnDragOver();

    if (this.unregisterOnDragLeave) this.unregisterOnDragLeave();

    if (this.unregisterOnDragOverGlobal) this.unregisterOnDragOverGlobal();

    if (this.unregisterOnDragLeaveGlobal) this.unregisterOnDragLeaveGlobal();

    if (this._fileInput) document.body.removeChild(this._fileInput);
  }

  get fileInput(): HTMLInputElement | undefined {
    return this._fileInput;
  }

  private defaultOptions() {
    return {
      localizer: getDefaultLocalizer(),
      maxFileSize: 1024,
      allowDragDrop: true,
      clickable: true,
      accept: "*.*",
      validateExtension: false,
      multiple: true,
      allowEmptyFile: false
    };
  }

  private selectFiles(fileList: FileList | File[]) {
    this.fileList = castFiles(fileList);

    if (this.options.onFileSelected)
      this.fileList.forEach((file: IUploadFile) => {
        if (this.options.onFileSelected) this.options.onFileSelected(file);
      });

    if (this.options.onFilesSelected) {
      const files: IUploadFile[] = [];

      this.fileList.forEach((file: IUploadFile) => {
        files.push(file);
      });

      this.options.onFilesSelected(files);
    }

    if (!this.options.manualStart) this.putFilesToQueue();
  }

  private putFilesToQueue(files?: IUploadFile[]): void {
    files = files ? files : (this.fileList ? this.fileList : undefined);

    if (!files) return;

    files.forEach((file: IUploadFile) => {
      file.guid = newGuid();
      delete file.uploadStatus;
      file.url = this.uploadCore.getUrl(file);
      file.onError =
        this.options.onFileError ||
        (() => {
          return;
        });
      file.onCancel =
        this.options.onFileCanceled ||
        (() => {
          return;
        });
      if (this.validateFile(file)) {
        file.start = () => {
          this.uploadCore.upload([file]);

          if (this.options.onFileAdded) {
            this.options.onFileAdded(file);
          }
          file.start = () => {
            return;
          };
        };
      } else {
        file.onError(file);
      }
    });
    this.uploader.queue.addFiles(files);
  }

  private validateFile(file: IUploadFile): boolean {
    if (!this.isFileSizeValid(file)) {
      file.uploadStatus = UploadStatus.failed;
      file.responseText = this.options.localizer.fileSizeInvalid(
        this.options.maxFileSize
      );
      return false;
    }
    if (this.isFileTypeInvalid(file)) {
      file.uploadStatus = UploadStatus.failed;
      file.responseText = this.options.localizer.fileTypeInvalid(
        this.options.accept
      );
      return false;
    }
    return true;
  }

  private setupFileApiElements(): void {
    this._fileInput = document.createElement("input");
    this._fileInput.setAttribute("type", "file");
    this._fileInput.setAttribute(
      "accept",
      this.options.accept ? this.options.accept : ""
    );
    this._fileInput.style.display = "none";

    const onChange = (e: Event) => this.onChange(e);
    addEventHandler(this._fileInput, "change", onChange);
    this.unregisterOnChange = () => {
      if (this._fileInput)
        removeEventHandler(
          this._fileInput,
          "change",
          onchange as EventListener
        );
    };

    if (this.options.multiple) {
      this._fileInput.setAttribute("multiple", "");
    }

    this.registerEvents();

    // attach to body
    document.body.appendChild(this._fileInput);
  }

  private registerEvents() {
    const onClick = () => this.onClick();
    addEventHandler(this.targetElement, "click", onClick);
    this.unregisterOnClick = () =>
      removeEventHandler(this.targetElement, "click", onClick);

    const onDrag = ((e: DragEvent) =>
      this.onDrag(e)) as EventListenerOrEventListenerObject;
    addEventHandler(this.targetElement, "dragover", onDrag);
    this.unregisterOnDragOver = () =>
      removeEventHandler(this.targetElement, "dragover", onDrag);

    const onDragLeave = () => this.onDragLeave();
    addEventHandler(this.targetElement, "dragleave", onDragLeave);
    this.unregisterOnDragOver = () =>
      removeEventHandler(this.targetElement, "dragleave", onDragLeave);

    const onDragGlobal = () => this.onDragGlobal();
    addEventHandler(document.body, "dragover", onDragGlobal);
    this.unregisterOnDragOverGlobal = () =>
      removeEventHandler(document.body, "dragover", onDragGlobal);

    const onDragLeaveGlobal = () => this.onDragLeaveGlobal();
    addEventHandler(document.body, "dragleave", onDragLeaveGlobal);
    this.unregisterOnDragOverGlobal = () =>
      removeEventHandler(document.body, "dragleave", onDragLeaveGlobal);

    const onDrop = ((e: DragEvent) =>
      this.onDrop(e)) as EventListenerOrEventListenerObject;
    addEventHandler(this.targetElement, "drop", onDrop);
    this.unregisterOnDrop = () =>
      removeEventHandler(this.targetElement, "drop", onDrop);
  }

  private onChange(e: Event): void {
    this.selectFiles(<FileList>(<HTMLInputElement>e.target).files);
  }

  private onDrag(e: DragEvent): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.addDragOverStyle(this.options.dragOverStyle);
    let effect: string | undefined = undefined;
    if (e.dataTransfer) {
      try {
        effect = e.dataTransfer.effectAllowed;
      } catch {
        true;
      }
      e.dataTransfer.dropEffect =
        "move" === effect || "linkMove" === effect ? "move" : "copy";
    }
    this.stopEventPropagation(e);
  }

  private onDragLeave(): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.removeDragOverStyle(this.options.dragOverStyle);
  }

  private onDragGlobal(): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.addDragOverStyle(this.options.dragOverGlobalStyle);
  }

  private onDragLeaveGlobal(): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.removeDragOverStyle(this.options.dragOverGlobalStyle);
  }

  private removeDragOverStyle(style?: string) {
    if (!style) return;

    this.targetElement.classList.remove(style);
  }

  private addDragOverStyle(style?: string) {
    if (!style) return;

    this.targetElement.classList.add(style);
  }

  private onDrop(e: DragEvent): void {
    if (!getValueOrResult(this.options.allowDragDrop)) return;

    this.stopEventPropagation(e);
    if (!e.dataTransfer) {
      return;
    }

    this.removeDragOverStyle(this.options.dragOverStyle);

    let files: FileList | File[] = e.dataTransfer.files;
    if (files.length) {
      if (!this.options.multiple) files = [files[0]];

      let items = e.dataTransfer.items;
      if (
        items &&
        items.length &&
        (<{ webkitGetAsEntry?: Object }>items[0]).webkitGetAsEntry !== null
      ) {
        if (!this.options.multiple) {
          let newItems = [items[0]];
          this.addFilesFromItems(newItems);
        } else {
          this.addFilesFromItems(items);
        }
      } else {
        this.handleFiles(files);
      }
    }
  }

  private isIeVersion(v: number): boolean {
    return RegExp("msie" + (!isNaN(v) ? "\\s" + v.toString() : ""), "i").test(
      navigator.userAgent
    );
  }

  private onClick(): void {
    if (!getValueOrResult(this.options.clickable) || !this._fileInput) return;

    this._fileInput.value = "";

    if (this.isIeVersion(10)) {
      setTimeout(() => {
        if (this._fileInput) this._fileInput.click();
      }, 200);
    } else {
      this._fileInput.click();
    }
  }

  private addFilesFromItems(
    items: FileList | File[] | DataTransferItemList | DataTransferItem[]
  ): void {
    let entry: IFileExt;
    for (let i = 0; i < items.length; i++) {
      let item: IFileExt = <IFileExt>items[i];
      if (
        item.webkitGetAsEntry &&
        (entry = <IFileExt>item.webkitGetAsEntry())
      ) {
        if (entry.isFile) {
          this.selectFiles([item.getAsFile()]);
        } else if (entry.isDirectory) {
          this.processDirectory(entry, entry.name);
        }
      } else if (item.getAsFile) {
        if (!item.kind || item.kind === "file") {
          this.selectFiles([item.getAsFile()]);
        }
      }
    }
  }

  private processDirectory(
    directory: { createReader: Function },
    path: string
  ): void {
    let dirReader = directory.createReader();
    let self = this;
    let entryReader = (entries: (IFileExt & { createReader: Function })[]) => {
      for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        if (entry.isFile) {
          entry.file((file: IFileExt) => {
            if (file.name.substring(0, 1) === ".") {
              return;
            }
            file.fullPath = "" + path + "/" + file.name;
            self.selectFiles([file]);
          });
        } else if (entry.isDirectory) {
          self.processDirectory(entry, "" + path + "/" + entry.name);
        }
      }
    };
    dirReader.readEntries(entryReader, function(error: string) {
      return typeof console !== "undefined" && console !== null
        ? typeof console.log === "function"
          ? console.log(error)
          : void 0
        : void 0;
    });
  }

  private handleFiles(files: FileList | File[]): void {
    for (let i = 0; i < files.length; i++) {
      this.selectFiles([files[i]]);
    }
  }

  private isFileSizeValid(file: File): boolean {
    let maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
    if (
      file.size > maxFileSize ||
      (!this.options.allowEmptyFile && file.size === 0)
    )
      return false;
    return true;
  }

  private isFileTypeInvalid(file: File): boolean {
    if (
      file.name &&
      this.options.accept &&
      (this.options.accept.trim() !== "*" ||
        this.options.accept.trim() !== "*.*") &&
      this.options.validateExtension &&
      this.options.accept.indexOf("/") === -1
    ) {
      let acceptedExtensions = this.options.accept.split(",");
      let fileExtension = file.name.substring(
        file.name.lastIndexOf("."),
        file.name.length
      );
      if (fileExtension.indexOf(".") === -1) return true;
      let isFileExtensionExisted = true;
      for (let i = 0; i < acceptedExtensions.length; i++) {
        if (
          acceptedExtensions[i].toUpperCase().trim() ===
          fileExtension.toUpperCase()
        ) {
          isFileExtensionExisted = false;
        }
      }
      return isFileExtensionExisted;
    }
    return false;
  }

  private stopEventPropagation(e: Event) {
    e.stopPropagation();
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }
}
