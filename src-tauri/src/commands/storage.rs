use crate::models::{AppSettings, ListingHistory};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// Get the app data directory path, creating it if needed.
fn get_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create app data dir: {}", e))?;
    }
    Ok(dir)
}

/// Get the settings file path.
fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(get_data_dir(app)?.join("settings.json"))
}

/// Get the history directory path, creating it if needed.
fn history_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = get_data_dir(app)?.join("history");
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create history dir: {}", e))?;
    }
    Ok(dir)
}

// --- Settings Commands ---

/// Save application settings (API key, defaults, etc.)
#[tauri::command]
pub async fn save_settings(
    app: tauri::AppHandle,
    settings: AppSettings,
) -> Result<(), String> {
    let path = settings_path(&app)?;
    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    Ok(())
}

/// Load application settings. Returns defaults if no file exists.
#[tauri::command]
pub async fn load_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(AppSettings::default());
    }
    let json = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;
    let settings: AppSettings = serde_json::from_str(&json)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;
    Ok(settings)
}

// --- History Commands ---

/// Save a listing to history.
#[tauri::command]
pub async fn save_history(
    app: tauri::AppHandle,
    entry: ListingHistory,
) -> Result<(), String> {
    let dir = history_dir(&app)?;
    let filename = format!("{}.json", entry.id);
    let path = dir.join(filename);
    let json = serde_json::to_string_pretty(&entry)
        .map_err(|e| format!("Failed to serialize history entry: {}", e))?;
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write history entry: {}", e))?;
    Ok(())
}

/// Load all listing history entries, sorted by creation date descending.
#[tauri::command]
pub async fn load_history(app: tauri::AppHandle) -> Result<Vec<ListingHistory>, String> {
    let dir = history_dir(&app)?;
    let mut entries: Vec<ListingHistory> = Vec::new();

    let read_dir = fs::read_dir(&dir)
        .map_err(|e| format!("Failed to read history dir: {}", e))?;

    for entry in read_dir {
        let entry = entry.map_err(|e| format!("Failed to read dir entry: {}", e))?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            match fs::read_to_string(&path) {
                Ok(json) => match serde_json::from_str::<ListingHistory>(&json) {
                    Ok(history) => entries.push(history),
                    Err(e) => {
                        eprintln!("Warning: Failed to parse history file {:?}: {}", path, e);
                    }
                },
                Err(e) => {
                    eprintln!("Warning: Failed to read history file {:?}: {}", path, e);
                }
            }
        }
    }

    // Sort by created_at descending (newest first)
    entries.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    Ok(entries)
}

/// Delete a specific history entry by ID.
#[tauri::command]
pub async fn delete_history(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let dir = history_dir(&app)?;
    let path = dir.join(format!("{}.json", id));
    if path.exists() {
        fs::remove_file(&path)
            .map_err(|e| format!("Failed to delete history entry: {}", e))?;
    }
    Ok(())
}

/// Get the app data directory path as a string (useful for frontend).
#[tauri::command]
pub async fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let dir = get_data_dir(&app)?;
    dir.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "App data dir path contains invalid UTF-8".into())
}
