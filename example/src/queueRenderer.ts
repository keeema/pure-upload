var getQueueRenderer = function(): QueueRenderer {
    return new QueueRenderer();
}

class QueueRenderer {

    createTextDiv(className: string, value: string): HTMLElement {
        var element = document.createElement("div");
        element.className = className;
        element.innerHTML = value;
        return element;
    }

    createButton(value: string, callback: () => void): HTMLElement {
        var element = document.createElement("button");
        element.className = "table-row-button";
        element.innerHTML = value;
        element.addEventListener("click", callback);
        return element;
    }

    createQueueRow(file: pu.IUploadFile, queueSettings: pu.IUploadQueueOptions): HTMLElement {
        var itemRow = document.createElement("div");
        itemRow.id = file.guid;
        itemRow.className = "table-row-item";
        this.renderQueueRowContent(itemRow, file, queueSettings);
        return itemRow;
    }

    translateFileStatus(file: pu.IUploadFile): string {
        switch (file.uploadStatus.toString()) {
            case pu.UploadStatusStatic.queued:
                return "Queued";
            case pu.UploadStatusStatic.uploading:
                return "Uploading";
            case pu.UploadStatusStatic.uploaded:
                return "Uploaded";
            case pu.UploadStatusStatic.failed:
                return "Failed";
            case pu.UploadStatusStatic.canceled:
                return "Canceled";
        }
        return "Unknown";
    }

    renderQueueRowContent(itemRow: Element, file: pu.IUploadFile, queueSettings: pu.IUploadQueueOptions): void {
        while (itemRow.firstChild) itemRow.removeChild(itemRow.firstChild);

        itemRow.appendChild(this.createTextDiv('table-row-item-status', this.translateFileStatus(file)));
        itemRow.appendChild(this.createTextDiv('table-row-item-name', file.name));
        itemRow.appendChild(this.createTextDiv('table-row-item-progress', file.progress.toString() + "%"));

        switch (file.uploadStatus.toString()) {
            case pu.UploadStatusStatic.queued:
                if (!queueSettings.autoStart) {
                    itemRow.appendChild(this.createButton("Start", () => file.start()));
                    break;
                }
            case pu.UploadStatusStatic.uploading:
                itemRow.appendChild(this.createButton("Cancel", () => file.cancel()));
                break;
            case pu.UploadStatusStatic.uploaded:
            case pu.UploadStatusStatic.failed:
            case pu.UploadStatusStatic.canceled:
                itemRow.appendChild(this.createButton("Delete", () => file.remove()));
                break;
        }
    }

    renderItemProgress(queueId: string, file: pu.IUploadFile): void {
        var itemRow = document.getElementById(file.guid);
        for (var i = 0; i < itemRow.childNodes.length; i++) {
            var node = itemRow.childNodes[i];
            if (node.attributes.getNamedItem('class').value == 'table-row-item-progress') {
                node.textContent = file.progress.toString() + "%";
                break;
            }
        }
    }

    renderQueue(queueId: string, queueTitle: string, files: pu.IUploadFile[], queueSettings: pu.IUploadQueueOptions): void {
        var queue = document.getElementById(queueId);
        while (queue.firstChild) queue.removeChild(queue.firstChild);

        queue.appendChild(this.createTextDiv("table-header-title", queueTitle));
        files.forEach((file: pu.IUploadFile) => {
            queue.appendChild(this.createQueueRow(file, queueSettings));
        });
    }
}
