export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSKU(
  handle: string,
  option1?: string,
  option2?: string,
  option3?: string
): string {
  const parts = [handle.slice(0, 20)];
  if (option1) parts.push(option1.slice(0, 10));
  if (option2) parts.push(option2.slice(0, 10));
  if (option3) parts.push(option3.slice(0, 10));
  return parts
    .map((p) => p.replace(/\s+/g, "-").toUpperCase())
    .join("-");
}
