import express from 'express';
import * as teamsControllers from './../controllers/teams.api.controllers.js';
import { validateTeam } from './../../middleware/forms.middleware.js';
import { multerControl } from '../../middleware/multer.middleware.js';
import { uploadContext } from "../../middleware/uploadContext.middleware.js";
import { mapImageToBody } from "../../middleware/mapImageToBody.middleware.js";

const router = express.Router();

router.route('/api/teams')
  .get(teamsControllers.findAll)
   .post(
    uploadContext("teams"),
    multerControl.fields([
      { name: "logo", maxCount: 1 },
      { name: "isologo", maxCount: 1 },
    ]),
    mapImageToBody,
    validateTeam,
    teamsControllers.create
  );

router.route('/api/teams/:teamId')
  .get(teamsControllers.findById)
  .delete(teamsControllers.deleteById)
  .patch(
    uploadContext("teams"),
    multerControl.fields([
      { name: "logo", maxCount: 1 },
      { name: "isologo", maxCount: 1 },
    ]),
    mapImageToBody,
    validateTeam,
    teamsControllers.editById
  );

router.route("/api/dashboard/teams/:teamId")
  .patch(teamsControllers.editById);

export default router;
