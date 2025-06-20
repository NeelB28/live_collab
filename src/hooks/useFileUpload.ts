import { useState, useCallback } from "react";
import { uploadFile, getFileUrl } from "@/lib/firebase/storage";
import { useAuth } from "@/context/AuthContext";
import {
  FileUploadResult,
  UploadProgress,
  FileValidationResult,
} from "@/types/storage";

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<FileUploadResult>;
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  clearError: () => void;
  validateFile: (file: File) => FileValidationResult;
}

/**
 * Custom hook for handling file uploads to Firebase Storage
 * Provides file validation, upload progress, and error handling
 */
export const useFileUpload = (): UseFileUploadReturn => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
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
  }, []); // useCallback is used to memoize the function

  /**
   * Handle file upload with progress tracking
   */
  const handleUpload = useCallback(
    async (file: File): Promise<FileUploadResult> => {
      // Check if user is authenticated
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
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        console.log("🔄 Starting Firebase upload for:", file.name);

        const result = await uploadFile(
          file,
          user.id,
          {
            contentType: file.type,
            cacheControl: "public, max-age=3600",
          },
          // Progress callback
          (percentage) => {
            setProgress({
              loaded: (percentage / 100) * file.size,
              total: file.size,
              percentage,
            });
          }
        );

        if (result.error) {
          setError(result.error);
          return result;
        }

        console.log("✅ Firebase upload completed successfully");
        setProgress({ loaded: file.size, total: file.size, percentage: 100 });

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        console.error("🚨 Upload error:", err);
        setError(errorMsg);
        return { data: null, error: errorMsg };
      } finally {
        setUploading(false);
        // Clear progress after 2 seconds
        setTimeout(() => setProgress(null), 2000);
      }
    },
    [user, validateFile]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFile: handleUpload,
    uploading,
    progress,
    error,
    clearError,
    validateFile,
  };
};
