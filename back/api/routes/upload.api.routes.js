import express from 'express';
import { multerControl } from '../../middleware/multer.middleware.js';
import * as UploadApiController from './../controllers/upload.api.controllers.js';
import {autenticado, admin} from '../../middleware/auth.middleware.js';

const route = express.Router();

// Upload se mantiene igual, solo espera la carpeta de la entidad (ej. 'drivers')
route.route("/api/upload/:folder")
    .post(multerControl.single("image"), UploadApiController.upload)

// Replace y Delete ahora recibirán ?filePath=grandpick/folder/file
route.route("/api/upload/manage")
    .put([autenticado, admin, multerControl.single("image")], UploadApiController.replaceUpload)
    .delete([autenticado, admin], UploadApiController.deleteUpload);

export default route;