import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Button,
  Input,
  Select,
  Flex,
  Center,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AddIcon,
  MinusIcon,
} from "@chakra-ui/icons";
import { Document, Page } from "react-pdf";
import { usePDF } from "@/hooks/usePDF";

interface PDFViewerProps {
  fileUrl: string;
  onPageChange?: (pageNumber: number) => void;
  height?: string | number;
  showControls?: boolean;
}

/**
 * PDF Viewer component with navigation and zoom controls
 * Displays PDF documents with page navigation and zoom functionality
 */
const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  onPageChange,
  height = "70vh",
  showControls = true,
}) => {
  const {
    file,
    numPages,
    currentPage,
    scale,
    loading,
    error,
    loadDocument,
    goToPage,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    resetZoom,
    canGoNext,
    canGoPrevious,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    clearError,
  } = usePDF() as any; // Type assertion for the extended return type

  // Load document when fileUrl changes
  React.useEffect(() => {
    if (fileUrl) {
      loadDocument(fileUrl);
    }
  }, [fileUrl, loadDocument]);

  // Notify parent of page changes
  React.useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  /**
   * Handle page input change
   */
  const handlePageInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pageNumber = parseInt(event.target.value);
    if (!isNaN(pageNumber)) {
      goToPage(pageNumber);
    }
  };

  /**
   * Handle zoom level selection
   */
  const handleZoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const zoomLevel = parseFloat(event.target.value);
    resetZoom();
    // Set custom zoom if needed
    if (zoomLevel !== 1.0) {
      setTimeout(() => {
        // This would need to be implemented in the hook
        // For now, we'll use the scale directly
      }, 100);
    }
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">Failed to load PDF</Text>
          <Text fontSize="sm">{error}</Text>
          <Button size="sm" onClick={clearError} mt={2}>
            Try Again
          </Button>
        </VStack>
      </Alert>
    );
  }

  return (
    <VStack spacing={4} w="full" h="full">
      {/* Controls */}
      {showControls && (
        <Box
          w="full"
          bg="white"
          p={4}
          borderRadius="md"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <Flex wrap="wrap" align="center" gap={4}>
            {/* Page Navigation */}
            <HStack spacing={2}>
              <IconButton
                aria-label="Previous page"
                icon={<ChevronLeftIcon />}
                size="sm"
                onClick={previousPage}
                isDisabled={!canGoPrevious || loading}
              />

              <HStack spacing={1}>
                <Input
                  value={currentPage}
                  onChange={handlePageInputChange}
                  size="sm"
                  w="60px"
                  textAlign="center"
                  isDisabled={loading}
                />
                <Text fontSize="sm" color="gray.600">
                  of {numPages || "?"}
                </Text>
              </HStack>

              <IconButton
                aria-label="Next page"
                icon={<ChevronRightIcon />}
                size="sm"
                onClick={nextPage}
                isDisabled={!canGoNext || loading}
              />
            </HStack>

            {/* Zoom Controls */}
            <HStack spacing={2}>
              <IconButton
                aria-label="Zoom out"
                icon={<MinusIcon />}
                size="sm"
                onClick={zoomOut}
                isDisabled={loading}
              />

              <Select
                size="sm"
                w="100px"
                value={scale}
                onChange={handleZoomChange}
              >
                <option value={0.5}>50%</option>
                <option value={0.75}>75%</option>
                <option value={1.0}>100%</option>
                <option value={1.25}>125%</option>
                <option value={1.5}>150%</option>
                <option value={2.0}>200%</option>
              </Select>

              <IconButton
                aria-label="Zoom in"
                icon={<AddIcon />}
                size="sm"
                onClick={zoomIn}
                isDisabled={loading}
              />

              <Button size="sm" onClick={resetZoom} isDisabled={loading}>
                Reset
              </Button>
            </HStack>

            {/* Loading indicator */}
            {loading && (
              <HStack spacing={2}>
                <Spinner size="sm" color="orange.500" />
                <Text fontSize="sm" color="gray.600">
                  Loading PDF...
                </Text>
              </HStack>
            )}
          </Flex>
        </Box>
      )}

      {/* PDF Document */}
      <Box
        w="full"
        h={height}
        bg="gray.100"
        borderRadius="md"
        overflow="auto"
        border="1px"
        borderColor="gray.200"
        position="relative"
      >
        {file && (
          <Center p={4}>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <VStack spacing={3} py={8}>
                  <Spinner size="lg" color="orange.500" />
                  <Text color="gray.600">Loading PDF...</Text>
                </VStack>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <Box py={8}>
                    <Spinner size="md" color="orange.500" />
                  </Box>
                }
              />
            </Document>
          </Center>
        )}

        {!file && !loading && (
          <Center h="full">
            <Text color="gray.500">No PDF loaded</Text>
          </Center>
        )}
      </Box>
    </VStack>
  );
};

export default PDFViewer;
