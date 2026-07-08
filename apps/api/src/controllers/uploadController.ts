import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { uploadToCloudinary } from '../utils/cloudinary';

/**
 * POST /api/upload
 * Accepts a single file field named "file" and uploads it to Cloudinary.
 * Returns { url: string } on success.
 */
export const uploadFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) throw createError('No file provided', 400);

    const folder = (req.query.folder as string) || 'devverse/general';
    const url = await uploadToCloudinary(req.file.buffer, folder);

    res.json({ success: true, url });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
