const DRIVE_FOLDER_PATTERNS = [
  /\/folders\/([a-zA-Z0-9_-]+)/,
  /[?&]id=([a-zA-Z0-9_-]+)/,
  /\/folderview\?id=([a-zA-Z0-9_-]+)/,
  /\/open\?id=([a-zA-Z0-9_-]+)/,
];

export function extractFolderId(url: string): string | null {
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  for (const pattern of DRIVE_FOLDER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function buildDriveThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
}

export function buildDriveDirectUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
