import { useState, useEffect, useCallback, useMemo } from 'react';

interface FileTypeInfo {
  isPDF: boolean;
  isImage: boolean;
  canPreview: boolean;
  mimeType: string;
}

interface DocumentPreviewState {
  previewUrl: string;
  zoom: number;
  fileType: FileTypeInfo;
  isLoading: boolean;
}

/**
 * Custom hook for managing document preview functionality
 * - Automatic preview URL generation and cleanup
 * - Zoom controls for images
 * - File type detection
 * - Memory leak prevention with URL cleanup
 */
export const useDocumentPreview = (file: File | null) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  // Detect file type
  const fileType = useMemo<FileTypeInfo>(() => {
    if (!file) {
      return {
        isPDF: false,
        isImage: false,
        canPreview: false,
        mimeType: '',
      };
    }

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    return {
      isPDF,
      isImage,
      canPreview: isPDF || isImage,
      mimeType: file.type,
    };
  }, [file]);

  // Generate preview URL and handle cleanup
  useEffect(() => {
    if (file) {
      setIsLoading(true);

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsLoading(false);

      // Cleanup function to revoke URL and prevent memory leaks
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl('');
      };
    } else {
      setPreviewUrl('');
      setIsLoading(false);
    }
  }, [file]);

  // Zoom controls (for images)
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const setCustomZoom = useCallback((value: number) => {
    setZoom(Math.max(50, Math.min(200, value)));
  }, []);

  // Get file information
  const fileInfo = useMemo(() => {
    if (!file) return null;

    return {
      name: file.name,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
      lastModified: new Date(file.lastModified),
    };
  }, [file]);

  const state: DocumentPreviewState = {
    previewUrl,
    zoom,
    fileType,
    isLoading,
  };

  return {
    // State
    ...state,
    fileInfo,
    hasFile: !!file,

    // Zoom controls
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom: setCustomZoom,
    canZoomIn: zoom < 200,
    canZoomOut: zoom > 50,
  };
};
