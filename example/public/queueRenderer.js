var getQueueRenderer = function () {
    return new QueueRenderer();
};
var QueueRenderer = (function () {
    function QueueRenderer() {
    }
    QueueRenderer.prototype.createTextDiv = function (className, value) {
        var element = document.createElement("div");
        element.className = className;
        element.innerHTML = value;
        return element;
    };
    QueueRenderer.prototype.createButton = function (value, callback) {
        var element = document.createElement("button");
        element.className = "table-row-button";
        element.innerHTML = value;
        element.addEventListener("click", callback);
        return element;
    };
    QueueRenderer.prototype.createQueueRow = function (file, queueSettings) {
        var itemRow = document.createElement("div");
        itemRow.id = file.guid;
        itemRow.className = "table-row-item";
        this.renderQueueRowContent(itemRow, file, queueSettings);
        return itemRow;
    };
    QueueRenderer.prototype.translateFileStatus = function (file) {
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
    };
    QueueRenderer.prototype.renderQueueRowContent = function (itemRow, file, queueSettings) {
        while (itemRow.firstChild)
            itemRow.removeChild(itemRow.firstChild);
        itemRow.appendChild(this.createTextDiv('table-row-item-status', this.translateFileStatus(file)));
        itemRow.appendChild(this.createTextDiv('table-row-item-name', file.name));
        itemRow.appendChild(this.createTextDiv('table-row-item-progress', file.progress.toString() + "%"));
        switch (file.uploadStatus.toString()) {
            case pu.UploadStatusStatic.queued:
                if (!queueSettings.autoStart) {
                    itemRow.appendChild(this.createButton("Start", function () { return file.start(); }));
                    break;
                }
            case pu.UploadStatusStatic.uploading:
                itemRow.appendChild(this.createButton("Cancel", function () { return file.cancel(); }));
                break;
            case pu.UploadStatusStatic.uploaded:
            case pu.UploadStatusStatic.failed:
            case pu.UploadStatusStatic.canceled:
                itemRow.appendChild(this.createButton("Delete", function () { return file.remove(); }));
                break;
        }
    };
    QueueRenderer.prototype.renderItemProgress = function (queueId, file) {
        var itemRow = document.getElementById(file.guid);
        for (var i = 0; i < itemRow.childNodes.length; i++) {
            var node = itemRow.childNodes[i];
            if (node.attributes.getNamedItem('class').value == 'table-row-item-progress') {
                node.textContent = file.progress.toString() + "%";
                break;
            }
        }
    };
    QueueRenderer.prototype.renderQueue = function (queueId, queueTitle, files, queueSettings) {
        var _this = this;
        var queue = document.getElementById(queueId);
        while (queue.firstChild)
            queue.removeChild(queue.firstChild);
        queue.appendChild(this.createTextDiv("table-header-title", queueTitle));
        files.forEach(function (file) {
            queue.appendChild(_this.createQueueRow(file, queueSettings));
        });
    };
    return QueueRenderer;
})();
