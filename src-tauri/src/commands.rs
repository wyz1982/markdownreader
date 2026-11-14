//! 文件读写与文件监视命令：前端通过 IPC 调用。
//! 读：编码自动检测；写：原子写入（先写临时文件再改名，避免半截文件）。

use notify::Watcher;
use serde::Serialize;
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::Emitter;

#[derive(Serialize)]
pub struct ReadFileResult {
    pub path: String,
    pub content: String,
    pub encoding: String,
    pub size: u64,
}

#[tauri::command]
pub fn read_file(path: String) -> Result<ReadFileResult, String> {
    let file_path = Path::new(&path);
    if !file_path.is_file() {
        return Err(format!("文件不存在或不是常规文件: {path}"));
    }
    let bytes = fs::read(file_path).map_err(|e| format!("读取失败: {e}"))?;
    let size = bytes.len() as u64;
    let (content, encoding) = crate::encoding::decode_to_string(&bytes);
    Ok(ReadFileResult {
        path,
        content,
        encoding: encoding.to_string(),
        size,
    })
}

#[tauri::command]
pub fn save_file(path: String, content: String) -> Result<(), String> {
    let file_path = Path::new(&path);
    let dir = file_path
        .parent()
        .ok_or_else(|| format!("无效路径: {path}"))?;
    let file_name = file_path
        .file_name()
        .ok_or_else(|| format!("无效文件名: {path}"))?;

    // 原子写：临时文件与目标同目录，保证 rename 在同一分区成功
    let tmp_path = dir.join(format!(".{}.mdr-tmp", file_name.to_string_lossy()));
    fs::write(&tmp_path, content.as_bytes()).map_err(|e| format!("写入临时文件失败: {e}"))?;
    if let Err(e) = fs::rename(&tmp_path, file_path) {
        let _ = fs::remove_file(&tmp_path); // 清理残留
        return Err(format!("保存失败: {e}"));
    }
    Ok(())
}

/// 保存粘贴的图片到文档同目录 assets/，返回 Markdown 可用的相对路径
#[tauri::command]
pub fn save_paste_image(dir: String, file_name: String, bytes: Vec<u8>) -> Result<String, String> {
    if file_name.contains('/') || file_name.contains('\\') || file_name.contains("..") {
        return Err(format!("非法文件名: {file_name}"));
    }
    if bytes.is_empty() {
        return Err("空图片数据".to_string());
    }
    let assets = Path::new(&dir).join("assets");
    fs::create_dir_all(&assets).map_err(|e| format!("创建 assets 目录失败: {e}"))?;
    let target = assets.join(&file_name);
    fs::write(&target, &bytes).map_err(|e| format!("写入图片失败: {e}"))?;
    Ok(format!("assets/{file_name}"))
}

/// 当前被监视的文件。替换 Option 值即自动解除旧监视（RecommendedWatcher 被 drop 时 unwatch）。
pub struct WatchState(pub Mutex<Option<notify::RecommendedWatcher>>);

/// 应用启动时的命令行参数（文件关联双击打开的场景，前端就绪后主动拉取）
pub struct LaunchArgs(pub Mutex<Vec<String>>);

#[tauri::command]
pub fn get_launch_args(state: tauri::State<LaunchArgs>) -> Vec<String> {
    state.0.lock().expect("launch args 锁").clone()
}

/// 监视指定文件的外部修改；传 None 停止监视。
/// 实现上监视其父目录（Windows 单文件监视也是监视父目录），按文件名过滤事件。
#[tauri::command]
pub fn watch_file(
    app: tauri::AppHandle,
    state: tauri::State<WatchState>,
    path: Option<String>,
) -> Result<(), String> {
    let mut guard = state.0.lock().expect("watch 锁");
    *guard = None; // 先解除旧监视

    let Some(path) = path else { return Ok(()) };
    let target = PathBuf::from(&path);
    let dir = target
        .parent()
        .ok_or_else(|| format!("无效路径: {path}"))?
        .to_path_buf();
    let file_name = target
        .file_name()
        .ok_or_else(|| format!("无效文件名: {path}"))?
        .to_os_string();

    let app_for_event = app.clone();
    let mut watcher =
        notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
            let Ok(event) = res else { return };
            let is_modify = matches!(event.kind, notify::event::EventKind::Modify(_));
            if is_modify
                && event
                    .paths
                    .iter()
                    .any(|p| p.file_name() == Some(file_name.as_os_str()))
            {
                let _ = app_for_event.emit("file-changed-on-disk", path.clone());
            }
        })
        .map_err(|e| format!("启动文件监视失败: {e}"))?;

    watcher
        .watch(&dir, notify::RecursiveMode::NonRecursive)
        .map_err(|e| format!("监视目录失败: {e}"))?;
    *guard = Some(watcher);
    Ok(())
}
