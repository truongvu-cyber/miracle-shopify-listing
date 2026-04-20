import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useListingStore } from "@/hooks/useListingStore";
import { Plus, Trash2, Eraser } from "lucide-react";

export function OptionBuilder() {
  const {
    formData,
    addOption,
    removeOption,
    setOptionName,
    setOptionValues,
    clearOptionValues,
    totalVariantCount,
  } = useListingStore();

  const { options } = formData;
  const variantCount = totalVariantCount();

  return (
    <Card title="Tùy chọn & Variants">
      <div className="space-y-4">
        {options.map((option, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface-hover)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Option {index + 1}
              </span>
              <div className="flex items-center gap-1">
                {option.values.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearOptionValues(index)}
                    title="Xóa tất cả giá trị"
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors cursor-pointer"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                    Xóa tất cả ({option.values.length})
                  </button>
                )}
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    title="Xóa option này"
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <Input
              placeholder="VD: Style, Color, Size"
              value={option.name}
              onChange={(e) => setOptionName(index, e.target.value)}
            />

            <TagInput
              tags={option.values}
              onChange={(values) => setOptionValues(index, values)}
              placeholder="Thêm giá trị, phân cách bằng dấu phẩy..."
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={addOption}
            disabled={options.length >= 3}
          >
            <Plus className="h-4 w-4" />
            Thêm Option
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">Tổng variants:</span>
            <Badge variant={variantCount > 0 ? "info" : "warning"}>
              {variantCount}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
