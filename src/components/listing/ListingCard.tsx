import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { CSVPreview } from "../listing/CSVPreview";
import type { ListingJob } from "@/types/listing";
import { Download, Trash2, Loader2, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface ListingCardProps {
  job: ListingJob;
  onDownload: (job: ListingJob) => void;
  onRemove: (id: string) => void;
}

const statusConfig = {
  pending: { icon: Clock, variant: "info" as const, label: "Chờ xử lý" },
  processing: { icon: Loader2, variant: "warning" as const, label: "Đang xử lý" },
  completed: { icon: CheckCircle, variant: "success" as const, label: "Hoàn thành" },
  failed: { icon: XCircle, variant: "error" as const, label: "Lỗi" },
};

export function ListingCard({ job, onDownload, onRemove }: ListingCardProps) {
  const config = statusConfig[job.status];
  const Icon = config.icon;
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-colors">
      <div className="flex items-center gap-4">
        {/* Title & info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {job.title}
          </h4>
          <span className="text-xs text-[var(--text-muted)]">{job.variantCount} variants</span>
        </div>

        {/* Progress (processing only) */}
        {job.status === "processing" && (
          <div className="w-32">
            <ProgressBar value={job.progress} size="sm" showLabel={false} />
          </div>
        )}

        {/* Error */}
        {job.status === "failed" && job.errorMessage && (
          <p className="text-xs text-[var(--danger)] max-w-[200px] truncate">
            {job.errorMessage}
          </p>
        )}

        {/* Status badge */}
        <Badge variant={config.variant}>
          <Icon
            className={`h-3 w-3 mr-1 ${job.status === "processing" ? "animate-spin" : ""}`}
          />
          {config.label}
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {job.status === "completed" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-3.5 w-3.5" />
                Xem trước
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onDownload(job)}
              >
                <Download className="h-3.5 w-3.5" />
                Tải CSV
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(job.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {job.status === "completed" && (
        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={`Xem trước: ${job.title}`}
          maxWidth="max-w-6xl"
        >
          {job.csvData && (
            <CSVPreview rows={job.csvData as Record<string, string>[]} />
          )}
        </Modal>
      )}
    </div>
  );
}
