"use client";
import { useState, useCallback } from "react";

interface UseFilePreviewOptions {
  onPreviewChange?: (file: File | null) => void;
}

/**
 * Hook for handling file preview state
 */
export function useFilePreview(options: UseFilePreviewOptions = {}) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = useCallback((file: File) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
    options.onPreviewChange?.(file);
  }, [options]);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    // Keep file until animation completes
    setTimeout(() => setPreviewFile(null), 300);
    options.onPreviewChange?.(null);
  }, [options]);

  return {
    previewFile,
    isPreviewOpen,
    openPreview,
    closePreview,
  };
}
