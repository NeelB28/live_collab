import { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface PDFState {
  file: string | null;
  numPages: number | null;
  currentPage: number;
  scale: number;
  loading: boolean;
  error: string | null;
}

export interface UsePDFReturn extends PDFState {
  // Document operations
  loadDocument: (fileUrl: string) => void;

  // Navigation
  goToPage: (pageNumber: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Zoom controls
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (scale: number) => void;

  // Utility
  clearError: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Custom hook for managing PDF viewing state and operations
 * Handles loading, navigation, and zoom controls for PDF documents
 */
export const usePDF = (): UsePDFReturn => {
  const [state, setState] = useState<PDFState>({
    file: null,
    numPages: null,
    currentPage: 1,
    scale: 1.0,
    loading: false,
    error: null,
  });

  /**
   * Load a PDF document from URL
   */
  const loadDocument = useCallback((fileUrl: string) => {
    setState((prev) => ({
      ...prev,
      file: fileUrl,
      loading: true,
      error: null,
      currentPage: 1,
      numPages: null,
    }));
  }, []);

  /**
   * Handle successful document load
   */
  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setState((prev) => ({
        ...prev,
        numPages,
        loading: false,
        error: null,
      }));
    },
    []
  );

  /**
   * Handle document load error
   */
  const onDocumentLoadError = useCallback((error: Error) => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: error.message || "Failed to load PDF",
      numPages: null,
    }));
  }, []);

  /**
   * Navigate to specific page
   */
  const goToPage = useCallback((pageNumber: number) => {
    setState((prev) => {
      if (!prev.numPages || pageNumber < 1 || pageNumber > prev.numPages) {
        return prev;
      }
      return { ...prev, currentPage: pageNumber };
    });
  }, []);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    setState((prev) => {
      if (!prev.numPages || prev.currentPage >= prev.numPages) {
        return prev;
      }
      return { ...prev, currentPage: prev.currentPage + 1 };
    });
  }, []);

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    setState((prev) => {
      if (prev.currentPage <= 1) {
        return prev;
      }
      return { ...prev, currentPage: prev.currentPage - 1 };
    });
  }, []);

  /**
   * Zoom controls
   */
  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale + 0.25, 3.0), // Max 300%
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale - 0.25, 0.5), // Min 50%
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: 1.0,
    }));
  }, []);

  const setZoom = useCallback((scale: number) => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(scale, 3.0)),
    }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Computed properties
  const canGoNext = state.numPages ? state.currentPage < state.numPages : false;
  const canGoPrevious = state.currentPage > 1;

  return {
    ...state,
    loadDocument,
    goToPage,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    clearError,
    canGoNext,
    canGoPrevious,
    // Expose handlers for react-pdf
    onDocumentLoadSuccess,
    onDocumentLoadError,
  } as UsePDFReturn & {
    onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
    onDocumentLoadError: (error: Error) => void;
  };
};

export default usePDF;
