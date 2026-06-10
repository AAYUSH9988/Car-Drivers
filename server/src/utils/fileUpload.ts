import ImageKit from '@imagekit/nodejs';
import multer from 'multer';
import { env } from '../config/env';

let _imagekit: InstanceType<typeof ImageKit> | null = null;

const getImageKit = (): InstanceType<typeof ImageKit> => {
  if (!_imagekit) {
    _imagekit = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY ?? '' });
  }
  return _imagekit;
};

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext  = file.originalname.toLowerCase().split('.').pop() ?? '';
  const mime = file.mimetype.split('/')[1] ?? '';
  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, webp) and PDFs are allowed'));
  }
};

export const upload = multer({
  storage:    multer.memoryStorage(),
  fileFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },
});

export const uploadToImageKit = async (
  buffer: Buffer,
  fileName: string,
  folder = 'gopilot/uploads',
): Promise<{ url: string; fileId: string }> => {
  const result = await getImageKit().files.upload({
    file:              buffer as unknown as string,
    fileName:          `${Date.now()}-${fileName}`,
    folder,
    useUniqueFileName: true,
  });
  return { url: result.url ?? '', fileId: result.fileId ?? '' };
};

export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  if (!fileId) return;
  await getImageKit().files.delete(fileId);
};
