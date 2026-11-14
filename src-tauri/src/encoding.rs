//! 文本解码：统一把任意编码的 Markdown 文件转成 UTF-8 字符串。
//! 检测顺序：BOM → 严格 UTF-8 → chardetng 猜测（中文场景常见 GBK/GB18030）。

use encoding_rs::{Encoding, UTF_16BE, UTF_16LE};

/// 返回 (解码后的文本, 编码标签)
pub fn decode_to_string(bytes: &[u8]) -> (String, &'static str) {
    // 1. BOM 优先
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return (
            String::from_utf8_lossy(&bytes[3..]).into_owned(),
            "UTF-8 BOM",
        );
    }
    if bytes.starts_with(&[0xFF, 0xFE]) {
        return (decode_with(&UTF_16LE, bytes), "UTF-16 LE");
    }
    if bytes.starts_with(&[0xFE, 0xFF]) {
        return (decode_with(&UTF_16BE, bytes), "UTF-16 BE");
    }
    // 2. 严格 UTF-8
    if let Ok(text) = std::str::from_utf8(bytes) {
        return (text.to_string(), "UTF-8");
    }
    // 3. chardetng 猜测（Markdown 不会是 ISO-2022-JP，禁用以减少误判）
    let mut detector = chardetng::EncodingDetector::new(chardetng::Iso2022JpDetection::Deny);
    detector.feed(bytes, true);
    let guessed = detector.guess(None, chardetng::Utf8Detection::Allow);
    (decode_with(guessed, bytes), guessed.name())
}

fn decode_with(encoding: &'static Encoding, bytes: &[u8]) -> String {
    let (text, _, _) = encoding.decode(bytes);
    text.into_owned()
}
