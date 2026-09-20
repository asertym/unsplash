pub mod unsplash;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(desktop)]
            let _ = app
                .handle()
                .plugin(tauri_plugin_updater::Builder::new().build());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            unsplash::get_favorites,
            unsplash::save_favorites,
            unsplash::save_photo,
            unsplash::get_settings,
            unsplash::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
