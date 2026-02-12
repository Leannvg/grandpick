export function mapImageToBody(req, res, next) {

  // CASO SINGLE IMAGE (img)
  if (req.file) {
    req.body.img = `${req.uploadFolder}/${req.file.filename}`;
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

