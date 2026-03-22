import { useState, useCallback } from "react";
import type { DriveFile, MatchResult } from "@/types/drive";
import { matchImages, getMatchSummary } from "@/lib/image-matcher";

interface MatchSummary {
  exact: number;
  fuzzy: number;
  unmatched: number;
  total: number;
}

interface UseImageMatcherReturn {
  results: MatchResult[];
  summary: MatchSummary | null;
  runMatch: (
    files: DriveFile[],
    option1Values: string[],
    option2Values: string[]
  ) => void;
  updateManualMatch: (
    option1Value: string,
    option2Value: string,
    file: DriveFile
  ) => void;
  reset: () => void;
}

export function useImageMatcher(): UseImageMatcherReturn {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [summary, setSummary] = useState<MatchSummary | null>(null);

  const runMatch = useCallback(
    (
      files: DriveFile[],
      option1Values: string[],
      option2Values: string[]
    ) => {
      if (option1Values.length === 0) {
        setResults([]);
        setSummary(null);
        return;
      }

      const opt2 = option2Values.length > 0 ? option2Values : [""];
      const matched = matchImages(files, option1Values, opt2);
      setResults(matched);
      setSummary(getMatchSummary(matched));
    },
    []
  );

  const updateManualMatch = useCallback(
    (option1Value: string, option2Value: string, file: DriveFile) => {
      setResults((prev) => {
        const updated = prev.map((r) => {
          if (r.option1Value === option1Value && r.option2Value === option2Value) {
            return {
              ...r,
              driveFile: file,
              matchType: "exact" as const,
              confidence: 1.0,
              manualOverrideFileId: file.id,
            };
          }
          return r;
        });
        setSummary(getMatchSummary(updated));
        return updated;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setResults([]);
    setSummary(null);
  }, []);

  return { results, summary, runMatch, updateManualMatch, reset };
}
