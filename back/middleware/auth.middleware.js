import jwt from "jsonwebtoken"
import * as usersServices from '../services/users.services.js'
import * as tokenServices from '../services/token.services.js'

function autenticado(req, res, next) {
  const token = req.headers['auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'No se envió un token' });
  }

  try {
    const payload = jwt.verify(token, 'grandpick123');

    tokenServices.findByToken(token)
      .then(tokenEncontrado => {
        if (!tokenEncontrado) {
          return res.status(401).json({ message: 'Token inválido' });
        }

        usersServices.getUserById(payload.id)
          .then(usuario => {
            req.usuario = {
              id: usuario._id,
              rol: usuario.rol,
              email: usuario.email
            };
            next();
          });
      });

  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}


function admin(req, res, next) {
    console.log(req)
    if (!req.usuario) {
        return res.status(401).json({ message: 'No autenticado' })
    }

    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            message: 'No tienes permisos de administrador'
        })
    }

    next()
}


/* function admin(req, res, next) {
    const token = req.headers['auth-token']

    if(!token) {
        return res.status(401).json({ message: 'No se envió un token' });
    }

    try {
        const payload = jwt.verify(token, 'grandpick123');
        usersServices.getUserById(payload.id)
        .then(usuario =>{
            if (usuario.rol !== 'admin'){
                return res.status(401).json({ message: 'No tienes las credenciales necesarias para realizar esta acción' })
            }
            console.log("SOS ADMIN")
        })
        next();
    } catch (err){
        console.log("NO SOS ADMIN")
        return res.status(401).json({ message: 'Token invalido' });
    }
} */


function selfOrAdmin(req, res, next) {
    const userId = req.params.id

    if (req.usuario.rol === 'admin' || req.usuario._id == userId) {
        return next()
    }

    return res.status(403).json({
        message: 'No tienes permiso para acceder a este recurso'
    })
}


export {
    autenticado,
    admin,
    selfOrAdmin
}
