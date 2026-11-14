mod commands;
mod encoding;

use std::sync::Mutex;
use tauri::{Emitter, Manager};

// 注意：single-instance 插件必须第一个注册（官方要求）
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // 第二次双击 .md 文件时，把路径转发给已有窗口
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("open-from-args", argv);
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .manage(commands::WatchState(Mutex::new(None)))
        .manage(commands::LaunchArgs(Mutex::new(Vec::new())))
        .invoke_handler(tauri::generate_handler![
            commands::read_file,
            commands::save_file,
            commands::watch_file,
            commands::get_launch_args
        ])
        .setup(|app| {
            // 记录启动参数（文件关联双击打开），前端就绪后主动拉取，避免事件早于监听而丢失
            let args: Vec<String> = std::env::args().skip(1).collect();
            *app.state::<commands::LaunchArgs>()
                .0
                .lock()
                .expect("launch args 锁") = args;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
