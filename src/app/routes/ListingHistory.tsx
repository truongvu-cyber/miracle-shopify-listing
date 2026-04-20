import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HistoryTable } from "@/components/history/HistoryTable";
import { MonthFilter } from "@/components/history/MonthFilter";
import { HistoryActions } from "@/components/history/HistoryActions";
import { useHistoryStore, type HistoryEntry } from "@/hooks/useHistoryStore";
import { useListingStore } from "@/hooks/useListingStore";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { rowsToCSV, type ShopifyCSVHeaderType } from "@/lib/shopify-csv";
import { generateSlug } from "@/lib/slug";

export function ListingHistory() {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    deleteEntry,
    paginatedEntries,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredEntries,
  } = useHistoryStore();
  const loadFormData = useListingStore((s) => s.loadFormData);

  const entries = paginatedEntries();
  const pages = totalPages();
  const total = filteredEntries().length;

  const handleDownload = useCallback(async (entry: HistoryEntry) => {
    if (!entry.csvData || entry.csvData.length === 0) {
      toast.error("Listing này không có dữ liệu CSV");
      return;
    }
    try {
      const destPath = await save({
        defaultPath: `${generateSlug(entry.name)}.csv`,
        filters: [{ name: "CSV", extensions: ["csv"] }],
      });
      if (destPath) {
        const csvContent = rowsToCSV(entry.csvData as Record<ShopifyCSVHeaderType, string>[]);
        await invoke("write_csv_file", { csvContent, filePath: destPath });
        toast.success(`Đã lưu tại: ${destPath}`);
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : "Lỗi khi lưu file";
      toast.error(msg);
    }
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Xóa listing này khỏi lịch sử?")) return;
      deleteEntry(id);
      toast.success("Đã xóa listing");
    },
    [deleteEntry]
  );

  const handleEdit = useCallback(
    (entry: HistoryEntry) => {
      if (!entry.formData) {
        toast.error("Listing cũ không có dữ liệu form, không thể chỉnh sửa");
        return;
      }
      loadFormData(entry.formData);
      toast.success(`Đã mở "${entry.name}" để chỉnh sửa`);
      navigate("/");
    },
    [loadFormData, navigate]
  );

  const handleBulkDownload = useCallback((_ids: string[]) => {
    toast.info("Bulk download chưa được hỗ trợ");
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Lịch sử Listings
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Xem và quản lý các file CSV đã tạo
        </p>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc SKU..."
              aria-label="Tìm kiếm listing"
              className="
                w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)]
                bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-focus)]
                hover:border-[var(--border-hover)] transition-colors
              "
            />
          </div>
          <div className="w-48">
            <MonthFilter />
          </div>
        </div>

        <HistoryActions onBulkDownload={handleBulkDownload} />

        <HistoryTable
          entries={entries}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-surface-hover)]">
            <span className="text-xs text-[var(--text-muted)]">
              {total} listings
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
