export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
}

export type MatchType = "exact" | "fuzzy" | "unmatched";

export interface MatchResult {
  option1Value: string;
  option2Value: string;
  matchType: MatchType;
  confidence: number;
  driveFile?: DriveFile;
  manualOverrideFileId?: string;
}

export interface DriveScanResult {
  folderId: string;
  files: DriveFile[];
  scannedAt: string;
}
