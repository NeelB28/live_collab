// Custom hooks for Firebase storage operations
import { useState, useCallback } from "react";
import {
  uploadFile,
  getFileUrl,
  deleteFile,
  listUserFiles,
} from "@/lib/firebase/storage";
import { useAuth } from "@/context/AuthContext";
import {
  FileUploadResult,
  FileValidationResult,
  FirebaseFileInfo,
} from "@/types/storage";

interface UseFirebaseStorageReturn {
  // Upload operations
  uploadFile: (file: File) => Promise<FileUploadResult>;
  uploading: boolean;
  uploadProgress: number;

  // File operations
  getFileUrl: (
    filePath: string
  ) => Promise<{ url: string | null; error: string | null }>;
  deleteFile: (filePath: string) => Promise<{ error: string | null }>;
  listFiles: () => Promise<{
    data: FirebaseFileInfo[] | null;
    error: string | null;
  }>;

  // Validation
  validateFile: (file: File) => FileValidationResult;

  // State management
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for Firebase Storage operations
 * Provides file upload, download, deletion, and listing functionality
 */
export const useFirebaseStorage = (): UseFirebaseStorageReturn => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): FileValidationResult => {
    // Check file type - only PDF allowed
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Only PDF files are allowed. Please select a PDF file.",
      };
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error:
          "File size must be less than 50MB. Please choose a smaller file.",
      };
    }

    // Check if file name is too long
    if (file.name.length > 255) {
      return {
        isValid: false,
        error: "File name is too long. Please rename your file.",
      };
    }

    return { isValid: true };
  }, []);

  /**
   * Handle file upload with progress tracking
   */
  const handleUpload = useCallback(
    async (file: File): Promise<FileUploadResult> => {
      if (!user) {
        const errorMsg = "You must be signed in to upload files";
        setError(errorMsg);
        return { data: null, error: errorMsg };
      }

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error || "Invalid file");
        return { data: null, error: validation.error || "Invalid file" };
      }

      setUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const result = await uploadFile(
          file,
          user.id,
          {
            contentType: file.type,
            cacheControl: "public, max-age=3600",
          },
          // Progress callback
          (progress) => {
            setUploadProgress(progress);
          }
        );

        if (result.error) {
          setError(result.error);
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        setError(errorMsg);
        return { data: null, error: errorMsg };
      } finally {
        setUploading(false);
        // Reset progress after 2 seconds
        setTimeout(() => setUploadProgress(0), 2000);
      }
    },
    [user, validateFile]
  );

  /**
   * List user's files
   */
  const listFiles = useCallback(async () => {
    if (!user) {
      const errorMsg = "You must be signed in to list files";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }

    try {
      const result = await listUserFiles(user.id);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to list files";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Upload operations
    uploadFile: handleUpload,
    uploading,
    uploadProgress,

    // File operations
    getFileUrl,
    deleteFile,
    listFiles,

    // Validation
    validateFile,

    // State management
    error,
    clearError,
  };
};
