"use client";
import { useState, useCallback } from "react";

/**
 * Hook for handling file downloads
 */
export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async (data: Blob | Uint8Array, filename: string) => {
    setIsDownloading(true);
    try {
      let blob: Blob;
      if (data instanceof Uint8Array) {
        blob = new Blob([data as BlobPart], { type: "application/pdf" });
      } else {
        blob = data;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const downloadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return { download, downloadFile, isDownloading };
}
