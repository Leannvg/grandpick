export function uploadContext(folderName) {
  return (req, res, next) => {
    req.uploadFolder = folderName;
    next();
  };
}
