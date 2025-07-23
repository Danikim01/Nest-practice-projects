export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);
  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  } else {
    callback(new Error('Invalid file extension'), false);
  }
};