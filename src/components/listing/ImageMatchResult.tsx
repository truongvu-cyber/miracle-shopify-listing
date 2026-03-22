import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { MatchResult, DriveFile } from "@/types/drive";
import { buildDriveThumbnailUrl } from "@/lib/drive-utils";
import { CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react";

interface ImageMatchResultProps {
  results: MatchResult[];
  allFiles: DriveFile[];
  onManualMatch: (opt1: string, opt2: string, file: DriveFile) => void;
}

export function ImageMatchResult({
  results,
  allFiles,
  onManualMatch,
}: ImageMatchResultProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (results.length === 0) return null;

  const exact = results.filter((r) => r.matchType === "exact").length;
  const fuzzy = results.filter((r) => r.matchType === "fuzzy").length;
  const unmatched = results.filter((r) => r.matchType === "unmatched").length;

  function statusIcon(type: MatchResult["matchType"]) {
    switch (type) {
      case "exact":
        return <CheckCircle className="h-4 w-4 text-[var(--success)]" />;
      case "fuzzy":
        return <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />;
      case "unmatched":
        return <XCircle className="h-4 w-4 text-[var(--danger)]" />;
    }
  }

  return (
    <Card title="Kết quả khớp ảnh" padding={false}>
      <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-surface-hover)] flex gap-4 text-sm">
        <span className="text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--success)]">{exact}</span> khớp chính xác
        </span>
        <span className="text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--warning)]">{fuzzy}</span> tương đối
        </span>
        <span className="text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--danger)]">{unmatched}</span> thiếu
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-hover)]">
              <th className="px-5 py-2.5 text-left font-medium text-[var(--text-muted)]">
                Option 1
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-[var(--text-muted)]">
                Option 2
              </th>
              <th className="px-5 py-2.5 text-left font-medium text-[var(--text-muted)]">
                Image
              </th>
              <th className="px-5 py-2.5 text-center font-medium text-[var(--text-muted)]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={`${result.option1Value}-${result.option2Value}`}
                className="border-b border-[var(--border)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <td className="px-5 py-3 font-medium text-[var(--text-secondary)]">
                  {result.option1Value}
                </td>
                <td className="px-5 py-3 text-[var(--text-muted)]">
                  {result.option2Value || "-"}
                </td>
                <td className="px-5 py-3">
                  {result.driveFile ? (
                    <div
                      className="relative inline-block"
                      onMouseEnter={() => {
                        setHoveredIndex(index);
                        setPreviewUrl(
                          buildDriveThumbnailUrl(result.driveFile!.id)
                        );
                      }}
                      onMouseLeave={() => {
                        setHoveredIndex(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={buildDriveThumbnailUrl(result.driveFile.id)}
                          alt={result.driveFile.name}
                          className="h-8 w-8 rounded object-cover border border-[var(--border)]"
                        />
                        <span className="text-xs text-[var(--text-muted)] max-w-[150px] truncate">
                          {result.driveFile.name}
                        </span>
                        <Eye className="h-3 w-3 text-[var(--text-muted)]" />
                      </div>

                      {hoveredIndex === index && previewUrl && (
                        <div className="absolute z-40 bottom-full left-0 mb-2 p-1 bg-[var(--bg-elevated)] rounded-lg shadow-xl border border-[var(--border)]">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-48 w-48 rounded object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="text-xs border border-[var(--border)] rounded px-2 py-1 bg-[var(--bg-input)] text-[var(--text-primary)]"
                      defaultValue=""
                      onChange={(e) => {
                        const file = allFiles.find((f) => f.id === e.target.value);
                        if (file) {
                          onManualMatch(result.option1Value, result.option2Value, file);
                        }
                      }}
                    >
                      <option value="" disabled>
                        Chọn ảnh...
                      </option>
                      {allFiles.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {statusIcon(result.matchType)}
                    <Badge
                      variant={
                        result.matchType === "exact"
                          ? "success"
                          : result.matchType === "fuzzy"
                            ? "warning"
                            : "error"
                      }
                    >
                      {result.matchType}
                    </Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
