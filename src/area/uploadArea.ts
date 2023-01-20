class UploadArea {
    public targetElement: HTMLElement;
    public uploader: Uploader;
    public options: IFullUploadAreaOptions;
    private uploadCore: UploadCore;
    private _fileInput?: HTMLInputElement;
    private fileList?: IUploadFile[] | null;
    private unregisterOnClick?: () => void;
    private unregisterOnDrop?: () => void;
    private unregisterOnDropGlobal?: () => void;
    private unregisterOnDragEnter?: () => void;
    private unregisterOnDragOver?: () => void;
    private unregisterOnDragLeave?: () => void;
    private unregisterOnDragEnterGlobal?: () => void;
    private unregisterOnDragOverGlobal?: () => void;
    private unregisterOnDragLeaveGlobal?: () => void;
    private unregisterOnChange?: () => void;

    constructor(targetElement: HTMLElement, options: IUploadAreaOptions, uploader: Uploader) {
        this.targetElement = targetElement;
        this.options = applyDefaults(options, this.defaultOptions());
        this.uploader = uploader;
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
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
        this.fileList = this.fileList && files ? this.fileList.filter((file) => files.indexOf(file) < 0) : null;
    }

    destroy(): void {
        if (this.unregisterOnClick) this.unregisterOnClick();

        if (this.unregisterOnDrop) this.unregisterOnDrop();

        if (this.unregisterOnDropGlobal) this.unregisterOnDropGlobal();

        if (this.unregisterOnChange) this.unregisterOnChange();

        if (this.unregisterOnDragEnter) this.unregisterOnDragEnter();

        if (this.unregisterOnDragOver) this.unregisterOnDragOver();

        if (this.unregisterOnDragLeave) this.unregisterOnDragLeave();

        if (this.unregisterOnDragEnterGlobal) this.unregisterOnDragEnterGlobal();

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
            validateMissingExtension: false,
            multiple: true,
            allowEmptyFile: false,
            useCapture: false,
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
        files = this.fileList && files ? this.fileList.filter((file) => files && files.indexOf(file) >= 0) : this.fileList || undefined;

        if (!files) return;

        files.forEach((file: IUploadFile) => {
            if (file.guid === undefined) {
                file.guid = newGuid();
            }

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
            file.responseText = this.options.localizer.fileSizeInvalid(this.options.maxFileSize);
            file.errorCode = ErrorCode.FileSizeExceeded;
            return false;
        }
        if (this.fileTypeMissing(file)) {
            file.uploadStatus = UploadStatus.failed;
            file.responseText = this.options.localizer.fileTypeMissing();
            file.errorCode = ErrorCode.UnsupportedFileFormat;
            return false;
        }
        if (this.isFileTypeInvalid(file)) {
            file.uploadStatus = UploadStatus.failed;
            file.responseText = this.options.localizer.fileTypeInvalid(this.options.accept);
            file.errorCode = ErrorCode.UnsupportedFileFormat;
            return false;
        }
        file.errorCode = ErrorCode.NoError;
        return true;
    }

    private setupFileApiElements(): void {
        this._fileInput = document.createElement("input");
        this._fileInput.setAttribute("type", "file");
        this._fileInput.setAttribute("accept", this.options.accept ? this.options.accept : "");
        this._fileInput.style.display = "none";

        const onChange = (e: Event) => this.onChange(e);
        addEventHandler(this._fileInput, "change", onChange, this.options.useCapture);
        this.unregisterOnChange = () => {
            if (this._fileInput) removeEventHandler(this._fileInput, "change", onchange as EventListener, { capture: this.options.useCapture });
        };

        if (this.options.multiple) {
            this._fileInput.setAttribute("multiple", "");
        }

        this.registerEvents();

        // attach to body
        document.body.appendChild(this._fileInput);
    }

    private registerEvents() {
        let capture = this.options.useCapture;

        const onClick = () => this.onClick();
        addEventHandler(this.targetElement, "click", onClick, capture);
        this.unregisterOnClick = () => removeEventHandler(this.targetElement, "click", onClick, { capture });

        const onDragEnter = () => this.onDragEnter();
        addEventHandler(this.targetElement, "dragenter", onDragEnter, capture);
        this.unregisterOnDragEnter = () => removeEventHandler(this.targetElement, "dragenter", onDragEnter, { capture });

        const onDragOver = ((e: DragEvent) => this.onDragOver(e)) as EventListenerOrEventListenerObject;
        addEventHandler(this.targetElement, "dragover", onDragOver, capture);
        this.unregisterOnDragOver = () => removeEventHandler(this.targetElement, "dragover", onDragOver, { capture });

        const onDragLeave = () => this.onDragLeave();
        addEventHandler(this.targetElement, "dragleave", onDragLeave, capture);
        this.unregisterOnDragLeave = () => removeEventHandler(this.targetElement, "dragleave", onDragLeave, { capture });

        const onDragEnterGlobal = () => this.onDragEnterGlobal();
        addEventHandler(document.body, "dragenter", onDragEnterGlobal, capture);
        this.unregisterOnDragEnterGlobal = () => removeEventHandler(document.body, "dragenter", onDragEnterGlobal, { capture });

        const onDragOverGlobal = () => this.onDragOverGlobal();
        addEventHandler(document.body, "dragover", onDragOverGlobal, capture);
        this.unregisterOnDragOverGlobal = () => removeEventHandler(document.body, "dragover", onDragOverGlobal, { capture });

        const onDragLeaveGlobal = () => this.onDragLeaveGlobal();
        addEventHandler(document.body, "dragleave", onDragLeaveGlobal, capture);
        this.unregisterOnDragLeaveGlobal = () => removeEventHandler(document.body, "dragleave", onDragLeaveGlobal, { capture });

        const onDrop = ((e: DragEvent) => this.onDrop(e)) as EventListenerOrEventListenerObject;
        addEventHandler(this.targetElement, "drop", onDrop, capture);
        this.unregisterOnDrop = () => removeEventHandler(this.targetElement, "drop", onDrop, { capture });

        const onDropGlobal = ((e: DragEvent) => this.onDropGlobal(e)) as EventListenerOrEventListenerObject;
        addEventHandler(document.body, "drop", onDropGlobal, capture);
        this.unregisterOnDropGlobal = () => removeEventHandler(document.body, "drop", onDropGlobal, { capture });
    }

    private onChange(e: Event): void {
        this.selectFiles(<FileList>(<HTMLInputElement>e.target).files);
    }

    private onDragEnter(): void {
        if (!getValueOrResult(this.options.allowDragDrop)) return;

        this.options.onDragEnter && this.options.onDragEnter();
    }

    private onDragOver(e: DragEvent): void {
        if (!getValueOrResult(this.options.allowDragDrop)) return;

        this.options.onDragOver && this.options.onDragOver();
        this.addDragOverStyle(this.options.dragOverStyle);
        let effect: string | undefined = undefined;
        if (e.dataTransfer) {
            try {
                effect = e.dataTransfer.effectAllowed;
            } catch {
                true;
            }
            e.dataTransfer.dropEffect = "move" === effect || "linkMove" === effect ? "move" : "copy";
        }
        this.stopEventPropagation(e);
    }

    private onDragLeave(): void {
        if (!getValueOrResult(this.options.allowDragDrop)) return;

        this.options.onDragLeave && this.options.onDragLeave();
        this.removeDragOverStyle(this.options.dragOverStyle);
    }

    private onDragEnterGlobal(): void {
        if (!getValueOrResult(this.options.allowDragDrop)) return;

        this.options.onDragEnterGlobal && this.options.onDragEnterGlobal();
    }

    private onDragOverGlobal(): void {
        if (!getValueOrResult(this.options.allowDragDrop)) return;

        this.options.onDragOverGlobal && this.options.onDragOverGlobal();
        this.addDragOverStyle(this.options.dragOverGlobalStyle);
    }

    private onDragLeaveGlobal(): void {
        if (!getValueOrResult(this.options.allowDragDrop)) return;

        this.options.onDragLeaveGlobal && this.options.onDragLeaveGlobal();
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

        this.options.onDrop && this.options.onDrop();
        if (!e.dataTransfer) {
            return;
        }

        this.removeDragOverStyle(this.options.dragOverStyle);

        let files: FileList | File[] = e.dataTransfer.files;
        if (files.length) {
            if (!this.options.multiple) files = [files[0]];

            let items = e.dataTransfer.items;
            if (items && items.length && items[0].webkitGetAsEntry !== null) {
                const itemsToProcess = this.options.multiple ? items : [items[0]];
                ItemProcessor.processItems(itemsToProcess, (files) => this.selectFiles(files));
            } else {
                this.selectFiles(files);
            }
        }

        if (!this.options.onDropGlobal) {
            this.stopEventPropagation(e);
        }
    }

    private onDropGlobal(e: DragEvent): void {
        if (this.options.onDropGlobal) {
            this.stopEventPropagation(e);
            this.options.onDropGlobal();
        }
    }

    private isIeVersion(v: number): boolean {
        return RegExp("msie" + (!isNaN(v) ? "\\s" + v.toString() : ""), "i").test(navigator.userAgent);
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

    private isFileSizeValid(file: File): boolean {
        let maxFileSize = this.options.maxFileSize * 1024 * 1024; // max file size in bytes
        if (file.size > maxFileSize || (!this.options.allowEmptyFile && file.size === 0)) return false;
        return true;
    }

    private fileTypeMissing(file: File): boolean {
        return this.options.validateMissingExtension && file.name.indexOf(".") === -1;
    }

    private isFileTypeInvalid(file: File): boolean {
        if (
            file.name &&
            this.options.accept &&
            this.options.accept.trim() !== "*" &&
            this.options.accept.trim() !== "*.*" &&
            this.options.validateExtension &&
            this.options.accept.indexOf("/") === -1
        ) {
            let acceptedExtensions = this.options.accept.split(",");
            let fileExtension = file.name.substring(file.name.lastIndexOf("."), file.name.length);
            if (fileExtension.indexOf(".") === -1) return true;
            let isFileExtensionExisted = true;
            for (let i = 0; i < acceptedExtensions.length; i++) {
                if (acceptedExtensions[i].toUpperCase().trim() === fileExtension.toUpperCase()) {
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
