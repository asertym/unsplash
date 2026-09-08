use std::fs;
use std::path::PathBuf;

const FAVORITES_FILE: &str = "favorites.json";

fn get_app_data_dir() -> Result<PathBuf, String> {
    let dir = dirs::data_local_dir()
        .ok_or("Could not resolve local data directory")?
        .join("com.alex.unsplash-wallpapers");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

#[tauri::command]
pub async fn get_favorites() -> Result<String, String> {
    let dir = get_app_data_dir()?;
    let path = dir.join(FAVORITES_FILE);
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(_) => Ok("[]".to_string()),
    }
}

#[tauri::command]
pub async fn save_favorites(ids: Vec<String>) -> Result<(), String> {
    let dir = get_app_data_dir()?;
    let path = dir.join(FAVORITES_FILE);
    let json = serde_json::to_string_pretty(&ids).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}
