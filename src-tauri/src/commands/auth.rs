use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::Mutex;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub username: String,
    pub password_hash: String,
    pub role: String, // "admin" or "member"
    pub display_name: String,
    #[serde(default)]
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserInfo {
    pub username: String,
    pub role: String,
    pub display_name: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsersDb {
    pub users: Vec<User>,
}

impl Default for UsersDb {
    fn default() -> Self {
        let admin_hash = bcrypt::hash("01653231064Mc", 10).unwrap();
        let miracle_hash = bcrypt::hash("miracle2026", 10).unwrap();
        Self {
            users: vec![
                User {
                    username: "truong".to_string(),
                    password_hash: admin_hash,
                    role: "admin".to_string(),
                    display_name: "Admin".to_string(),
                    created_at: chrono::Utc::now().to_rfc3339(),
                },
                User {
                    username: "miracle".to_string(),
                    password_hash: miracle_hash,
                    role: "member".to_string(),
                    display_name: "Miracle".to_string(),
                    created_at: chrono::Utc::now().to_rfc3339(),
                },
            ],
        }
    }
}

fn get_users_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create dir: {}", e))?;
    }
    Ok(dir.join("users.json"))
}

fn load_users(app: &tauri::AppHandle) -> Result<UsersDb, String> {
    let path = get_users_path(app)?;
    if !path.exists() {
        let db = UsersDb::default();
        save_users_db(app, &db)?;
        return Ok(db);
    }
    let json = fs::read_to_string(&path).map_err(|e| format!("Read error: {}", e))?;
    serde_json::from_str(&json).map_err(|e| format!("Parse error: {}", e))
}

fn save_users_db(app: &tauri::AppHandle, db: &UsersDb) -> Result<(), String> {
    let path = get_users_path(app)?;
    let json = serde_json::to_string_pretty(db).map_err(|e| format!("Serialize error: {}", e))?;
    fs::write(&path, json).map_err(|e| format!("Write error: {}", e))?;
    Ok(())
}

// State to track current logged-in user
pub struct AuthState {
    pub current_user: Mutex<Option<UserInfo>>,
}

#[tauri::command]
pub async fn login(app: tauri::AppHandle, state: tauri::State<'_, AuthState>, username: String, password: String) -> Result<UserInfo, String> {
    let db = load_users(&app)?;

    let user = db.users.iter().find(|u| u.username == username)
        .ok_or("Tên đăng nhập không tồn tại")?;

    let valid = bcrypt::verify(&password, &user.password_hash)
        .map_err(|_| "Lỗi xác thực".to_string())?;

    if !valid {
        return Err("Mật khẩu không đúng".to_string());
    }

    let info = UserInfo {
        username: user.username.clone(),
        role: user.role.clone(),
        display_name: user.display_name.clone(),
        created_at: user.created_at.clone(),
    };

    *state.current_user.lock().unwrap() = Some(info.clone());
    Ok(info)
}

#[tauri::command]
pub async fn logout(state: tauri::State<'_, AuthState>) -> Result<(), String> {
    *state.current_user.lock().unwrap() = None;
    Ok(())
}

#[tauri::command]
pub async fn get_current_user(state: tauri::State<'_, AuthState>) -> Result<Option<UserInfo>, String> {
    Ok(state.current_user.lock().unwrap().clone())
}

#[tauri::command]
pub async fn add_user(app: tauri::AppHandle, state: tauri::State<'_, AuthState>, username: String, password: String, display_name: String) -> Result<UserInfo, String> {
    // Check admin
    let current = state.current_user.lock().unwrap();
    match &*current {
        Some(u) if u.role == "admin" => {},
        _ => return Err("Chỉ admin mới có quyền thêm người dùng".to_string()),
    }
    drop(current);

    let mut db = load_users(&app)?;

    if db.users.iter().any(|u| u.username == username) {
        return Err("Tên đăng nhập đã tồn tại".to_string());
    }

    let hash = bcrypt::hash(&password, 10).map_err(|e| format!("Hash error: {}", e))?;

    let user = User {
        username: username.clone(),
        password_hash: hash,
        role: "member".to_string(),
        display_name: display_name.clone(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    db.users.push(user);
    save_users_db(&app, &db)?;

    Ok(UserInfo {
        username,
        role: "member".to_string(),
        display_name,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub async fn remove_user(app: tauri::AppHandle, state: tauri::State<'_, AuthState>, username: String) -> Result<(), String> {
    let current = state.current_user.lock().unwrap();
    match &*current {
        Some(u) if u.role == "admin" => {},
        _ => return Err("Chỉ admin mới có quyền xóa người dùng".to_string()),
    }
    drop(current);

    if username == "truong" {
        return Err("Không thể xóa tài khoản admin chính".to_string());
    }

    let mut db = load_users(&app)?;
    let before = db.users.len();
    db.users.retain(|u| u.username != username);

    if db.users.len() == before {
        return Err("Không tìm thấy người dùng".to_string());
    }

    save_users_db(&app, &db)?;
    Ok(())
}

#[tauri::command]
pub async fn list_users(app: tauri::AppHandle, state: tauri::State<'_, AuthState>) -> Result<Vec<UserInfo>, String> {
    let current = state.current_user.lock().unwrap();
    match &*current {
        Some(u) if u.role == "admin" => {},
        _ => return Err("Chỉ admin mới xem được danh sách".to_string()),
    }
    drop(current);

    let db = load_users(&app)?;
    Ok(db.users.iter().map(|u| UserInfo {
        username: u.username.clone(),
        role: u.role.clone(),
        display_name: u.display_name.clone(),
        created_at: u.created_at.clone(),
    }).collect())
}
