import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ShopifyCSVHeaderType } from "@/lib/shopify-csv";
import { SHOPIFY_CSV_HEADERS } from "@/lib/shopify-csv";

interface CSVPreviewProps {
  rows: Record<ShopifyCSVHeaderType, string>[];
  maxPreviewRows?: number;
}

const PREVIEW_COLUMNS: ShopifyCSVHeaderType[] = [
  "Handle",
  "Title",
  "Option1 Value",
  "Option2 Value",
  "Variant SKU",
  "Variant Price",
  "Image Src",
  "Status",
];

export function CSVPreview({ rows, maxPreviewRows = 10 }: CSVPreviewProps) {
  const previewRows = useMemo(
    () => rows.slice(0, maxPreviewRows),
    [rows, maxPreviewRows]
  );

  if (rows.length === 0) return null;

  const displayColumns = PREVIEW_COLUMNS.filter((col) =>
    rows.some((row) => row[col] !== "")
  );

  return (
    <Card title="Xem trước CSV" padding={false}>
      <div className="px-5 py-2.5 border-b border-[var(--border)] bg-[var(--bg-surface-hover)] flex items-center gap-3">
        <Badge variant="info">{rows.length} dòng</Badge>
        <Badge variant="info">{SHOPIFY_CSV_HEADERS.length} cột</Badge>
        {rows.length > maxPreviewRows && (
          <span className="text-xs text-[var(--text-muted)]">
            Hiển thị {maxPreviewRows} trong {rows.length} dòng
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)] bg-[var(--bg-surface-hover)]">
                #
              </th>
              {displayColumns.map((header) => (
                <th
                  key={header}
                  className="px-3 py-2 text-left font-medium text-[var(--text-muted)] bg-[var(--bg-surface-hover)] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <td className="px-3 py-2 text-[var(--text-muted)] font-mono">
                  {index + 1}
                </td>
                {displayColumns.map((header) => (
                  <td
                    key={header}
                    className="px-3 py-2 text-[var(--text-secondary)] max-w-[200px] truncate"
                    title={row[header]}
                  >
                    {header === "Image Src" && row[header] ? (
                      <span className="text-[var(--brand)] underline">image</span>
                    ) : (
                      row[header] || "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
