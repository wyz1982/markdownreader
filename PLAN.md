# MarkDownReader 开发规划

> 一个 Windows 轻量级 Markdown 编辑器 + 阅读器。目标：安装包小、启动快、内存低，同时做到「最新语法 100% 兼容、完美渲染」。
>
> 规划日期：2026-11-14 ｜ 状态：待实施

---

## 1. 项目定位与目标

| 维度 | 目标 |
|---|---|
| 平台 | Windows 10/11（WebView2 渲染） |
| 产品形态 | 单文件打开/编辑/阅读优先，架构预留文件树 + 多标签页扩展 |
| 安装包体积 | ≤ 15 MB（NSIS 安装包） |
| 启动速度 | 冷启动 ≤ 1 s |
| 空载内存 | ≤ 150 MB |
| 语法兼容 | CommonMark 0.31.2 规范测试套件 100% 通过 + GFM 全部扩展 + 常用扩展语法 |
| 渲染质量 | 接近 GitHub / Typora 观感，明暗双主题，公式/图表/代码高亮开箱即用 |

## 2. 技术选型

### 2.1 应用壳：Tauri 2.x（当前稳定 2.12）

- 安装包约 10~15 MB、空载内存低：UI 渲染复用系统自带的 WebView2（Win10 1809+ / Win11 自带），不打包浏览器内核。
- Rust 只做薄壳（文件 IO、单实例、窗口状态、打包），日常功能迭代几乎不接触 Rust。
- Tauri 3.0 尚在 alpha（2026-10），不采用；锁定 2.x 稳定线。
- **前置条件**：本机需一次性安装 Rust 工具链（rustup + MSVC link 所需的 VS Build Tools）。

### 2.2 前端：TypeScript + Vite + React

- Vite 5+ 构建，React 19 管理界面状态（面板布局、设置、最近文件），轻量状态用 Zustand。
- 不引入重型 UI 组件库，界面手写 CSS（CSS 变量做主题系统），保持轻量。

### 2.3 Markdown 引擎：markdown-it + 插件链

选 markdown-it 而非 remark/marked 的理由：

1. **CommonMark 0.31.2 规范测试套件 100% 通过**（marked 兼容性不足，remark 合规但插件生态散）；
2. 块级 token 自带 `token.map`（源码行号映射）——**分栏滚动同步的关键基础设施**（VSCode 内置预览同款思路）；
3. 生态最全，所需的全部扩展语法均有成熟插件，符合「全能渲染」目标。

### 2.4 渲染增强组件

| 能力 | 组件 | 说明 |
|---|---|---|
| 代码高亮 | Shiki | VS Code 同款语法/主题，按需懒加载语言包 |
| 数学公式 | KaTeX | 行内 `$...$`、块级 `$$...$$`，比 MathJax 快且轻 |
| 图表 | Mermaid | 流程图/时序图/甘特/状态图等，动态 import 懒加载，首屏零开销 |
| HTML 安全 | DOMPurify | 允许内嵌 HTML 但过滤脚本/危险属性 |

### 2.5 Rust 侧依赖

`tauri-plugin-dialog`（打开/保存）、`tauri-plugin-fs`（作用域文件访问）、`tauri-plugin-store`（设置持久化）、`tauri-plugin-single-instance`（单实例 + 文件关联转发）、`tauri-plugin-window-state`（记忆窗口）、`tauri-plugin-opener`（外链跳浏览器）；`notify`（文件外部变更监视）、`chardetng + encoding_rs`（GBK/GB18030 等编码自动检测）。

## 3. 总体架构

```
┌─────────────────── WebView2 (前端, TS) ───────────────────┐
│  UI 层: 三栏布局(侧栏[预留] / 编辑器 / 预览) · 主题 · 设置页 │
│                                                            │
│  Editor 层: CodeMirror 6                                  │
│    @codemirror/lang-markdown + GFM/数学自定义高亮装饰       │
│                                                            │
│  Renderer 层 (纯函数管线, 可独立测试):                      │
│    md 源码 → markdown-it(+插件链) → token.map 行号标注      │
│           → DOMPurify 消毒 → HTML                          │
│    渲染后处理: Shiki 高亮 / KaTeX / Mermaid 懒渲染 / TOC    │
│                                                            │
│  滚动同步: token.map ↔ data-line 双向映射                  │
└──────────────────────┬─────────────────────────────────────┘
                       │ IPC (invoke / event)
┌──────────────────────┴─────────────────────────────────────┐
│  Rust 核心 (薄壳):                                          │
│   · read_file: 编码检测(BOM/GBK回退UTF-8) + 统一转UTF-8     │
│   · save_file: 原子写入(临时文件+rename)                    │
│   · 单实例: 第二次双击 .md → 参数转发给已有窗口             │
│   · notify: 文件外部变更 → 事件 → 前端提示重载              │
│   · 设置/最近文件: %APPDATA% 持久化                         │
└────────────────────────────────────────────────────────────┘
```

**防抖渲染策略**：编辑输入 150ms 防抖全量重渲染（markdown-it 解析 1MB 文档 <50ms，足够轻量）；大文件（>1MB）的增量渲染列为 v1.1 优化。

## 4. 语法支持矩阵（「兼容最新语法」的定义）

### 4.1 基础规范（验收硬指标）

- **CommonMark 0.31.2**（当前最新版规范，652 条测试用例）：标题、段落、列表（含嵌套/松紧）、引用、代码块/行内代码、链接/引用链接/图片、强调/加粗、反斜杠转义、HTML 块、硬换行、实体等 —— **必须 100% 通过**。
- **GFM 扩展**：表格、任务列表、删除线 `~~x~~`、自动链接、tagfilter。

### 4.2 扩展语法（全能渲染）

| 语法 | 示例 | 实现 |
|---|---|---|
| 数学公式 | `$E=mc^2$`、`$$...$$` | KaTeX |
| 脚注 | `[^1]` | markdown-it-footnote |
| 删除线/高亮/上下标 | `~~x~~` `==x==` `^x^` `~x~` | markdown-it-mark / sub / sup |
| 定义列表 | `术语\n: 定义` | markdown-it-deflist |
| 提示容器 | `:::note / :::tip / :::warning` | markdown-it-container（5 种样式） |
| YAML Front Matter | 文件头 `--- ... ---` | 解析为元信息（显示为文档信息卡） |
| 目录 | `[TOC]` 占位 + 大纲侧栏 | 自定义插件 + heading slug 锚点 |
| Emoji | `:smile:` | markdown-it-emoji |
| Mermaid 图表 | ```` ```mermaid ```` | 懒加载渲染 |
| 代码高亮 | ```` ```ts ```` | Shiki |
| 内嵌 HTML | 任意 HTML | DOMPurify 白名单过滤 |

### 4.3 中文场景专项（容易被忽略的「完美渲染」细节）

- UTF-8 BOM / GBK / GB18030 编码自动识别与无感转换；保存统一 UTF-8（可选保留原编码）。
- CJK 标点悬挂、中英文混排间距（CSS `text-autospace`/工具类处理）。
- 中文书名号/引号内的强调、CJK 与行内代码/链接混排的换行规则测试用例。
- Windows 路径（反斜杠、中文路径、含空格路径）的图片相对路径解析。

## 5. 功能与里程碑

### M0 环境准备 + 脚手架（0.5 天）
- 安装 Rust（rustup）+ VS Build Tools（一次性）。
- `create-tauri-app` 初始化：Tauri 2.12 + Vite + React + TS；ESLint + Prettier + 端到端 `pnpm tauri dev` 跑通空窗口。
- 建立目录骨架与 IPC 命令占位。

### M1 渲染引擎（2~3 天）★核心
- markdown-it 管线 + 全部插件链 + DOMPurify；渲染器做成**与 Tauri 无关的纯模块**，可先在浏览器里独立调试。
- KaTeX / Shiki / Mermaid 接入（Mermaid、Shiki 语言包懒加载）。
- 明暗主题 CSS 变量体系 + 排版样式（接近 GitHub 观感）。
- **测试**：接入 commonmark spec 652 例 + GFM 用例 + 扩展语法快照测试（Vitest）。

### M2 阅读器（1~2 天）
- 打开文件：对话框 / 拖拽 / 双击 `.md` 文件关联（文件关联 + 单实例参数转发）。
- 纯阅读布局：编辑器隐藏、排版加宽、大纲侧栏（scroll-spy 高亮 + 点击跳转）。
- 最近文件列表；外部修改监视与重载提示；编码自动检测。

### M3 编辑器 + 分栏同步（2~3 天）
- CodeMirror 6 源码编辑：行号、当前行高亮、括号/引号配对、列表自动续写、搜索替换。
- 分栏布局：单栏源码 / 单栏预览 / 分栏三态切换。
- **双向滚动同步**（基于 token.map → data-line 映射）。
- 保存：Ctrl+S、脏标记、原子写、另存为。
- 图片粘贴：自动复制到文档同目录 `./assets/` 并插入相对路径引用。

### M4 体验完善（1~2 天）
- 设置页：主题（明/暗/跟随系统 + 3 套阅读主题）、字号/行高、编辑器字体、导出选项；持久化到 store。
- 导出：HTML（内联 CSS + 字体离线可用的单文件）/ PDF（WebView2 打印 + 专用 print.css）。
- 快捷键体系 + 快捷工具栏；i18n（zh-CN / en）。

### M5 打磨发布（1 天）
- 应用图标、版本信息；NSIS 安装包 + `.md/.markdown` 文件关联注册。
- 基准测试对照目标（体积/启动/内存）；README；回归测试全绿。

**合计约 7~11 个专注开发日**。每个里程碑结束都是一个可运行、可验收的版本。

## 6. 目录结构

```
MarkDownReader/
├─ src-tauri/                  # Rust 壳
│  ├─ src/
│  │  ├─ main.rs / lib.rs      # 入口、单实例、文件关联参数处理
│  │  ├─ commands.rs           # read_file / save_file / export 等命令
│  │  └─ encoding.rs           # 编码检测与转换
│  ├─ tauri.conf.json          # 窗口、安全策略、文件关联、NSIS 配置
│  └─ icons/
├─ src/                        # 前端 (TS + React)
│  ├─ app/                     # 布局、面板、设置页、状态(Zustand)
│  ├─ editor/                  # CodeMirror 6 封装、行号映射、同步
│  ├─ renderer/                # 渲染管线（纯模块，不依赖 Tauri）
│  │  ├─ pipeline.ts           # markdown-it 实例与插件注册表
│  │  ├─ plugins/              # 自定义插件（TOC/容器/front-matter…）
│  │  └─ postprocess/          # Shiki / KaTeX / Mermaid 后处理
│  ├─ styles/                  # 主题变量、排版、打印样式
│  └─ ipc.ts                   # Rust 命令的类型化封装
├─ tests/
│  ├─ spec/                    # commonmark/gfm 规范测试
│  └─ fixtures/                # 扩展语法 + CJK 快照用例
└─ PLAN.md
```

## 7. 测试与验收标准

1. **规范符合性**：CI 中跑 commonmark spec 全部 652 例 + GFM 表格/删除线/任务列表/自动链接用例，100% 通过（markdown-it 锁定版本，自定义规则不得破坏）。
2. **快照测试**：每个扩展语法 + 中文边缘用例（嵌套列表、CJK 混排、转义 `\$\$`、HTML 混排）各有渲染快照，防止回归。
3. **性能基准**：1MB 文档渲染 < 100ms；空窗口内存 < 120MB；安装包 ≤ 15MB。
4. **人工验收清单**：双击 .md 直接打开、拖拽打开、明暗切换、公式/图表/高亮渲染、双向滚动同步、导出 HTML/PDF 可用。

## 8. 风险与对策

| 风险 | 对策 |
|---|---|
| Rust/MSVC 工具链安装复杂（VS Build Tools 约 2~4GB） | 一次性成本；用 `rustup` 默认 MSVC 目标 + winget 装 Build Tools，M0 内解决 |
| Mermaid/Shiki 拖慢首屏与包体 | 动态 import 懒加载，首次用到图表时才下载/加载，无图表文档零开销 |
| 大文件（>1MB）卡顿 | M3 内防抖全量渲染（实测够用）；虚拟/分块渲染列为 v1.1 |
| 用户机器缺 WebView2（Win10 老版本） | NSIS 安装器内置 bootstrapper 自动安装 |
| PDF 导出样式不一致 | 专用 print.css + WebView2 系统打印，M4 验收清单覆盖 |
| 自定义 markdown-it 规则破坏规范兼容 | 规范测试套件进 CI，任何规则改动必须全绿 |

## 9. 后续路线（v1.x 预留）

- 文件树侧栏 + 多标签页 + 全文搜索（Obsidian-lite 形态，架构已预留）。
- 导出 Word/图片长图；Vale 式文档统计（阅读时长）。
- Tauri 3.0 稳定后评估迁移；便携版（.zip 免安装）发行。
