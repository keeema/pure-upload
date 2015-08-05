window.onload = () => {
    document.getElementsByName('ok')[0].addEventListener('click', event  => {
        var fileInput = <any>document.getElementsByName('file')[0];
        var progressElement = document.getElementById('progress');
        var options = {
            url: '/api/test',
            method: 'POST',
            onProgressCallback: (file: IUploadFile) => progressElement.innerText = file.progress + '%',
            onErrorCallback: (file: IUploadFile) => alert(file.responseText + ' (' + file.responseCode + ')')
        }
        var uploader = getUploadCore(options);
        uploader.upload(fileInput.files);
        event.preventDefault();
    });
}
