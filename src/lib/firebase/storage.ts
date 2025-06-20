// Firebase storage utilities for file uploads
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
} from "firebase/storage";
import { storage } from "./config";
import { FileUploadResult, FileUploadOptions } from "@/types/storage";

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param file - The file to upload
 * @param userId - The user's ID for organizing files
 * @param options - Upload options
 * @param onProgress - Progress callback function
 * @returns Upload result with download URL or error
 */
export const uploadFile = async (
  file: File,
  userId: string,
  options: FileUploadOptions = {},
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> => {
  try {
    // Fix: Properly handle file extension to avoid double extensions
    const originalName = file.name;
    const fileNameParts = originalName.split(".");
    const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() : "pdf";

    // Generate a random name with proper extension
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `documents/${userId}/${Date.now()}-${randomId}.${fileExt}`;

    console.log("🔄 Uploading file to Firebase:", {
      fileName,
      originalName,
      fileSize: file.size,
      fileType: file.type,
    });

    // Create storage reference
    const storageRef = ref(storage, fileName);

    // Create upload task with metadata
    const metadata = {
      contentType: options.contentType || file.type,
      cacheControl: options.cacheControl || "public, max-age=3600",
      customMetadata: {
        uploadedBy: userId,
        originalName: originalName,
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress tracking
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
          console.log(`📊 Upload progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          // Handle upload errors
          console.error("❌ Firebase upload error:", error);
          resolve({
            data: null,
            error: error.message || "Upload failed",
          });
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ Upload completed successfully:", downloadURL);

            resolve({
              data: {
                path: fileName,
                downloadURL,
                fullPath: uploadTask.snapshot.ref.fullPath,
                name: uploadTask.snapshot.ref.name,
              },
              error: null,
            });
          } catch (error) {
            resolve({
              data: null,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to get download URL",
            });
          }
        }
      );
    });
  } catch (error) {
    console.error("🚨 Firebase upload failed:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

/**
 * Get download URL for a file
 * @param filePath - Path to the file in Firebase Storage
 * @returns Download URL or error
 */
export const getFileUrl = async (
  filePath: string
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return { url, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to get file URL",
    };
  }
};

/**
 * Delete a file from Firebase Storage
 * @param filePath - Path to the file
 * @returns Error if any
 */
export const deleteFile = async (
  filePath: string
): Promise<{ error: string | null }> => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log("🗑️ File deleted successfully:", filePath);
    return { error: null };
  } catch (error) {
    console.error("❌ Failed to delete file:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
};

/**
 * List files for a user
 * @param userId - The user's ID
 * @returns List of files or error
 */
export const listUserFiles = async (userId: string) => {
  try {
    const userFolderRef = ref(storage, `documents/${userId}`);
    const result = await listAll(userFolderRef);

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          downloadURL: url,
        };
      })
    );

    return { data: files, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to list files",
    };
  }
};
