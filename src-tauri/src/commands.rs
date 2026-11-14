//! 文件读写命令：前端通过 IPC 调用。
//! 读：编码自动检测；写：原子写入（先写临时文件再改名，避免半截文件）。

use serde::Serialize;
use std::{fs, path::Path};

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
