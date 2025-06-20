// Context provider for Firebase storage

import React, { createContext, useContext, ReactNode } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileUploadResult, FileValidationResult } from "@/types/storage";

interface FirebaseStorageContextType {
  uploadFile: (file: File) => Promise<FileUploadResult>;
  uploading: boolean;
  progress: { loaded: number; total: number; percentage: number } | null;
  error: string | null;
  clearError: () => void;
  validateFile: (file: File) => FileValidationResult;
}

const FirebaseStorageContext = createContext<
  FirebaseStorageContextType | undefined
>(undefined);

export const useFirebaseStorage = (): FirebaseStorageContextType => {
  const context = useContext(FirebaseStorageContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseStorage must be used within a FirebaseStorageProvider"
    );
  }
  return context;
};

interface FirebaseStorageProviderProps {
  children: ReactNode;
}

export const FirebaseStorageProvider: React.FC<
  FirebaseStorageProviderProps
> = ({ children }) => {
  const fileUploadHook = useFileUpload();

  const value: FirebaseStorageContextType = {
    uploadFile: fileUploadHook.uploadFile,
    uploading: fileUploadHook.uploading,
    progress: fileUploadHook.progress,
    error: fileUploadHook.error,
    clearError: fileUploadHook.clearError,
    validateFile: fileUploadHook.validateFile,
  };

  return (
    <FirebaseStorageContext.Provider value={value}>
      {children}
    </FirebaseStorageContext.Provider>
  );
};
