import { Button } from "@/components/ui/Button";
import { useHistoryStore } from "@/hooks/useHistoryStore";
import { Trash2, Download, FileStack } from "lucide-react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { rowsToCSV, type ShopifyCSVHeaderType } from "@/lib/shopify-csv";

interface HistoryActionsProps {
  onBulkDownload: (ids: string[]) => void;
}

export function HistoryActions({ onBulkDownload }: HistoryActionsProps) {
  const { selectedIds, deleteMultiple, clearSelection, entries } = useHistoryStore();

  const count = selectedIds.size;

  if (count === 0) return null;

  function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    deleteMultiple(ids);
    toast.success(`Đã xóa ${ids.length} listings`);
  }

  function handleBulkDownload() {
    onBulkDownload(Array.from(selectedIds));
  }

  async function handleMerge() {
    const selectedEntries = entries.filter((e) => selectedIds.has(e.id));
    const csvContents: string[] = [];

    for (const entry of selectedEntries) {
      if (entry.csvData && entry.csvData.length > 0) {
        csvContents.push(rowsToCSV(entry.csvData as Record<ShopifyCSVHeaderType, string>[]));
      }
    }

    if (csvContents.length < 2) {
      toast.error("Cần ít nhất 2 listings có dữ liệu CSV để gộp");
      return;
    }

    try {
      const merged = await invoke<string>("merge_csv_files", { csvContents });

      const destPath = await save({
        defaultPath: "merged-listings.csv",
        filters: [{ name: "CSV", extensions: ["csv"] }],
      });

      if (destPath) {
        await invoke("write_csv_file", { csvContent: merged, filePath: destPath });
        toast.success(`Đã gộp ${csvContents.length} listings → ${destPath}`);
        clearSelection();
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : "Lỗi gộp listings";
      toast.error(msg);
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-muted)] border border-[var(--brand)]/30">
      <span className="text-sm text-[var(--brand)] font-medium">
        {count} đã chọn
      </span>
      <div className="flex gap-2 ml-auto">
        {count >= 2 && (
          <Button variant="primary" size="sm" onClick={handleMerge}>
            <FileStack className="h-3.5 w-3.5" />
            Gộp {count} Listings
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={handleBulkDownload}>
          <Download className="h-3.5 w-3.5" />
          Tải tất cả
        </Button>
        <Button variant="danger" size="sm" onClick={handleBulkDelete}>
          <Trash2 className="h-3.5 w-3.5" />
          Xóa đã chọn
        </Button>
        <Button variant="ghost" size="sm" onClick={clearSelection}>
          Hủy
        </Button>
      </div>
    </div>
  );
}
