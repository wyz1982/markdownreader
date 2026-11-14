mod commands;
mod encoding;

use tauri::{Emitter, Manager};

// 注意：single-instance 插件必须第一个注册（官方要求）
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // 第二次双击 .md 文件时，把路径转发给已有窗口（M2 前端接入）
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("open-from-args", argv);
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::save_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
