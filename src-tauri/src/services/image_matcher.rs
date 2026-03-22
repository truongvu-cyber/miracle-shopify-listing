use crate::models::{DriveFile, MatchResult, VariantData};

/// Normalize a filename for matching: lowercase, strip extension, replace
/// separators with spaces, collapse whitespace.
pub fn normalize_filename(name: &str) -> String {
    // Remove file extension
    let without_ext = if let Some(dot_pos) = name.rfind('.') {
        &name[..dot_pos]
    } else {
        name
    };

    without_ext
        .to_lowercase()
        .replace(['-', '_', '.', '(', ')', '[', ']', '{', '}'], " ")
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ")
}

/// Normalize an option value for comparison.
fn normalize_option(value: &str) -> String {
    value
        .to_lowercase()
        .replace(['-', '_', '.', '/', '\\'], " ")
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ")
}

/// Calculate similarity between two strings using bigram overlap (Dice coefficient).
fn bigram_similarity(a: &str, b: &str) -> f64 {
    if a.is_empty() && b.is_empty() {
        return 1.0;
    }
    if a.is_empty() || b.is_empty() {
        return 0.0;
    }
    if a == b {
        return 1.0;
    }

    let a_chars: Vec<char> = a.chars().collect();
    let b_chars: Vec<char> = b.chars().collect();

    if a_chars.len() < 2 || b_chars.len() < 2 {
        // For single-char strings, fall back to exact match
        return if a == b { 1.0 } else { 0.0 };
    }

    let a_bigrams: Vec<(char, char)> = a_chars.windows(2).map(|w| (w[0], w[1])).collect();
    let b_bigrams: Vec<(char, char)> = b_chars.windows(2).map(|w| (w[0], w[1])).collect();

    let mut matches = 0;
    let mut b_used = vec![false; b_bigrams.len()];

    for ab in &a_bigrams {
        for (j, bb) in b_bigrams.iter().enumerate() {
            if !b_used[j] && ab == bb {
                matches += 1;
                b_used[j] = true;
                break;
            }
        }
    }

    (2.0 * matches as f64) / (a_bigrams.len() + b_bigrams.len()) as f64
}

/// Check if a normalized filename contains both option1 and option2 values
/// (exact match strategy).
fn exact_match(
    normalized_name: &str,
    option1: &str,
    option2: &str,
) -> bool {
    let opt1 = normalize_option(option1);
    let opt2 = normalize_option(option2);

    let has_opt1 = opt1.is_empty() || normalized_name.contains(&opt1);
    let has_opt2 = opt2.is_empty() || normalized_name.contains(&opt2);

    // At least one option must be non-empty for a valid match
    let has_any = !opt1.is_empty() || !opt2.is_empty();

    has_any && has_opt1 && has_opt2
}

/// Compute a fuzzy match score between a normalized filename and variant options.
fn fuzzy_score(
    normalized_name: &str,
    option1: &str,
    option2: &str,
) -> f64 {
    let opt1 = normalize_option(option1);
    let opt2 = normalize_option(option2);

    let mut total_score = 0.0;
    let mut count = 0;

    if !opt1.is_empty() {
        total_score += bigram_similarity(normalized_name, &opt1);
        count += 1;

        // Bonus: check if option value appears as a substring
        if normalized_name.contains(&opt1) {
            total_score += 0.5;
        }
    }

    if !opt2.is_empty() {
        total_score += bigram_similarity(normalized_name, &opt2);
        count += 1;

        if normalized_name.contains(&opt2) {
            total_score += 0.5;
        }
    }

    if count == 0 {
        return 0.0;
    }

    // Normalize score to 0..1 range (max possible is 1.5 per option)
    total_score / (count as f64 * 1.5)
}

/// Match a list of drive files to variants, returning match results.
///
/// Strategy:
/// 1. Try exact match (option values found in filename)
/// 2. Fall back to fuzzy match if confidence >= threshold
/// 3. Otherwise mark as unmatched product image
pub fn match_images(
    files: &[DriveFile],
    variants: &[VariantData],
    fuzzy_threshold: f64,
) -> Vec<MatchResult> {
    let threshold = if fuzzy_threshold <= 0.0 {
        0.4
    } else {
        fuzzy_threshold
    };

    let mut results: Vec<MatchResult> = Vec::new();

    for file in files {
        let normalized = normalize_filename(&file.name);

        let image_url = file
            .web_content_link
            .clone()
            .unwrap_or_else(|| {
                format!(
                    "https://drive.google.com/uc?export=view&id={}",
                    file.id
                )
            });

        // Try exact match against each variant
        let mut matched = false;
        for (idx, variant) in variants.iter().enumerate() {
            if exact_match(&normalized, &variant.option1_value, &variant.option2_value) {
                results.push(MatchResult {
                    image_url: image_url.clone(),
                    variant_index: Some(idx),
                    match_type: "exact".to_string(),
                    confidence: 1.0,
                    is_variant_image: true,
                });
                matched = true;
                break;
            }
        }

        if matched {
            continue;
        }

        // Try fuzzy match
        let mut best_score: f64 = 0.0;
        let mut best_idx: Option<usize> = None;

        for (idx, variant) in variants.iter().enumerate() {
            let score = fuzzy_score(
                &normalized,
                &variant.option1_value,
                &variant.option2_value,
            );
            if score > best_score {
                best_score = score;
                best_idx = Some(idx);
            }
        }

        if best_score >= threshold {
            results.push(MatchResult {
                image_url: image_url.clone(),
                variant_index: best_idx,
                match_type: "fuzzy".to_string(),
                confidence: best_score,
                is_variant_image: true,
            });
        } else {
            // Unmatched - treat as extra product image
            results.push(MatchResult {
                image_url,
                variant_index: None,
                match_type: "unmatched".to_string(),
                confidence: best_score,
                is_variant_image: false,
            });
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_filename() {
        assert_eq!(
            normalize_filename("Nike-Air-Max_90_Black.jpg"),
            "nike air max 90 black"
        );
        assert_eq!(
            normalize_filename("shoe (1).PNG"),
            "shoe 1"
        );
    }

    #[test]
    fn test_exact_match() {
        let name = "nike air max 90 black size 10";
        assert!(exact_match(name, "Black", "Size 10"));
        assert!(!exact_match(name, "Red", "Size 10"));
    }

    #[test]
    fn test_bigram_similarity() {
        assert!(bigram_similarity("black", "black") == 1.0);
        assert!(bigram_similarity("black", "blank") > 0.5);
        assert!(bigram_similarity("black", "zzzzz") < 0.3);
    }
}
