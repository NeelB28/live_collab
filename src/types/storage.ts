// Storage-related TypeScript types for Firebase

/**
 * File upload result interface
 */
export interface FileUploadResult {
  data: {
    path: string;
    downloadURL: string;
    fullPath: string;
    name: string;
  } | null;
  error: string | null;
}

/**
 * Upload progress interface for tracking file upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * File upload options for Supabase storage
 */
export interface FileUploadOptions {
  cacheControl?: string;
  contentType?: string;
}

/**
 * Document metadata interface for storing in database
 */
export interface DocumentMetadata {
  id?: string;
  title: string;
  fileName: string;
  fileUrl: string; // Firebase download URL
  fileSize: number;
  mimeType: string;
  userId: string;
  uploadedAt?: Date;
  updatedAt?: Date;
}

/**
 * Supported file types for upload
 */
export type AllowedFileType = "application/pdf";

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FirebaseFileInfo {
  name: string;
  fullPath: string;
  downloadURL: string;
}
