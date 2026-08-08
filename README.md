# 我是谁 · Self Archaeology

一次一句话地说出记忆碎片，Claude 实时把它们整理成结构化的自我地图：浅层的日常性格词、深层的心理学构念，以及积累到一定数量后可以按住词云解锁的方向标签。所有分析都在服务端完成，浏览器里永远不会出现你的 API Key。

## 功能

- **双语**：右上角一个按钮在中英文之间切换，界面文案、词云、记忆清单全部跟着切。浅层词按中文 `keyword` 累积、深层构念按英文 `term` 累积，切语言不会把同一个词拆成两条；旧档案里缺另一种语言的词，会在页面打开后自动请求一次翻译补齐，写回本地存储，每个词只翻一次。
- **我1（浅层）**：白底词云，每条记忆分析恰好给出 10 个日常向关键词，字号按出现频次变化。悬停某个词时其余词淡出，光标旁跟随显示这个词来自几条记忆；点击进入被这个词筛选过的记忆清单。
- **我2（深层）**：整页黑底白字，词云是心理学构念。攒够 8 条记忆后，在词云上长按约 1.2 秒会浮出一排"值得关注的方向"标签（带"非确诊"标注）；从我2 点词进入的记忆清单和详情页也保持黑底。
- **记忆清单与详情**：首页的"已找回 N 个记忆"可点开完整清单（按时间倒序）；点某条记忆能看到原话、时间/年龄阶段/相关人物，以及这条记忆当时贡献的具体浅层词和深层构念。
- **危机分支**：识别到自伤/自杀等严重信号时跳过关键词提取，只显示关心文案，不做画像。

## 本地运行

```bash
npm install
cp .env.example .env
# 编辑 .env，填入你自己的 Anthropic API Key
```

这个项目的前端是纯 Vite（`npm run dev`），但分析请求要打到 `api/analyze.js` 这个 Vercel serverless function。本地联调有两种方式：

- **推荐：用 Vercel CLI** —— `npx vercel dev`，它会同时跑起前端和 `api/` 下的函数，行为和线上一致。
- 只用 `npm run dev`（纯 Vite）也能看到界面，但 `/api/analyze` 请求会 404，因为 Vite 本身不处理 `api/` 目录。

## 配置 API Key

- 复制 `.env.example` 为 `.env`，填入 `ANTHROPIC_API_KEY=sk-ant-...`
- `.env` 已经被 `.gitignore` 忽略，不会被提交到仓库
- Key 只在 `api/analyze.js`（服务端）里被读取；前端代码、浏览器网络面板、git 历史里都不会出现它

## 部署到 Vercel

1. 在 Vercel 里 Import 这个 GitHub 仓库
2. Vercel 会自动识别出 Vite 前端项目，以及 `api/` 目录下的 serverless 函数
3. 项目设置 → Environment Variables，添加 `ANTHROPIC_API_KEY`（值是你的真实 key）
4. 部署即可，`/api/analyze` 会作为无服务器函数自动运行，负责代理 Anthropic 的 `/v1/messages` 接口

## 技术栈

- Vite + React 18 + Tailwind CSS，图标用 `lucide-react`
- `src/lib/storage.js`：用 `localStorage` 实现的存储层，接口和签名对齐 Claude artifact 环境里的 `window.storage`，组件调用点不用改
- `api/analyze.js`：Vercel serverless function，服务端持有 `ANTHROPIC_API_KEY`，代理转发到 Anthropic 的 Messages API（`claude-sonnet-4-6`），把响应原样返回给前端
