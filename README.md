# MarkDownReader

Windows 轻量级 Markdown 编辑器 + 阅读器。目标是：安装包小、启动快、内存低，同时做到「最新语法 100% 兼容、完美渲染」。

- 完整规划见 [PLAN.md](./PLAN.md)
- 技术栈：**Tauri 2 + TypeScript + React 19 + CodeMirror 6（M3）+ markdown-it（M1）**

## 开发环境要求

| 依赖 | 说明 |
|---|---|
| Node.js ≥ 20 + pnpm | 前端构建（本机 Node 24 + pnpm 12） |
| Rust stable (MSVC) | 应用壳编译（rustup 安装，需 VS Build Tools） |
| WebView2 运行时 | Win10 1809+ / Win11 系统自带 |

## 常用命令

```bash
pnpm install        # 安装前端依赖
pnpm dev            # 仅前端：浏览器里调试渲染引擎（M1 起常用）
pnpm tauri dev      # 完整应用：编译 Rust 壳并启动桌面窗口
pnpm build          # TS 类型检查 + 前端产物构建
pnpm lint           # ESLint 检查
pnpm format         # Prettier 格式化
```

Rust 侧在 `src-tauri/` 内：`cargo check`（快速检查）/ `cargo clippy`（静态分析）。

## 目录结构

```
src/                  # 前端 (TS + React)
  app/                # 应用布局与界面状态
  editor/             # CodeMirror 6 封装（M3）
  renderer/           # markdown 渲染管线（M1）
  styles/             # 主题变量与排版
  ipc.ts              # Rust 命令的类型化封装
src-tauri/            # Rust 壳
  src/commands.rs     # 文件读写 IPC（编码检测 / 原子写入）
  src/encoding.rs     # UTF-8/GBK/UTF-16 自动解码
tests/                # 规范测试与快照（M1）
PLAN.md               # 开发规划与里程碑
```

## 里程碑进度

- [x] **M0** 环境准备 + 脚手架（Tauri 2.12 / React 19 / Vite 8 / ESLint / IPC 命令占位）
- [ ] **M1** 渲染引擎（markdown-it 全插件链 + KaTeX/Shiki/Mermaid + 规范测试）
- [ ] **M2** 阅读器（打开文件 / 大纲侧栏 / 文件关联 / 编码兼容）
- [ ] **M3** 编辑器（CodeMirror 6 + 分栏双向滚动同步）
- [ ] **M4** 体验完善（设置页 / 导出 HTML+PDF / i18n）
- [ ] **M5** 打磨发布（NSIS 安装包 + 文件关联 + 性能基准）
