use crate::models::CSVGenerateRequest;
use crate::services::csv_service;

/// Generate a Shopify-compatible CSV file from product data and match results.
///
/// Returns the output file path on success.
#[tauri::command]
pub async fn generate_csv(request: CSVGenerateRequest) -> Result<String, String> {
    // Run CSV generation on a blocking thread since it does file I/O
    tokio::task::spawn_blocking(move || csv_service::generate_csv(&request))
        .await
        .map_err(|e| format!("CSV generation task failed: {}", e))?
}

/// Write CSV content string directly to a file.
/// Used by the frontend when saving generated CSV data.
#[tauri::command]
pub async fn write_csv_file(csv_content: String, file_path: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        // Write BOM + content
        let mut content = Vec::new();
        content.extend_from_slice(b"\xef\xbb\xbf"); // UTF-8 BOM for Excel
        content.extend_from_slice(csv_content.as_bytes());

        std::fs::write(&file_path, content)
            .map_err(|e| format!("Không thể ghi file: {}", e))?;

        Ok(file_path)
    })
    .await
    .map_err(|e| format!("Lỗi: {}", e))?
}

/// Merge multiple CSV content strings into one.
/// Keeps header from first CSV, appends rows from all others.
#[tauri::command]
pub async fn merge_csv_files(csv_contents: Vec<String>) -> Result<String, String> {
    if csv_contents.is_empty() {
        return Err("Không có dữ liệu để gộp".to_string());
    }

    let mut merged_lines: Vec<String> = Vec::new();
    let mut header: Option<String> = None;

    for (i, content) in csv_contents.iter().enumerate() {
        let lines: Vec<&str> = content.lines().collect();
        if lines.is_empty() {
            continue;
        }

        if i == 0 {
            // First file: keep header + all data
            header = Some(lines[0].to_string());
            for line in &lines[1..] {
                if !line.trim().is_empty() {
                    merged_lines.push(line.to_string());
                }
            }
        } else {
            // Subsequent files: skip header, append data only
            for line in &lines[1..] {
                if !line.trim().is_empty() {
                    merged_lines.push(line.to_string());
                }
            }
        }
    }

    let mut result = String::new();
    if let Some(h) = header {
        result.push_str(&h);
        result.push('\n');
    }
    result.push_str(&merged_lines.join("\n"));

    Ok(result)
}
