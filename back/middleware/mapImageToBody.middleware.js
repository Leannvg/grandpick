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

    // CASO MULTIPLE IMAGES (image / banner_img, circuitos) — igual que
    // arriba pero con el fallback a originalname del caso single (con
    // memoryStorage, que es lo que usa multerControl, el file no tiene
    // filename, solo originalname/buffer).
    if (req.files.image?.[0]) {
      const name = req.files.image[0].filename || req.files.image[0].originalname;
      req.body.img = req.uploadFolder ? `${req.uploadFolder}/${name}` : name;
    } else if (req.body.img === "") {
      delete req.body.img;
    }

    if (req.files.banner_img?.[0]) {
      const name = req.files.banner_img[0].filename || req.files.banner_img[0].originalname;
      req.body.banner_img = req.uploadFolder ? `${req.uploadFolder}/${name}` : name;
    } else if (req.body.banner_img === "") {
      delete req.body.banner_img;
    }
  }

  next();
}

