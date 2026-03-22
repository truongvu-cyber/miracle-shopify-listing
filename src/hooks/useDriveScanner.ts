import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DriveFile } from "@/types/drive";

interface UseDriveScannerReturn {
  files: DriveFile[];
  loading: boolean;
  error: string | null;
  scanDrive: (url: string) => Promise<DriveFile[]>;
  reset: () => void;
}

export function useDriveScanner(): UseDriveScannerReturn {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanDrive = useCallback(async (url: string): Promise<DriveFile[]> => {
    if (!url.trim()) {
      setError("Vui lòng nhập link thư mục Google Drive");
      return [];
    }

    setLoading(true);
    setError(null);
    setFiles([]);

    try {
      const result = await invoke<DriveFile[]>("scan_drive", {
        folderUrl: url.trim(),
      });
      setFiles(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setError(null);
    setLoading(false);
  }, []);

  return { files, loading, error, scanDrive, reset };
}
