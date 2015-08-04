window.onload = () => {
    document.getElementsByName('ok')[0].addEventListener('click', event  => {
        var fileInput = <any>document.getElementsByName('file')[0];
        var progressElement = document.getElementById('progress');
        var options = {
            url: '/api/test',
            method: 'POST',
            onProgressCallback: (file: XhrFile) => progressElement.innerText = file.progress + '%',
            onErrorCallback: (file: XhrFile) => alert(file.responseText + ' (' + file.responseCode + ')')
        }
        var uploader = new XhrUploader(options);
        uploader.upload(fileInput.files);
        event.preventDefault();
    });
}
