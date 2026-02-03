import express from 'express';
import { multerControl } from '../../middleware/multer.middleware.js';
import * as UploadApiController from './../controllers/upload.api.controllers.js';
import {autenticado, admin} from '../../middleware/auth.middleware.js';

const route = express.Router();


route.route("/api/upload/:folder")
    .post(multerControl.single("image"), UploadApiController.upload)


route.route("/api/upload/:folder/:filename")
    .put([autenticado, admin, multerControl.single("image")], UploadApiController.replaceUpload)
    .delete([autenticado, admin], UploadApiController.deleteUpload);


export default route;