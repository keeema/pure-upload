import express = require("express");
import multer = require("multer");
import cors = require("cors");

const app: express.Application = express();

app.use(cors());

const args = process.argv.slice(2);
let listenUpload = true;

if (args.length && args.filter((arg) => arg === "fake" || arg === "f").length) listenUpload = false;

if (listenUpload) {
    const storage = multer.diskStorage({
        destination: "./uploads/",
        filename: (_req, file, callback) => callback(null, file.fieldname + "-" + Date.now()),
    });
    const upload = multer({ storage: storage }).any();

    console.log("Running in file-accepting mode.");
    app.post("/api/test", function (req, res) {
        upload(req, res, (err: string) => {
            if (err) {
                console.log(`Error uploading file ${req.file ? req.file.filename : ""}: ${err}`);
                return res.end("Error uploading file.");
            }
            console.log(`File ${req.file ? req.file.filename : ""} is uploaded`);
            res.end("File is uploaded");
        });
    });

    app.use("/api/check", (_request: express.Request, response: express.Response) => {
        response.send("API OK");
    });
} else {
    console.log("Running in fake mode.");
}

app.use(express.static("./example/public"));

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
