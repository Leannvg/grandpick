import * as UsersServices from "../../services/users.services.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import * as tokenServices from '../../services/token.services.js'
import { resolveImage } from '../../middleware/helpers.middleware.js'
import * as MailService from '../../services/mail.services.js'

function getAll(req, res){

    /* const token = req.headers['auth-token']

    if(!token) {
        res.status(401).json({ message: 'No se envió un token' })
        return;
    } */

    UsersServices.getUsers()
        .then(function(users){
            res.status(200).json(users)
        })
}

function getById(req, res){

    const id = req.params.id;

    UsersServices.getUserById(id)
        .then(function(user){
            res.status(200).json(user)
        })

}

async function addNew (req, res){

    try {
        const user = {
            name: req.body.name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            country: req.body.country,
            points: 0,
            date_register: new Date(),
            rol: "guest",
        };

        const newUser = await UsersServices.createUser(user);
        res.status(200).json(newUser);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    
}

function login(req, res){
    UsersServices.login(req.body)
        .then(function(user){
            const token = jwt.sign(
                {
                    id: user._id, 
                    email: user.email,
                    rol: user.rol
                }, 'grandpick123')
            
            tokenServices.createToken({token, user_id: user._id})

            res.status(200).json({ token, user })
        })
        .catch(err => {
            res.status(400).json({ message: err.message });
        })
}

function logout(req, res){
    const token = req.headers['auth-token']

    tokenServices.deleteByToken(token)

    res.json({ message: 'Logout exitoso' })
}


async function editOne(req, res, next) {
  try {
    const userId = req.params.id;
    const existingUser = await UsersServices.getUserById(userId);

    const finalImage = resolveImage({
      file: req.file,
      currentImage: existingUser.img_user,
      folder: "users",
      defaultImage: "general/profile_default.png",
    });

    const userData = {
      name: req.body.name,
      last_name: req.body.last_name,
      email: req.body.email,
      country: req.body.country,
      img_user: finalImage,
    };

    await UsersServices.editUser(userId, userData);

    res.status(200).json({ message: "User editado con éxito" });
  } catch (err) {
    next(err);
  }
}

/* 
function editOne(req,res){
    const id = req.params.id;


    const finalImage = resolveImage({
        file: req.file,
        currentImage: existingDriver.img,
        folder: "drivers",
        defaultImage: "general/profile_default.png",
    });

    const user = {
        name: req.body.name,
        last_name: req.body.last_name,
        email: req.body.email,
        country: req.body.country,
        img_user: req.body.img_user,
    };

    UsersServices.editUser(id, user)
        .then(function(user){
            if(user){
                res.status(200).json({message: "User editado con éxito"})
            } else {
                res.status(404).json({message: "User no encontrado"})
            }
        })
} */

async function updateSecurity(req, res) {
  try {
    const id = req.params.id;
    const { oldPassword, newPassword, email } = req.body;

    const user = await UsersServices.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si cambia la contraseña → validar contraseña actual
    if (newPassword) {
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) {
        return res.status(400).json({
          errors: { oldPassword: "La contraseña actual no es correcta" }
        });
      }
    }

    const updated = {};

    if (email) updated.email = email;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updated.password = await bcrypt.hash(newPassword, salt);
    }

    await UsersServices.editUser(id, updated);

    res.status(200).json({ message: "Datos actualizados correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en el servidor" });
  }
}


function deleteOne(req,res){
    const id = req.params.id;

    UsersServices.removeUser(id)
        .then(function(user){
            if(user){
                res.status(200).json({message: "User eliminado con éxito"})
            } else {
                res.status(404).json({message: "User no encontrado"})
            }
        })
}

function getProfile(req, res){
    const token = req.headers['auth-token']
    const payload = jwt.verify(token, 'grandpick123')
    UsersServices.getUserById(payload.id)
    .then(function(user){
        res.status(200).json(user)
    })
}

async function getUserStats(req, res) {
  try {
    const id = req.params.id;
    const user = await UsersServices.getUserWithStats(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllUsersStats(req, res) {
  try {
    const users = await UsersServices.getAllUsersWithStats();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function blockUser(req, res) {
    const id = req.params.id;
    try {
      const user = await UsersServices.blockUser(id);
        if (user) {
            res.status(200).json({ message: "Usuario bloqueado con éxito" });
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function unblockUser(req, res) {
    const id = req.params.id;
    try {
      const user = await UsersServices.unblockUser(id);
        if (user) {
            res.status(200).json({ message: "Usuario desbloqueado con éxito" });
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function forgotPassword(req, res) {
  try {
    const token = await UsersServices.forgotPassword(req.body.email);

    if (token) {
      await MailService.sendResetPassword({
        email: req.body.email,
        token,
      });
    }

    res.json({
      message: "Si el email existe, te enviamos un link para recuperar la contraseña."
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Error interno" });
  }
}

async function resetPassword(req, res) {
  try {
    await UsersServices.resetPassword(
      req.body.token,
      req.body.password
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


export{
    getAll,
    addNew,
    login,
    getById,
    logout,
    editOne,
    deleteOne,
    getProfile,
    getUserStats,
    getAllUsersStats,
    blockUser,
    unblockUser,
    updateSecurity,
    forgotPassword,
    resetPassword
}