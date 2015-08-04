window.onload = () => {
   document.getElementsByName('ok')[0].addEventListener('click', event  => {
        var fileInput = <any>document.getElementsByName('file')[0];
        var options = {
           url:'/api/test',
           method: 'POST',
           onProgressCallback: (file:XhrFile)=>{console.log(file.progress + '%')}
        }
        var uploader = new XhrUploader(options);
        uploader.upload(fileInput.files);
        event.preventDefault();
    });
}
