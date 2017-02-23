interface ILocalizer {
    fileSizeInvalid: (maxFileSize: number) => string;
    fileTypeInvalid: (accept: string) => string;
    invalidResponseFromServer: () => string;
}

function getDefaultLocalizer(): ILocalizer {
    return {
        fileSizeInvalid: (maxFileSize) => 'The selected file exceeds the allowed size of ' + maxFileSize
            + ' or its size is 0 MB. Please choose another file.',
        fileTypeInvalid: accept => 'File format is not allowed. Only ' + (accept ? accept : '') + ' files are allowed.',
        invalidResponseFromServer: () => 'Invalid response from server'
    };
}