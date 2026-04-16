export function mapImageToBody(req, res, next) {

  // CASO SINGLE IMAGE (img)
  if (req.file) {
    // Si es diskStorage tiene filename, si es memoryStorage usamos originalname 
    // para que pase las validaciones de extensión en los schemas.
    const name = req.file.filename || req.file.originalname;
    req.body.img = req.uploadFolder ? `${req.uploadFolder}/${name}` : name;
  } else if (req.body.img === "") {
    delete req.body.img;
  }

  // CASO MULTIPLE IMAGES (logo / isologo)
  if (req.files) {

    if (req.files.logo?.[0]) {
      req.body.logo = `${req.uploadFolder}/${req.files.logo[0].filename}`;
    } else if (req.body.logo === "") {
      delete req.body.logo;
    }

    if (req.files.isologo?.[0]) {
      req.body.isologo = `${req.uploadFolder}/${req.files.isologo[0].filename}`;
    } else if (req.body.isologo === "") {
      delete req.body.isologo;
    }
  }

  next();
}

