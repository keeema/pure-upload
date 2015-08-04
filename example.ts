import express = require("express");
import multer = require("multer");

var app: express.Application = express();
var done = false;

app.use('/api/test', multer({
    dest: './uploads/',
    rename: function(fieldname, filename) {
        return filename + Date.now();
    },

    onFileUploadStart: function(file: Express.Multer.File) {
        console.log(file.originalname + ' is starting ...')
    },

    

    onFileUploadComplete: function(file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
    }
}));

app.use(express.static('example'));
app.use(express.static('src'));

app.post('/api/test', function(req, res: express.Response) {
    if (done == true) {
        res.send("File uploaded.");
        done = false;
    }
});

/*Run the server.*/
app.listen(3000, function() {
    console.log("Working on port 3000");
});
