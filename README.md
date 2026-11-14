# MarkDownReader

Windows 轻量级 Markdown 编辑器 + 阅读器。安装包小、启动快、内存低，同时做到「最新语法 100% 兼容、完美渲染」。

- 开发规划：[PLAN.md](./PLAN.md)
- 技术栈：**Tauri 2 · TypeScript · React 19 · CodeMirror 6 · markdown-it**

## 功能

- **渲染引擎**：CommonMark 0.31.2 规范测试套件 **652 例 100% 通过** + GFM 全部扩展 + KaTeX 公式 / Shiki 代码高亮 / Mermaid 图表 / 脚注 / 提示容器 / 任务列表 / Front Matter / [TOC] / Emoji / 内嵌 HTML（DOMPurify 消毒）
- **编辑器**：CodeMirror 6，行号 / 当前行高亮 / 搜索替换 / 列表自动续写 / 格式工具栏（Ctrl+B/I/K）
- **分栏同步**：源码与预览基于 `token.map` 行号映射的**双向滚动同步**
- **阅读模式**：大纲侧栏 scroll-spy + 点击跳转，排版宽度优化
- **文件管理**：打开对话框 / 拖拽 / `.md` 文件关联双击（安装后）/ 最近文件（持久化）
- **编码兼容**：UTF-8 / UTF-8 BOM / UTF-16 / GBK / GB18030 自动检测
- **安全写入**：原子写（临时文件 + rename），外部修改监视与重载提示
- **导出**：单文件 HTML（内联样式 + KaTeX 字体 base64，离线可用）/ PDF（系统打印）
- **个性化**：明暗主题（跟随系统/强制）、正文字号行高、衬线/无衬线、编辑器字号；中英双语界面

## 性能基准（Release 1.0.0，实测）

| 指标 | 目标 | 实测 |
|---|---|---|
| NSIS 安装包体积 | ≤ 15 MB | **5.74 MiB** |
| 冷启动（主窗口出现） | ≤ 1 s | **143 ms** |
| 热启动 | — | **151 ms** |
| 空载内存 | ≤ 150 MB | **34 MB** |

## 构建

```bash
pnpm install
pnpm tauri dev      # 开发调试
pnpm tauri build    # 产物: src-tauri/target/release/bundle/nsis/*-setup.exe
```

NSIS 安装包（per-user 安装，无需管理员）会注册 `.md/.markdown/.mdown/.mkd` 文件关联。

## 常用命令

```bash
pnpm dev            # 仅前端：浏览器里调试渲染引擎
pnpm build          # TS 类型检查 + 前端产物构建
pnpm test           # 全部测试（规范/扩展/快照/单测，696 例）
pnpm lint           # ESLint
pnpm format         # Prettier
```

Rust 侧在 `src-tauri/` 内：`cargo check` / `cargo clippy` / `cargo fmt`。

## 测试体系

- **规范符合性**：从官方 `spec.txt` 生成的 CommonMark 0.31.2 全量 652 例（`scripts/gen-spec-json.mjs`）
- **扩展语法**：14 例 + GFM 5 例 + 完整样例渲染快照（防回归）
- **单元测试**：列表续写 / 块级行号映射 / 格式化操作 / 最近文件去重 / i18n 完整性 / 导出 HTML 结构

## 目录结构

```
src/                  # 前端 (TS + React)
  app/                # 布局、状态(Zustand)、设置、导出、i18n
  editor/             # CodeMirror 6 封装、滚动同步、格式化
  renderer/           # markdown 渲染管线（纯模块，不依赖 Tauri）
  styles/             # 主题变量、排版、打印样式
  ipc.ts              # Rust 命令的类型化封装
src-tauri/            # Rust 壳
  src/commands.rs     # 文件读写 / 监视 / 图片落盘 IPC
  src/encoding.rs     # 编码自动检测
tests/                # 696 例测试
scripts/              # 图标生成 / 规范测试集生成 / 基准测量
PLAN.md               # 开发规划与里程碑
```

## 里程碑

- [x] **M0** 环境准备 + 脚手架
- [x] **M1** 渲染引擎（规范测试 652 例 100%）
- [x] **M2** 阅读器（文件关联 / 大纲侧栏 / 编码兼容）
- [x] **M3** 编辑器（CodeMirror 6 + 分栏双向同步）
- [x] **M4** 体验完善（设置页 / 导出 / i18n）
- [x] **M5** 打磨发布（NSIS 1.0.0 / 图标 / 性能基准）
