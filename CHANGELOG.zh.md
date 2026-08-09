# 更新日志

[English](CHANGELOG.md) | **简体中文**

这是一个单文件项目，没有严格的语义化版本号，按变更时间记录。格式大致参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## 2026-08-09

### Changed
- 默认界面语言从中文改为英文：首次打开显示英文界面，`<html lang>` 与页面标题也一并改为英文。仍可通过右上角按钮切换回中文，之前存的数据不受影响。
- 补充项目文档：新增 `LICENSE`（MIT）、`PRIVACY.md`（隐私说明）、`CHANGELOG.md`（本文件）、`config.example.js`（API 配置参考，不会被自动加载）。
- 每份文档都补上了中文翻译（`README.zh.md`、`PRIVACY.zh.md`、`CHANGELOG.zh.md`），互相在顶部有语言切换链接。
- 调整了每份文档的默认语言：`README.md`、`PRIVACY.md`、`CHANGELOG.md` 现在是英文版（这样 GitHub 仓库主页默认渲染出来就是英文），中文版统一放在 `.zh.md` 后缀的文件里。
- README 标题下方加了一句开场白——"一个 HTML 文件，极简操作。"

## 2026-08-08

### Changed
- 导航从零散的状态变量（`view` / `origin` / `listFilter` / `openId` / `darkFlow`）重构为统一的导航栈（`push` / `pop` / `frame`），修复了部分返回路径的边界情况。
- 服务商名称、协议标签、跨域中转提示、接口报错文案全部补齐英文版本，切到英文界面时不再看到中文。
- 增加浅层词 / 深层构念中英字段防串位校验（`fixSurfaceWord` / `fixDeepTerm`），并对旧数据做一次性迁移，避免模型偶尔把中英字段整个填反。
- 浅层词数量从「必须凑满 10 个」放宽为 3–10 个，材料不够时不再强行凑数。
- 输入框支持回车发送、Shift+回车换行，并正确处理中文输入法组字过程和触屏软键盘，避免选字或误触发送。

### Fixed
- 修复了词云中偶尔混入「记得清楚」「表达清晰」等描述叙述行为本身（而不是当年那个人）的词的问题——现在的提示词明确区分「今天在讲述的人」和「故事里当时的人」，只保留后者的特性。

## 2026-08-08（迁移）

### Changed
- 项目从 Vite + React + Tailwind + `api/analyze.js` 服务端代理，整体迁移为不含构建步骤、不含服务端的单文件静态站点（`index.html`）。
- AI 接口调用改为浏览器直接向你在设置页配置的服务商发起请求，不再经过任何我们控制的服务器；`ANTHROPIC_API_KEY` 之类的服务端环境变量不再需要。
- 删除 `src/`、`api/`、`vite.config.js`、`tailwind.config.js`、`postcss.config.js`、`package.json`、`package-lock.json` 等构建期文件。
