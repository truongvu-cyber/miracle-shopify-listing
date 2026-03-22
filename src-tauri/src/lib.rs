mod commands;
mod models;
mod services;

use commands::auth::AuthState;

pub use models::*;
pub use services::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AuthState { current_user: std::sync::Mutex::new(None) })
        .invoke_handler(tauri::generate_handler![
            commands::drive::scan_drive,
            commands::drive::test_api_key,
            commands::drive::scan_local_folder,
            commands::csv::generate_csv,
            commands::csv::write_csv_file,
            commands::csv::merge_csv_files,
            commands::storage::save_settings,
            commands::storage::load_settings,
            commands::storage::save_history,
            commands::storage::load_history,
            commands::storage::delete_history,
            commands::storage::get_app_data_dir,
            commands::auth::login,
            commands::auth::logout,
            commands::auth::get_current_user,
            commands::auth::add_user,
            commands::auth::remove_user,
            commands::auth::list_users,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
