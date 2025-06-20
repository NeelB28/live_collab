import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Progress,
  Alert,
  AlertIcon,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { AttachmentIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadProps {
  onUploadSuccess?: (
    filePath: string,
    fileName: string,
    fileSize: number
  ) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * File upload component with drag-and-drop support
 * Handles PDF file uploads with progress tracking and validation
 */
const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, uploading, progress, error, clearError, validateFile } =
    useFileUpload(); // useFileUpload is a custom hook that handles the file upload process
  const toast = useToast();

  /**
   * Handle file selection from input or drag-and-drop
   */
  const handleFileSelect = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      clearError();

      // Validate file first
      const validation = validateFile(file);
      if (!validation.isValid) {
        onUploadError?.(validation.error || "Invalid file");
        toast({
          title: "Invalid file",
          description: validation.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Start upload
      console.log("📁 File selected:", file.name);
      const result = await uploadFile(file);

      if (result.error) {
        onUploadError?.(result.error);
        toast({
          title: "Upload failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else if (result.data) {
        onUploadSuccess?.(result.data.path, file.name, file.size);
        toast({
          title: "Upload successful! 🎉",
          description: `${file.name} has been uploaded successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [
      uploadFile,
      validateFile,
      clearError,
      onUploadSuccess,
      onUploadError,
      toast,
    ]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag and drop events
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <VStack spacing={4} w="full">
      {/* Upload Area */}
      <Box
        w="full"
        h="200px"
        border="2px dashed"
        borderColor={isDragOver ? "orange.400" : "gray.300"}
        borderRadius="lg"
        bg={isDragOver ? "orange.50" : "gray.50"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        cursor={disabled ? "not-allowed" : "pointer"}
        transition="all 0.2s"
        _hover={{
          borderColor: disabled ? "gray.300" : "orange.400",
          bg: disabled ? "gray.50" : "orange.50",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          disabled={disabled || uploading}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        />

        <VStack spacing={3} color="gray.600">
          <Icon
            as={AttachmentIcon}
            boxSize={8}
            color={isDragOver ? "orange.500" : "gray.400"}
          />
          <VStack spacing={1}>
            <Text fontWeight="medium" textAlign="center">
              {uploading
                ? "Uploading..."
                : "Drag and drop your PDF here, or click to browse"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              PDF files only, max 50MB
            </Text>
          </VStack>
        </VStack>
      </Box>

      {/* Progress Bar */}
      {progress && (
        <Box w="full">
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">
              {selectedFile?.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {progress.percentage.toFixed(0)}%
            </Text>
          </HStack>
          <Progress
            value={progress.percentage}
            colorScheme="orange"
            bg="gray.200"
            borderRadius="md"
          />
        </Box>
      )}

      {/* Success Message */}
      {!uploading && !error && selectedFile && progress?.percentage === 100 && (
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium">Upload complete!</Text>
            <Text fontSize="sm">
              {selectedFile.name} has been uploaded successfully.
            </Text>
          </VStack>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium">Upload failed</Text>
            <Text fontSize="sm">{error}</Text>
          </VStack>
        </Alert>
      )}

      {/* Manual Upload Button */}
      <Button
        colorScheme="orange"
        variant="outline"
        size="sm"
        isDisabled={disabled || uploading}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".pdf,application/pdf";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFileSelect(file);
          };
          input.click();
        }}
      >
        Choose File
      </Button>
    </VStack>
  );
};

export default FileUpload;
