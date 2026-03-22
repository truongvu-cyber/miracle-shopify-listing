import type { DriveFile, MatchResult, MatchType } from "@/types/drive";

/**
 * Normalize text for comparison: lowercase, remove extension, replace separators with spaces.
 */
function normalize(text: string): string {
  const withoutExt = text.replace(/\.\w+$/, "");
  return withoutExt.toLowerCase().replace(/[_\-]+/g, " ").trim();
}

/**
 * Strip trailing jersey number from player names.
 * "Sam Darnold-14" → "Sam Darnold"
 */
function stripJerseyNumber(playerName: string): string {
  return playerName.replace(/[\s\-]*\d+$/, "").trim();
}

/**
 * Split text into normalized tokens.
 */
function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/**
 * Calculate Jaccard similarity between two token sets.
 */
function tokenSimilarity(tokens1: string[], tokens2: string[]): number {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  let matchCount = 0;
  for (const token of set1) {
    if (set2.has(token)) matchCount++;
  }
  const union = new Set([...tokens1, ...tokens2]).size;
  return matchCount / union;
}

/**
 * Check if a filename contains an EXACT phrase match (not just substring).
 *
 * Problem: "Black" matches "Black Limited" via includes().
 * Solution: Use word-boundary matching. The option value tokens must appear
 * as complete, consecutive words in the filename.
 *
 * Example:
 *   filename: "black limited bird.png"
 *   opt1: "Black Limited" → ["black", "limited"] → found consecutively ✅
 *   opt1: "Black" → ["black"] → "black" appears but is followed by "limited"
 *         so we need to check if there's a LONGER option that matches better.
 *
 * Strategy: We use a scoring system. The LONGEST matching option wins.
 * An exact phrase match scores based on the number of tokens matched.
 */
function phraseMatchScore(filename: string, optionValue: string): number {
  if (!optionValue.trim()) return 0;

  const fileNorm = normalize(filename);
  const optNorm = normalize(optionValue);

  // Try exact phrase match first (consecutive words)
  if (fileNorm.includes(optNorm)) {
    // Verify it's a word-boundary match, not a partial word
    const idx = fileNorm.indexOf(optNorm);
    const before = idx === 0 || fileNorm[idx - 1] === " ";
    const after =
      idx + optNorm.length >= fileNorm.length ||
      fileNorm[idx + optNorm.length] === " ";

    if (before && after) {
      // Return score based on how many tokens matched (longer = better)
      return optNorm.split(/\s+/).length * 100;
    }
  }

  return 0;
}

/**
 * Find the best matching option value from a list for a given filename.
 * Uses longest-match-wins strategy to avoid "Black" stealing matches from "Black Limited".
 */
function bestOptionMatch(
  filename: string,
  optionValues: string[]
): { value: string; score: number } | null {
  let bestValue = "";
  let bestScore = 0;

  for (const opt of optionValues) {
    const score = phraseMatchScore(filename, opt);
    if (score > bestScore) {
      bestScore = score;
      bestValue = opt;
    }
  }

  if (bestScore > 0) {
    return { value: bestValue, score: bestScore };
  }
  return null;
}

/**
 * Main matching: for each (opt1, opt2) combination, find the best matching file.
 *
 * Uses "longest match wins" — if file is "black limited bird.png":
 *   - "Black Limited" scores 200 (2 tokens matched)
 *   - "Black" scores 100 (1 token matched)
 *   → "Black Limited" wins
 */
export function matchImages(
  files: DriveFile[],
  option1Values: string[],
  option2Values: string[]
): MatchResult[] {
  const results: MatchResult[] = [];

  // Pre-compute: for each file, find which opt1 and opt2 it matches best
  const fileAssignments = new Map<
    string,
    { opt1: string; opt2: string; score: number }
  >();

  for (const file of files) {
    const opt1Match = bestOptionMatch(file.name, option1Values);
    if (!opt1Match) continue;

    // For opt2, also strip jersey numbers from values before matching
    const opt2ValuesNorm = option2Values.map((v) => v);
    const opt2Match =
      opt2ValuesNorm.length > 0
        ? bestOptionMatch(
            file.name,
            opt2ValuesNorm.map((v) => stripJerseyNumber(v))
          )
        : null;

    // Find the original opt2 value (before stripping jersey number)
    let matchedOpt2 = "";
    if (opt2Match) {
      const strippedMatch = opt2Match.value;
      matchedOpt2 =
        option2Values.find(
          (v) => normalize(stripJerseyNumber(v)) === normalize(strippedMatch)
        ) || "";
    }

    const totalScore = opt1Match.score + (opt2Match?.score || 0);
    const key = file.id;
    const existing = fileAssignments.get(key);

    if (!existing || totalScore > existing.score) {
      fileAssignments.set(key, {
        opt1: opt1Match.value,
        opt2: matchedOpt2,
        score: totalScore,
      });
    }
  }

  // Now build results for each combination
  for (const opt1 of option1Values) {
    const opt2List = option2Values.length > 0 ? option2Values : [""];

    for (const opt2 of opt2List) {
      let bestMatch: DriveFile | undefined;
      let bestType: MatchType = "unmatched";
      let bestConfidence = 0;
      let bestScore = 0;

      for (const file of files) {
        const assignment = fileAssignments.get(file.id);
        if (!assignment) continue;

        // Check if this file is assigned to this (opt1, opt2) combination
        if (assignment.opt1 === opt1 && assignment.opt2 === opt2) {
          if (assignment.score > bestScore) {
            bestMatch = file;
            bestType = "exact";
            bestConfidence = 1.0;
            bestScore = assignment.score;
          }
        }
      }

      // Fallback: fuzzy matching if no exact match
      if (!bestMatch) {
        for (const file of files) {
          const opt2Stripped = stripJerseyNumber(opt2);
          const similarity = fuzzyMatch(file.name, opt1, opt2Stripped);
          if (similarity >= 0.75 && similarity > bestConfidence) {
            // Make sure this file isn't already exactly matched to another combo
            const assignment = fileAssignments.get(file.id);
            if (assignment && assignment.opt1 !== opt1) continue;

            bestMatch = file;
            bestType = "fuzzy";
            bestConfidence = similarity;
          }
        }
      }

      results.push({
        option1Value: opt1,
        option2Value: opt2,
        matchType: bestType,
        confidence: bestConfidence,
        driveFile: bestMatch,
      });
    }
  }

  return results;
}

function fuzzyMatch(
  filename: string,
  opt1Value: string,
  opt2Value: string
): number {
  const fileTokens = tokenize(filename);
  const searchTokens = [...tokenize(opt1Value), ...tokenize(opt2Value)];
  return tokenSimilarity(fileTokens, searchTokens);
}

export function getMatchSummary(results: MatchResult[]) {
  const exact = results.filter((r) => r.matchType === "exact").length;
  const fuzzy = results.filter((r) => r.matchType === "fuzzy").length;
  const unmatched = results.filter((r) => r.matchType === "unmatched").length;
  return { exact, fuzzy, unmatched, total: results.length };
}
