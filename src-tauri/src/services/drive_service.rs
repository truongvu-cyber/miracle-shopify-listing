use crate::models::{DriveApiResponse, DriveFile};

const DRIVE_API_BASE: &str = "https://www.googleapis.com/drive/v3/files";
const IMAGE_MIME_TYPES: &[&str] = &[
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
    "image/heic",
    "image/heif",
];

/// Extract a Google Drive folder ID from various URL formats.
///
/// Supports:
/// - `https://drive.google.com/drive/folders/<ID>`
/// - `https://drive.google.com/drive/folders/<ID>?usp=sharing`
/// - `https://drive.google.com/open?id=<ID>`
/// - Plain folder ID string
pub fn extract_folder_id(url_or_id: &str) -> Result<String, String> {
    let trimmed = url_or_id.trim();

    // Direct folder URL: /drive/folders/<ID>
    if let Some(rest) = trimmed
        .strip_prefix("https://drive.google.com/drive/folders/")
        .or_else(|| trimmed.strip_prefix("http://drive.google.com/drive/folders/"))
    {
        let id = rest.split(['?', '/', '#']).next().unwrap_or("");
        if id.is_empty() {
            return Err("Could not extract folder ID from URL".into());
        }
        return Ok(id.to_string());
    }

    // open?id= format
    if trimmed.contains("drive.google.com") && trimmed.contains("id=") {
        if let Some(after_id) = trimmed.split("id=").nth(1) {
            let id = after_id.split(['&', '#']).next().unwrap_or("");
            if !id.is_empty() {
                return Ok(id.to_string());
            }
        }
        return Err("Could not extract folder ID from URL".into());
    }

    // If it looks like a raw ID (alphanumeric + hyphens + underscores, reasonable length)
    if trimmed.len() >= 10
        && trimmed
            .chars()
            .all(|c| c.is_alphanumeric() || c == '-' || c == '_')
    {
        return Ok(trimmed.to_string());
    }

    Err(format!(
        "Unrecognized Google Drive folder URL or ID: {}",
        trimmed
    ))
}

/// List all image files in a public Google Drive folder.
/// Handles pagination automatically.
pub async fn list_images_in_folder(
    folder_id: &str,
    api_key: &str,
) -> Result<Vec<DriveFile>, String> {
    let client = reqwest::Client::new();
    let mut all_files: Vec<DriveFile> = Vec::new();
    let mut page_token: Option<String> = None;

    loop {
        let query = format!("'{}' in parents and trashed = false", folder_id);

        let mut request = client
            .get(DRIVE_API_BASE)
            .query(&[
                ("q", query.as_str()),
                ("key", api_key),
                (
                    "fields",
                    "nextPageToken,files(id,name,mimeType,webContentLink,thumbnailLink)",
                ),
                ("pageSize", "1000"),
                ("supportsAllDrives", "true"),
                ("includeItemsFromAllDrives", "true"),
            ]);

        if let Some(ref token) = page_token {
            request = request.query(&[("pageToken", token.as_str())]);
        }

        let response = request.send().await.map_err(|e| {
            format!("Failed to call Google Drive API: {}", e)
        })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "No response body".into());
            return Err(format!(
                "Google Drive API returned {}: {}",
                status, body
            ));
        }

        let api_response: DriveApiResponse = response.json().await.map_err(|e| {
            format!("Failed to parse Drive API response: {}", e)
        })?;

        // Filter to image files only
        for file in api_response.files {
            if IMAGE_MIME_TYPES.contains(&file.mime_type.as_str()) {
                all_files.push(DriveFile::from(file));
            }
        }

        match api_response.next_page_token {
            Some(token) if !token.is_empty() => {
                page_token = Some(token);
            }
            _ => break,
        }
    }

    // Sort by name for consistent ordering
    all_files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(all_files)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_folder_id_full_url() {
        let url = "https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ?usp=sharing";
        assert_eq!(
            extract_folder_id(url).unwrap(),
            "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
        );
    }

    #[test]
    fn test_extract_folder_id_plain() {
        assert_eq!(
            extract_folder_id("1aBcDeFgHiJkLmNoPqRsTuVwXyZ").unwrap(),
            "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
        );
    }

    #[test]
    fn test_extract_folder_id_open_url() {
        let url = "https://drive.google.com/open?id=1aBcDeFgHiJkLmNoPqRsTuVwXyZ";
        assert_eq!(
            extract_folder_id(url).unwrap(),
            "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
        );
    }

    #[test]
    fn test_extract_folder_id_invalid() {
        assert!(extract_folder_id("short").is_err());
    }
}
