use std::fs;
use std::path::PathBuf;

const FAVORITES_FILE: &str = "favorites.json";
const SETTINGS_FILE: &str = "settings.json";
const DEFAULT_SAVE_SUBDIR: &str = "Unsplash Wallpapers";

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

fn default_save_dir() -> PathBuf {
    let base = dirs::picture_dir()
        .or_else(|| dirs::download_dir())
        .unwrap_or_else(|| dirs::home_dir().unwrap_or_default());
    base.join(DEFAULT_SAVE_SUBDIR)
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-') { c } else { '_' })
        .collect()
}

/// Downloads `url` and writes it to `dest_dir` (or the default wallpapers folder).
/// Returns the full path of the saved file.
#[tauri::command]
pub async fn save_photo(url: String, filename: String, dest_dir: Option<String>) -> Result<String, String> {
    let bytes = reqwest::get(&url)
        .await
        .map_err(|e| format!("Download failed: {e}"))?
        .bytes()
        .await
        .map_err(|e| format!("Download failed: {e}"))?;
    let dir = match dest_dir.filter(|d| !d.trim().is_empty()) {
        Some(d) => PathBuf::from(d),
        None => default_save_dir(),
    };
    fs::create_dir_all(&dir).map_err(|e| format!("Could not create folder: {e}"))?;
    let path = dir.join(sanitize_filename(&filename));
    fs::write(&path, &bytes).map_err(|e| format!("Could not save file: {e}"))?;
    Ok(path.display().to_string())
}

#[tauri::command]
pub async fn get_settings() -> Result<serde_json::Value, String> {
    let dir = get_app_data_dir()?;
    match fs::read_to_string(dir.join(SETTINGS_FILE)) {
        Ok(content) => serde_json::from_str(&content).map_err(|e| e.to_string()),
        Err(_) => Ok(serde_json::Value::Object(Default::default())),
    }
}

#[tauri::command]
pub async fn save_settings(settings: serde_json::Value) -> Result<(), String> {
    let dir = get_app_data_dir()?;
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(dir.join(SETTINGS_FILE), json).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::sanitize_filename;

    #[test]
    fn sanitize_strips_path_separators() {
        assert_eq!(sanitize_filename("mountain-view.jpg"), "mountain-view.jpg");
        assert_eq!(sanitize_filename("../etc/passwd"), ".._etc_passwd");
        assert_eq!(sanitize_filename("a/b\\c.png"), "a_b_c.png");
    }
}
