import express = require("express");
import multer = require("multer");

var app: express.Application = express();
var done = false;

app.use('/api/test', multer({
    dest: './uploads/',
    rename: (fieldname, filename) => filename + Date.now(),

    onFileUploadStart: (file: Express.Multer.File) => {
        console.log(file.originalname + ' is starting ...')
    },

    onFileUploadComplete: (file) => {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
    }
}));

app.use(express.static('./example'));
app.use(express.static('./dist'));

app.post('/api/test', (req, res: express.Response) => {
    if (done == true) {
        res.send("File uploaded.");
        done = false;
    }
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
