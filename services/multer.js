import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const _dirname= path.dirname(fileURLToPath(import.meta.url));

const uploadDirectory= path.join(_dirname, "uploads");

if(!fs.existsSync(uploadDirectory)) fs.mkdirSync(uploadDirectory);

const storage= multer.diskStorage(
    {
        destination: (req, file, cb)=>cb(null, uploadDirectory),
        filename: (req, file, cb)=>cb(null, Date.now()+".jpg")
    }
);

const upload= multer({
    storage,
    fileFilter: (req, file, cb)=>{ cb(null, file.mimetype==="image/jpg" || file.mimetype==="image/jpeg" || file.mimetype==="image/png")}
})

export default upload;