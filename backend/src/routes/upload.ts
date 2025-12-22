/**
 * Upload Routes
 * Handles presigned URL generation for direct S3 uploads
 */

import express, { Request, Response } from 'express';
import * as s3Service from '../services/s3Service';

const router = express.Router();

/**
 * Get presigned URL for profile picture upload
 */
router.post('/profile-picture', async (req: Request, res: Response) => {
  try {
    const { userId, fileExtension } = req.body;

    if (!userId || !fileExtension) {
      return res.status(400).json({ error: 'userId and fileExtension are required' });
    }

    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!s3Service.validateFileExtension(`file.${fileExtension}`, allowedExtensions)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed: jpg, jpeg, png, webp' });
    }

    // Check if S3 is configured
    if (!s3Service.isS3Configured()) {
      return res.status(503).json({ 
        error: 'S3 not configured',
        message: 'Image upload is temporarily unavailable'
      });
    }

    // Generate presigned URL
    const contentType = s3Service.getContentType(fileExtension);
    const result = await s3Service.generatePresignedUploadUrl({
      folder: 'profile-pictures',
      userId,
      fileExtension,
      contentType,
      maxSizeBytes: 5 * 1024 * 1024, // 5MB max
    });

    res.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      cdnUrl: result.cdnUrl,
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    console.error('Error generating profile picture upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * Get presigned URL for activity image upload
 */
router.post('/activity-image', async (req: Request, res: Response) => {
  try {
    const { activityId, fileExtension, userId } = req.body;

    if (!activityId || !fileExtension) {
      return res.status(400).json({ error: 'activityId and fileExtension are required' });
    }

    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!s3Service.validateFileExtension(`file.${fileExtension}`, allowedExtensions)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed: jpg, jpeg, png, webp' });
    }

    if (!s3Service.isS3Configured()) {
      return res.status(503).json({ 
        error: 'S3 not configured',
        message: 'Image upload is temporarily unavailable'
      });
    }

    const contentType = s3Service.getContentType(fileExtension);
    const result = await s3Service.generatePresignedUploadUrl({
      folder: 'activity-images',
      activityId,
      userId,
      fileExtension,
      contentType,
      maxSizeBytes: 10 * 1024 * 1024, // 10MB max
    });

    res.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      cdnUrl: result.cdnUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Error generating activity image upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * Get presigned URL for vibe story media upload
 */
router.post('/story-media', async (req: Request, res: Response) => {
  try {
    const { userId, fileExtension, mediaType } = req.body;

    if (!userId || !fileExtension || !mediaType) {
      return res.status(400).json({ 
        error: 'userId, fileExtension, and mediaType are required' 
      });
    }

    // Validate file extension based on media type
    let allowedExtensions: string[];
    let maxSize: number;

    if (mediaType === 'image') {
      allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      maxSize = 10 * 1024 * 1024; // 10MB
    } else if (mediaType === 'video') {
      allowedExtensions = ['mp4', 'mov'];
      maxSize = 100 * 1024 * 1024; // 100MB
    } else {
      return res.status(400).json({ error: 'Invalid mediaType. Must be "image" or "video"' });
    }

    if (!s3Service.validateFileExtension(`file.${fileExtension}`, allowedExtensions)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}` 
      });
    }

    if (!s3Service.isS3Configured()) {
      return res.status(503).json({ 
        error: 'S3 not configured',
        message: 'Media upload is temporarily unavailable'
      });
    }

    const contentType = s3Service.getContentType(fileExtension);
    const result = await s3Service.generatePresignedUploadUrl({
      folder: 'vibe-stories',
      userId,
      fileExtension,
      contentType,
      maxSizeBytes: maxSize,
    });

    res.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      cdnUrl: result.cdnUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Error generating story media upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * Get presigned URL for generic user upload
 */
router.post('/user-upload', async (req: Request, res: Response) => {
  try {
    const { userId, fileExtension } = req.body;

    if (!userId || !fileExtension) {
      return res.status(400).json({ error: 'userId and fileExtension are required' });
    }

    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!s3Service.validateFileExtension(`file.${fileExtension}`, allowedExtensions)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}` 
      });
    }

    if (!s3Service.isS3Configured()) {
      return res.status(503).json({ 
        error: 'S3 not configured',
        message: 'Upload is temporarily unavailable'
      });
    }

    const contentType = s3Service.getContentType(fileExtension);
    const result = await s3Service.generatePresignedUploadUrl({
      folder: 'user-uploads',
      userId,
      fileExtension,
      contentType,
      maxSizeBytes: 10 * 1024 * 1024, // 10MB max
    });

    res.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      cdnUrl: result.cdnUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Error generating user upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * Delete an uploaded file
 */
router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { s3Key, userId } = req.body;

    if (!s3Key || !userId) {
      return res.status(400).json({ error: 's3Key and userId are required' });
    }

    // Verify user owns this file (check if s3Key contains userId)
    if (!s3Key.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }

    if (!s3Service.isS3Configured()) {
      return res.status(503).json({ 
        error: 'S3 not configured',
        message: 'Delete is temporarily unavailable'
      });
    }

    await s3Service.deleteFile(s3Key);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * Health check for S3 configuration
 */
router.get('/status', (req: Request, res: Response) => {
  const isConfigured = s3Service.isS3Configured();
  
  res.json({
    s3Configured: isConfigured,
    bucket: isConfigured ? process.env.S3_BUCKET_NAME : null,
    region: isConfigured ? process.env.AWS_REGION : null,
    cdnDomain: process.env.CLOUDFRONT_DOMAIN || null,
  });
});

export default router;
