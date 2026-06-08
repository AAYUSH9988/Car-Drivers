import ImageKit from '@imagekit/nodejs';
import multer from 'multer';

// Lazy singleton — defer construction until first upload call so that
// dotenv.config() has already run before we read process.env values.
let _imagekit = null;
const getImageKit = () => {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return _imagekit;
};

// Store files in memory — ImageKit handles persistence
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const extOk  = allowed.test(file.originalname.toLowerCase().split('.').pop());
  const mimeOk = allowed.test(file.mimetype.split('/')[1]);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp) and PDFs are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

/**
 * Upload a buffer to ImageKit.
 * @param {Buffer} buffer  — file bytes (from req.file.buffer)
 * @param {string} fileName
 * @param {string} folder  — e.g. 'gopilot/profiles'
 * @returns {{ url: string, fileId: string }}
 */
export const uploadToImageKit = async (buffer, fileName, folder = 'gopilot/uploads') => {
  const result = await getImageKit().files.upload({
    file:     buffer,
    fileName: `${Date.now()}-${fileName}`,
    folder,
    useUniqueFileName: true,
  });
  return { url: result.url, fileId: result.fileId };
};

/**
 * Delete a file from ImageKit by its fileId.
 */
export const deleteFromImageKit = async (fileId) => {
  if (!fileId) return;
  await getImageKit().files.deleteFile(fileId);
};

export default upload;
