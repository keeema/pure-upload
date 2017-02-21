import express = require('express');
import multer = require('multer');
let cors = require('cors');

let app: express.Application = express();
let done = false;

app.use(cors());

let args = process.argv.slice(2);
let listenUpload = true;

if (args.length && args.filter(arg => arg === 'fake' || arg === 'f').length)
    listenUpload = false;

if (listenUpload) {
    console.log('Running in file-accepting mode.');
    app.use('/api/test', multer({
        dest: './uploads/',
        rename: (fieldname, filename) => filename + Date.now(),

        onFileUploadStart: (file: Express.Multer.File) => {
            console.log(file.originalname + ' is starting ...');
        },

        onFileUploadComplete: (file) => {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
            done = true;
        }
    }));

    app.use('/api/check', (request: express.Request, response: express.Response) => {
        response.send('API OK');
    });
} else {
    console.log('Running in fake mode.');
}

app.use(express.static('./example/public'));

app.post('/api/test', (req, res: express.Response) => {
    if (done === true) {
        res.send('File uploaded.');
        done = false;
    }
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});
