import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useDriveScanner } from "@/hooks/useDriveScanner";
import { useListingStore } from "@/hooks/useListingStore";
import { validateDriveUrl } from "@/lib/validators";
import type { DriveFile } from "@/types/drive";
import type { MatchResult } from "@/types/drive";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderSearch, ImageIcon, FolderOpen, Globe, HardDrive } from "lucide-react";
import { toast } from "sonner";

type ImageSource = "drive" | "local";

interface DriveScannerProps {
  onMatchResults: (files: DriveFile[], opt1: string[], opt2: string[]) => void;
  onFilesLoaded: (files: DriveFile[]) => void;
  matcherResults: MatchResult[];
}

export function DriveScanner({ onMatchResults, onFilesLoaded, matcherResults }: DriveScannerProps) {
  const [imageSource, setImageSource] = useState<ImageSource>("drive");
  const [driveUrl, setDriveUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const { files, loading, error, scanDrive } = useDriveScanner();
  const { formData } = useListingStore();
  const [allFiles, setAllFiles] = useState<DriveFile[]>([]);

  function triggerMatch(scannedFiles: DriveFile[]) {
    setAllFiles(scannedFiles);
    onFilesLoaded(scannedFiles);

    const opt1Values = formData.options[0]?.values || [];
    const opt2Values = formData.options[1]?.values || [];

    if (opt1Values.length > 0) {
      onMatchResults(scannedFiles, opt1Values, opt2Values);
    }
  }

  async function handleDriveScan() {
    const validation = validateDriveUrl(driveUrl);
    if (validation) {
      setUrlError(validation.message);
      return;
    }
    setUrlError(null);

    const scannedFiles = await scanDrive(driveUrl);
    if (scannedFiles.length > 0) {
      toast.success(`Tìm thấy ${scannedFiles.length} ảnh`);
      triggerMatch(scannedFiles);
    }
  }

  async function handleLocalFolder() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Chọn thư mục chứa ảnh sản phẩm",
      });

      if (!selected || typeof selected !== "string") return;

      setLocalLoading(true);
      try {
        const scannedFiles = await invoke<DriveFile[]>("scan_local_folder", {
          folderPath: selected,
        });

        if (scannedFiles.length > 0) {
          toast.success(`Tìm thấy ${scannedFiles.length} ảnh`);
          triggerMatch(scannedFiles);
        } else {
          toast.error("Không tìm thấy ảnh nào trong thư mục");
        }
      } catch (err) {
        const msg = typeof err === "string" ? err : "Lỗi đọc thư mục";
        toast.error(msg);
      } finally {
        setLocalLoading(false);
      }
    } catch {
      // user cancelled
    }
  }

  const displayFiles = allFiles.length > 0 ? allFiles : files;

  return (
    <Card title="Nguồn ảnh sản phẩm">
      <div className="space-y-4">
        {/* Source toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setImageSource("drive")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
              imageSource === "drive"
                ? "bg-[var(--brand-muted)] border-[var(--brand)]/40 text-[var(--brand)]"
                : "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
            }`}
          >
            <Globe className="h-4 w-4" />
            Google Drive
          </button>
          <button
            type="button"
            onClick={() => setImageSource("local")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
              imageSource === "local"
                ? "bg-[var(--brand-muted)] border-[var(--brand)]/40 text-[var(--brand)]"
                : "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
            }`}
          >
            <HardDrive className="h-4 w-4" />
            Thư mục máy tính
          </button>
        </div>

        {/* Google Drive input */}
        {imageSource === "drive" && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Dán link thư mục Google Drive (công khai)..."
                value={driveUrl}
                onChange={(e) => {
                  setDriveUrl(e.target.value);
                  setUrlError(null);
                }}
                error={urlError || undefined}
                helperText="Cần Google API Key trong Cài đặt. Thư mục phải chia sẻ công khai."
              />
            </div>
            <Button onClick={handleDriveScan} loading={loading} className="shrink-0">
              <FolderSearch className="h-4 w-4" />
              Quét ảnh
            </Button>
          </div>
        )}

        {/* Local folder picker */}
        {imageSource === "local" && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleLocalFolder}
              loading={localLoading}
              className="flex-1"
            >
              <FolderOpen className="h-4 w-4" />
              Chọn thư mục ảnh từ máy tính
            </Button>
          </div>
        )}

        {/* Error */}
        {error && imageSource === "drive" && (
          <div className="p-3 rounded-lg bg-[var(--danger-muted)] border border-[var(--danger)]/30 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        {/* File results */}
        {displayFiles.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border)]">
            <ImageIcon className="h-5 w-5 text-[var(--text-muted)]" />
            <div className="flex-1">
              <span className="text-sm text-[var(--text-secondary)]">
                <span className="font-medium">{displayFiles.length}</span> ảnh tìm thấy
                {imageSource === "local" && " (từ máy tính)"}
              </span>
            </div>
            <div className="flex gap-2">
              {matcherResults.length > 0 && (
                <>
                  <Badge variant="success">
                    {matcherResults.filter((r) => r.matchType === "exact").length} khớp
                  </Badge>
                  <Badge variant="warning">
                    {matcherResults.filter((r) => r.matchType === "fuzzy").length} tương đối
                  </Badge>
                  <Badge variant="error">
                    {matcherResults.filter((r) => r.matchType === "unmatched").length} thiếu
                  </Badge>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
