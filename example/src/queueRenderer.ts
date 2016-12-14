function getQueueRenderer(): QueueRenderer {
    return new QueueRenderer();
};

class QueueRenderer {
    createTextDiv(className: string, value: string): HTMLElement {
        let element = document.createElement('div');
        element.className = className;
        element.innerHTML = value;
        return element;
    }

    createButton(value: string, callback: () => void): HTMLElement {
        let element = document.createElement('button');
        element.className = 'table-row-button';
        element.innerHTML = value;
        pu.addEventHandler(element, 'click', callback);
        return element;
    }

    createQueueRow(file: pu.IUploadFile, queueSettings: pu.IUploadQueueOptions): HTMLElement {
        let itemRow = document.createElement('div');
        itemRow.id = file.guid;
        itemRow.className = 'table-row-item';
        this.renderQueueRowContent(itemRow, file, queueSettings);
        return itemRow;
    }

    translateFileStatus(file: pu.IUploadFile): string {
        switch (file.uploadStatus) {
            case pu.UploadStatus.queued:
                return 'Queued';
            case pu.UploadStatus.uploading:
                return 'Uploading';
            case pu.UploadStatus.uploaded:
                return 'Uploaded';
            case pu.UploadStatus.failed:
                return 'Failed';
            case pu.UploadStatus.canceled:
                return 'Canceled';
        }
        return 'Unknown';
    }

    renderQueueRowContent(itemRow: Element, file: pu.IUploadFile, queueSettings: pu.IUploadQueueOptions): void {
        while (itemRow.firstChild) itemRow.removeChild(itemRow.firstChild);

        itemRow.appendChild(this.createTextDiv('table-row-item-status', this.translateFileStatus(file)));
        itemRow.appendChild(this.createTextDiv('table-row-item-name', file.name));
        itemRow.appendChild(this.createTextDiv('table-row-item-progress', file.progress.toString() + '%'));

        switch (file.uploadStatus) {
            case pu.UploadStatus.queued:
                if (!queueSettings.autoStart) {
                    itemRow.appendChild(this.createButton('Start', () => file.start()));
                    break;
                }
                itemRow.appendChild(this.createButton('Cancel', () => file.cancel()));
                break;
            case pu.UploadStatus.uploading:
                itemRow.appendChild(this.createButton('Cancel', () => file.cancel()));
                break;
            case pu.UploadStatus.uploaded:
            case pu.UploadStatus.failed:
            case pu.UploadStatus.canceled:
                itemRow.appendChild(this.createButton('Delete', () => file.remove()));
                break;
        }
    }

    renderItemProgress(file: pu.IUploadFile): void {
        let itemRow = document.getElementById(file.guid);
        if (!itemRow)
            return;
        for (let i = 0; i < itemRow.childNodes.length; i++) {
            let node = itemRow.childNodes[i];
            if (node.attributes.getNamedItem('class').value === 'table-row-item-progress') {
                node.textContent = file.progress.toString() + '%';
                break;
            }
        }
    }

    renderQueue(queueId: string, queueTitle: string, files: pu.IUploadFile[], queueSettings: pu.IUploadQueueOptions): void {
        let queue = document.getElementById(queueId);
        if (!queue)
            return;
        while (queue.firstChild) queue.removeChild(queue.firstChild);

        queue.appendChild(this.createTextDiv('table-header-title', queueTitle));
        pu.forEach(files, (file: pu.IUploadFile) => {
            if (queue)
                queue.appendChild(this.createQueueRow(file, queueSettings));
        });
    }
}
