import { useHistoryStore, type HistoryEntry } from "@/hooks/useHistoryStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Download, Trash2 } from "lucide-react";

interface HistoryTableProps {
  entries: HistoryEntry[];
  onDownload: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function HistoryTable({ entries, onDownload, onDelete }: HistoryTableProps) {
  const { selectedIds, toggleSelect, selectAll, clearSelection, currentPage, pageSize } =
    useHistoryStore();

  const allSelected =
    entries.length > 0 && entries.every((e) => selectedIds.has(e.id));

  function handleToggleAll() {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <p className="text-sm">Không tìm thấy listing nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-hover)]">
            <th className="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--brand)]"
              />
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] w-12">
              #
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">
              Tên Listing
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">
              SKU
            </th>
            <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">
              Variants
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">
              Ngày tạo
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className={`
                border-b border-[var(--border)] transition-colors
                ${selectedIds.has(entry.id) ? "bg-[var(--brand-muted)]" : "hover:bg-[var(--bg-surface-hover)]"}
              `}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(entry.id)}
                  onChange={() => toggleSelect(entry.id)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--brand)]"
                />
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs">
                {(currentPage - 1) * pageSize + index + 1}
              </td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                {entry.name}
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)] font-mono text-xs">
                {entry.sku || "-"}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant="info">{entry.variantCount}</Badge>
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">
                {formatDate(entry.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(entry)}
                    title="Download CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
