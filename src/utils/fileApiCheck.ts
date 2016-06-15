const isFileApi: boolean = !!((<{ File?: Object }>window).File && (<{ FormData?: Object }>window).FormData);
