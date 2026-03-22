export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequired(
  value: string,
  fieldName: string
): ValidationError | null {
  if (!value || value.trim().length === 0) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
}

export function validatePrice(
  value: string,
  fieldName: string
): ValidationError | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return { field: fieldName, message: `${fieldName} must be a valid positive number` };
  }
  return null;
}

export function validateUrl(
  value: string,
  fieldName: string
): ValidationError | null {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return { field: fieldName, message: `${fieldName} must be a valid URL` };
  }
}

export function validateDriveUrl(url: string): ValidationError | null {
  if (!url) {
    return { field: "driveUrl", message: "Google Drive URL is required" };
  }
  if (!url.includes("drive.google.com") && !/^[a-zA-Z0-9_-]{20,}$/.test(url.trim())) {
    return {
      field: "driveUrl",
      message: "Please enter a valid Google Drive folder URL or folder ID",
    };
  }
  return null;
}

export interface FormValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateListingForm(data: {
  title: string;
  skuPrefix: string;
  vendor: string;
  tags: string[];
  variantPrice: string;
}): FormValidationResult {
  const errors: ValidationError[] = [];

  if (!data.title.trim()) {
    errors.push({ field: "title", message: "Title là trường bắt buộc" });
  }
  if (!data.skuPrefix.trim()) {
    errors.push({ field: "skuPrefix", message: "SKU là trường bắt buộc" });
  }
  if (!data.vendor.trim()) {
    errors.push({ field: "vendor", message: "Vendor là trường bắt buộc" });
  }
  if (!data.tags || data.tags.length === 0) {
    errors.push({ field: "tags", message: "Cần ít nhất 1 tag" });
  }
  if (!data.variantPrice.trim()) {
    errors.push({ field: "variantPrice", message: "Giá là trường bắt buộc" });
  } else {
    const num = parseFloat(data.variantPrice);
    if (isNaN(num) || num < 0) {
      errors.push({ field: "variantPrice", message: "Giá phải là số hợp lệ" });
    }
  }

  return { valid: errors.length === 0, errors };
}
