import multer from "multer";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";

//specifically for handling es6 in file system
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//upload directory 
const uploadDirectory = path.join(__dirname, 'uploads');


//to check if the destination folder exists or not
if(!fs.existsSync(uploadDirectory)) fs.mkdirSync(uploadDirectory);


const storage = multer.diskStorage({
    destination:(req, file, cb)=>cb(null, uploadDirectory),
    filename:(req, file, cb)=>cb(null, Date.now() + '.jpg')
});

const mimetypes = ['image/jpg', 'image/jpeg', 'image/png']
const upload = multer({
    storage, 
    fileFilter: (req, file, cb)=>{
        cb(null, mimetypes.includes(file.mimetype))
    }
})

export default upload;