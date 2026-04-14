import express from 'express';
import { multerControl } from '../../middleware/multer.middleware.js';
import * as UploadApiController from './../controllers/upload.api.controllers.js';
import {autenticado, admin} from '../../middleware/auth.middleware.js';

const route = express.Router();

// Upload remains the same, expects just the entity folder (e.g., 'drivers')
route.route("/api/upload/:folder")
    .post(multerControl.single("image"), UploadApiController.upload)

// Replace and Delete will now receive ?filePath=grandpick/folder/file
route.route("/api/upload/manage")
    .put([autenticado, admin, multerControl.single("image")], UploadApiController.replaceUpload)
    .delete([autenticado, admin], UploadApiController.deleteUpload);

export default route;