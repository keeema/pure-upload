var express = require("express");
var multer  = require('multer');
var app=express();
var done=false;

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },

onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

/*Handling routes.*/

app.get('/index.html',function(req,res){
      res.sendfile("index.html");
});

app.get('/index.js',function(req,res){
      res.sendfile("index.js");
});

app.post('/api/test',function(req,res){
  if(done==true){
    console.log(req.files);
    res.end("File uploaded.");
  }
});

/*Run the server.*/
app.listen(3000,function(){
    console.log("Working on port 3000");
});
