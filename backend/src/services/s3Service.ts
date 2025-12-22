/**
 * AWS S3 Service
 * Handles image uploads and presigned URL generation
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 client lazily to ensure env vars are loaded
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'vibe-app-prod-eu';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || '';

export interface UploadConfig {
  folder: 'profile-pictures' | 'activity-images' | 'vibe-stories' | 'user-uploads';
  userId?: string;
  activityId?: string;
  fileExtension: string;
  contentType: string;
  maxSizeBytes?: number;
}

/**
 * Generate a presigned URL for direct upload from mobile client
 */
export async function generatePresignedUploadUrl(config: UploadConfig): Promise<{
  uploadUrl: string;
  s3Key: string;
  cdnUrl: string;
}> {
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const filename = `${timestamp}-${randomId}.${config.fileExtension}`;
  
  // Build S3 key based on folder structure
  let s3Key: string;
  switch (config.folder) {
    case 'profile-pictures':
      s3Key = `profile-pictures/${config.userId}/${filename}`;
      break;
    case 'activity-images':
      s3Key = `activity-images/${config.activityId}/${filename}`;
      break;
    case 'vibe-stories':
      s3Key = `vibe-stories/images/${filename}`;
      break;
    case 'user-uploads':
      s3Key = `user-uploads/${config.userId}/${filename}`;
      break;
    default:
      s3Key = `uploads/${filename}`;
  }

  // Create presigned URL for PUT operation
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: config.contentType,
    // Optional: Add metadata
    Metadata: {
      uploadedBy: config.userId || 'anonymous',
      uploadedAt: new Date().toISOString(),
    },
  });

  // Generate presigned URL (valid for 5 minutes)
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 });

  // Generate CDN URL for accessing the file
  const cdnUrl = CLOUDFRONT_DOMAIN
    ? `https://${CLOUDFRONT_DOMAIN}/${s3Key}`
    : `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

  return {
    uploadUrl,
    s3Key,
    cdnUrl,
  };
}

/**
 * Generate a presigned URL for downloading/viewing a file
 */
export async function generatePresignedDownloadUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  return await getSignedUrl(getS3Client(), command, { expiresIn });
}

/**
 * Delete a file from S3
 */
export async function deleteFile(s3Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  await getS3Client().send(command);
}

/**
 * Upload a file directly from backend (for migrations or server-side uploads)
 */
export async function uploadFile(
  fileBuffer: Buffer,
  s3Key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await getS3Client().send(command);

  // Return CDN URL
  return CLOUDFRONT_DOMAIN
    ? `https://${CLOUDFRONT_DOMAIN}/${s3Key}`
    : `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
}

/**
 * Extract S3 key from CDN or S3 URL
 */
export function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // CloudFront URL
    if (CLOUDFRONT_DOMAIN && urlObj.hostname === CLOUDFRONT_DOMAIN) {
      return urlObj.pathname.substring(1); // Remove leading slash
    }
    
    // S3 URL
    if (urlObj.hostname.includes('s3.amazonaws.com')) {
      return urlObj.pathname.substring(1); // Remove leading slash
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = path.extname(filename).toLowerCase().substring(1);
  return allowedExtensions.includes(ext);
}

/**
 * Get content type from file extension
 */
export function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };
  
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  );
}

export default {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteFile,
  uploadFile,
  extractS3Key,
  validateFileExtension,
  getContentType,
  isS3Configured,
};
