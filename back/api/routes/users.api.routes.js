import express from "express";
import * as UsersApiController from "../controllers/users.api.controllers.js";
import { validateRegister, validateLogin, validateUpdateSecurity, validateProfileData } from './../../middleware/forms.middleware.js';
import { multerControl } from '../../middleware/multer.middleware.js';
import { uploadContext } from "../../middleware/uploadContext.middleware.js";
import { mapImageToBody } from "../../middleware/mapImageToBody.middleware.js";
import { autenticado, admin, selfOrAdmin} from '../../middleware/auth.middleware.js';

const route = express.Router();

// PUBLIC ROUTES
route.route("/api/users/login")
    .post(validateLogin, UsersApiController.login)

route.route("/api/users/logout")
    .post(autenticado, UsersApiController.logout)

route.route("/api/users/forgot-password")
    .post(UsersApiController.forgotPassword);

route.route("/api/users/reset-password")
    .post(UsersApiController.resetPassword);

// PRIVATE ROUTES
route.route("/api/user/profile")    
    .get(autenticado, UsersApiController.getProfile)

route.route("/api/users/:id")
    .get(autenticado, selfOrAdmin, UsersApiController.getById)
    .delete(autenticado, admin, UsersApiController.deleteOne)
    .patch(
        autenticado,
        uploadContext("users"),
        multerControl.single("image"),
        mapImageToBody,
        validateProfileData,
        UsersApiController.editOne
    )

route.route("/api/users/:id/security")
    .patch(
        autenticado,
        validateUpdateSecurity,
        UsersApiController.updateSecurity
    )

route.route("/api/users")
    .get(autenticado, admin, UsersApiController.getAll)
    .post(validateRegister, UsersApiController.addNew)

route.route("/api/users/:id/stats")
    .get(autenticado, UsersApiController.getUserStats)

route.route("/api/users-stats")
    .get(autenticado, admin, UsersApiController.getAllUsersStats)

route.route("/api/users/:id/block")
    .post(autenticado, admin, UsersApiController.blockUser)

route.route("/api/users/:id/unblock")
    .post(autenticado, admin, UsersApiController.unblockUser)





export default route;