import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Card } from "@/components/ui/Card";
import { useListingStore } from "@/hooks/useListingStore";

export function ListingForm() {
  const { formData, setFormField, formErrors } = useListingStore();

  return (
    <div className="space-y-5">
      <Card title="Thông tin sản phẩm">
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormField("title", e.target.value)}
            placeholder="VD: Custom Jersey 2024"
            required
            error={formErrors.title}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vendor"
              value={formData.vendor}
              onChange={(e) => setFormField("vendor", e.target.value)}
              placeholder="VD: Seattle Seahawks"
              required
              error={formErrors.vendor}
            />
            <Input
              label="SKU"
              value={formData.skuPrefix}
              onChange={(e) => setFormField("skuPrefix", e.target.value)}
              placeholder="VD: 512VTTLJS235"
              required
              error={formErrors.skuPrefix}
            />
          </div>

          <TagInput
            label="Tags"
            tags={formData.tags}
            onChange={(tags) => setFormField("tags", tags)}
            placeholder="Nhập tags, phân cách bằng dấu phẩy..."
            error={formErrors.tags}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Body (HTML)
            </label>
            <textarea
              value={formData.bodyHtml}
              onChange={(e) => setFormField("bodyHtml", e.target.value)}
              placeholder="Mô tả sản phẩm (HTML)..."
              rows={4}
              className="
                w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)]
                bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                transition-colors duration-150 resize-y
                focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-focus)]
                hover:border-[var(--border-hover)]
              "
            />
          </div>
        </div>
      </Card>

      <Card title="Giá">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Variant Price"
            type="number"
            step="0.01"
            min="0"
            value={formData.variantPrice}
            onChange={(e) => setFormField("variantPrice", e.target.value)}
            placeholder="0.00"
            required
            error={formErrors.variantPrice}
          />
          <Input
            label="Compare At Price"
            type="number"
            step="0.01"
            min="0"
            value={formData.compareAtPrice}
            onChange={(e) => setFormField("compareAtPrice", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </Card>
    </div>
  );
}
