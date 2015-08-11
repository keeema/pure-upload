class UploadArea {
    private uploadCore: UploadCore;
    private fileInput: HTMLInputElement;

    private unregisterOnClick: () => void;
    private unregisterOnDrop: () => void;
    private unregisterOnDragOver: () => void;
    private unregisterOnChange: () => void;

    constructor(public targetElement: Element, public options: IUploadAreaOptions, public uploader: Uploader) {
        this.uploadCore = getUploadCore(this.options, this.uploader.queue.callbacks);
        this.setupHiddenInput();
    }

    private putFilesToQueue(fileList: FileList): void {
        var uploadFiles = castFiles(fileList);
        uploadFiles.forEach((file: IUploadFile) => {
            file.start = () => {
                this.uploadCore.upload([file]);
                file.start = () => { };
            };
        });
        this.uploader.queue.addFiles(uploadFiles);
    }

    private setupHiddenInput(): void {
        this.fileInput = document.createElement("input");
        this.fileInput.setAttribute("type", "file");
        this.fileInput.style.display = "none";
        this.fileInput.accept = this.options.accept;

        var onChange = (e) => this.onChange(e);
        this.fileInput.addEventListener("change", onChange);
        this.unregisterOnChange = () => this.fileInput.removeEventListener("onChange", onchange)

        if (this.options.multiple) {
            this.fileInput.setAttribute("multiple", "");
        }
        if (this.options.clickable) {
            var onClick = () => this.onClick();
            this.targetElement.addEventListener("click", onClick);
            this.unregisterOnClick = () => this.targetElement.removeEventListener("click", onClick)
        }
        if (this.options.allowDragDrop) {
            var onDrag = (e) => this.onDrag(e);
            this.targetElement.addEventListener("dragover", onDrag);
            this.unregisterOnDragOver = () => this.targetElement.removeEventListener("dragover", onDrag);

            var onDrop = (e) => this.onDrop(e);
            this.targetElement.addEventListener("drop", onDrop);
            this.unregisterOnDrop = () => this.targetElement.removeEventListener("drop", onDrop);

            // this.targetElement.addEventListener("dragenter", (e) => {
            //     console.log("dragenter");
            //     console.log(e);
            // });
            // this.targetElement.addEventListener("dragstart", (e) => {
            //     console.log("dragstart");
            //     console.log(e);
            // });
            // this.targetElement.addEventListener("dragend", (e) => {
            //     console.log("dragend");
            //     console.log(e);
            // });
        }
        // attach to body
        document.body.appendChild(this.fileInput);
    }

    private onChange(e): void {
        this.putFilesToQueue(e.target.files);
    }

    private onDrag(e: DragEvent): void {
        var efct;
        try {
            efct = e.dataTransfer.effectAllowed;
        } catch (_error) { }
        e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
        this.stopEventPropagation(e);
    }

    private onDrop(e: DragEvent): void {
        if (!e.dataTransfer) {
            return;
        }
        var files = e.dataTransfer.files;
        if (files.length) {
            var items = e.dataTransfer.files;
            this.putFilesToQueue(items);
        }
        this.stopEventPropagation(e);
    }

    private onClick(): void {
        this.fileInput.value = '';
        this.fileInput.click();
    }

    private stopEventPropagation(e) {
        e.stopPropagation();
        if (e.preventDefault) {
            e.preventDefault();
        }
    }

    destroy(): void {
        if (this.unregisterOnClick)
            this.unregisterOnClick();

        if (this.unregisterOnDrop)
            this.unregisterOnDrop();

        if (this.unregisterOnChange)
            this.unregisterOnChange();

        if (this.unregisterOnDragOver)
            this.unregisterOnDragOver();

        this.targetElement.removeEventListener("dragover", this.onDrag);
        this.targetElement.removeEventListener("drop", this.onDrop);

        document.body.removeChild(this.fileInput);
    }
}
