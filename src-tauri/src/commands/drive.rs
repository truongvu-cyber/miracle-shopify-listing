use crate::models::DriveFile;
use crate::services::drive_service;
use tauri::Manager;

/// Scan a Google Drive folder for image files.
///
/// `folder_url` can be a full Google Drive URL or a plain folder ID.
/// The API key is loaded from the saved app settings.
#[tauri::command]
pub async fn scan_drive(app: tauri::AppHandle, folder_url: String) -> Result<Vec<DriveFile>, String> {
    // Load API key from saved settings
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    let settings_path = data_dir.join("settings.json");

    let api_key = if settings_path.exists() {
        let json = std::fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings: {}", e))?;
        let settings: serde_json::Value = serde_json::from_str(&json)
            .map_err(|e| format!("Failed to parse settings: {}", e))?;
        settings
            .get("googleApiKey")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string()
    } else {
        String::new()
    };

    if api_key.trim().is_empty() {
        return Err("Vui lòng cài đặt Google API Key trong phần Cài đặt trước khi quét ảnh.".to_string());
    }

    let folder_id = drive_service::extract_folder_id(&folder_url)?;
    let files = drive_service::list_images_in_folder(&folder_id, &api_key).await?;
    Ok(files)
}

/// Test if a Google API key is valid by listing files (limit 1) from Drive API.
/// The /about endpoint requires OAuth, so we use /files with pageSize=1 instead.
#[tauri::command]
pub async fn test_api_key(api_key: String) -> Result<String, String> {
    if api_key.trim().is_empty() {
        return Err("API Key trống".to_string());
    }

    let url = "https://www.googleapis.com/drive/v3/files";
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .query(&[
            ("key", api_key.as_str()),
            ("pageSize", "1"),
            ("fields", "files(id)"),
        ])
        .send()
        .await
        .map_err(|e| format!("Không thể kết nối: {}", e))?;

    if response.status().is_success() {
        Ok("API Key hoạt động!".to_string())
    } else {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        Err(format!("API Key không hợp lệ ({}): {}", status, body))
    }
}

/// Scan local folder for image files.
#[tauri::command]
pub async fn scan_local_folder(folder_path: String) -> Result<Vec<crate::models::DriveFile>, String> {
    let path = std::path::Path::new(&folder_path);
    if !path.exists() || !path.is_dir() {
        return Err("Thư mục không tồn tại".to_string());
    }

    let image_extensions = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "svg"];
    let mut files: Vec<crate::models::DriveFile> = Vec::new();

    let entries = std::fs::read_dir(path)
        .map_err(|e| format!("Không thể đọc thư mục: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Lỗi đọc file: {}", e))?;
        let file_path = entry.path();

        if !file_path.is_file() {
            continue;
        }

        let ext = file_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        if !image_extensions.contains(&ext.as_str()) {
            continue;
        }

        let file_name = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let absolute_path = file_path
            .canonicalize()
            .unwrap_or(file_path.clone())
            .to_string_lossy()
            .to_string();

        // Use a hash of the path as a stable ID
        let id = format!("local_{:x}", md5_simple(&absolute_path));

        files.push(crate::models::DriveFile {
            id,
            name: file_name,
            mime_type: format!("image/{}", ext),
            web_content_link: Some(absolute_path.clone()),
            thumbnail_link: Some(absolute_path),
        });
    }

    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(files)
}

/// Simple hash for generating stable IDs from paths
fn md5_simple(input: &str) -> u64 {
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in input.bytes() {
        hash ^= byte as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    hash
}
