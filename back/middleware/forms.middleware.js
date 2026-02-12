import { driverSchema, registerSchema, loginSchema, circuitSchema, teamSchema, raceSchema, updateSecuritySchema, profileDataSchema} from "../schemas/schemas.js";

/* export async function validateDriver(req, res, next) {
  try {
    console.log("Validating driver data:", req.body);
    await driverSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("Errores de validación detectados:", err);
    const formatted = {};
    err.inner.forEach(e => {
        formatted[e.path] = e.message;
    });
    res.status(400).json({ errors: formatted });
  }
} */
export async function validateTeam(req, res, next) {
    try {
      console.log("Validating team data:", req.body);
      await teamSchema.validate(req.body, { abortEarly: false });
      next();
    } catch (err) {
      const formatted = {};
      err.inner.forEach(e => {
        formatted[e.path] = e.message;
      });

      err.status = 400;
      err.formattedErrors = formatted;

      next(err); // 👈 CLAVE
    }
  }  

export async function validateCircuit(req, res, next) {
  try {
    console.log("Validating circuit data:", req.body);
    await circuitSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    const formatted = {};
    err.inner.forEach(e => {
      formatted[e.path] = e.message;
    });

    err.status = 400;
    err.formattedErrors = formatted;

    next(err); // 👈 CLAVE
  }
}

export async function validateDriver(req, res, next) {
  try {
    await driverSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    const formatted = {};
    err.inner.forEach(e => {
      formatted[e.path] = e.message;
    });

    err.status = 400;
    err.formattedErrors = formatted;

    next(err); // 👈 CLAVE
  }
}


export async function validateRegister(req, res, next) {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("Errores de validación detectados:", err);
    const formatted = {};
    err.inner.forEach(e => {
        formatted[e.path] = e.message;
    });
    res.status(400).json({ errors: formatted });
  }
}

export async function validateLogin(req, res, next) {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("Errores de validación detectados:", err);
    const formatted = {}; 
    err.inner.forEach(e => {
        formatted[e.path] = e.message;
    });
    res.status(400).json({ errors: formatted });
  }
}





export async function validateRace(req, res, next) {
    try {
      console.log(req.body)
      await raceSchema.validate(req.body, { abortEarly: false });
      next();
    } catch (err) {
      console.log("Errores de validación detectados:", err);
      const formatted = {};
      err.inner.forEach(e => {
          formatted[e.path] = e.message;
      });
      res.status(400).json({ errors: formatted });
    }
  }

export async function validateUpdateSecurity(req, res, next) {
  try {
    await updateSecuritySchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("Errores de validación detectados:", err);

    const formatted = {};
    err.inner.forEach(e => {
      formatted[e.path] = e.message;
    });

    res.status(400).json({ errors: formatted });
  }
}

export async function validateProfileData(req, res, next) {
  try {
    await profileDataSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("Errores de validación detectados:", err);
    
    const formatted = {};
    err.inner.forEach(e => {
        formatted[e.path] = e.message;
    });
    res.status(400).json({ errors: formatted });
  }
}