/**
 * config.example.js — API 配置参考,不是会被自动加载的文件
 * =========================================================
 *
 * 重要:index.html 是一个零依赖的单文件应用,不会在运行时读取、
 * 加载或 import 这个文件。它只是把「设置页里能填的字段」以及
 * 「当前支持哪些服务商、各自的默认地址/模型」写成一份可读的参考,
 * 方便你在填设置页之前先看一眼,或者对照检查导出的 JSON。
 *
 * 真正生效的配置只有两个入口:
 *   1. 长按首页标题 1.2 秒 → 设置页 → 手动填写并保存(存进浏览器 localStorage)
 *   2. 设置页里的「导入 JSON」,把之前导出的存档(含 settings 字段)整个导入回来
 *
 * 不要把真实的 API Key 写进这个文件再提交到仓库——这个文件会被
 * git 追踪、会被发布,任何人拿到仓库都能看到。如果你想在本地写一份
 * 带着真实 Key 的备份供自己参考,请另存为不会被提交的文件名
 * (比如 config.local.js),或者直接用设置页的「导出 JSON」功能。
 */

// 设置页保存后,实际写入 localStorage 的结构长这样:
const exampleSettings = {
  provider: "anthropic",      // 见下面 PROVIDERS 列表里的 id
  protocol: "anthropic",      // "anthropic" | "gemini" | "openai"(OpenAI 兼容)
  apiKey: "",                 // 不要在这个文件里填真实值
  baseUrl: "https://api.anthropic.com/v1",
  model: "claude-sonnet-4-5",
  temperature: 0.2,           // 0-1,越低越保守
  proxy: ""                   // 跨域中转地址,官方接口不允许浏览器直连时才需要
};

// 当前设置页内置的服务商列表(节选自 index.html 里的 PROVIDERS 常量,
// 完整定义、每个服务商是否需要跨域中转,以准确的 index.html 为准):
const PROVIDERS_REFERENCE = [
  { id: "anthropic",   protocol: "anthropic", baseUrl: "https://api.anthropic.com/v1",                          cors: "浏览器可直连" },
  { id: "gemini",      protocol: "gemini",    baseUrl: "https://generativelanguage.googleapis.com/v1beta",      cors: "浏览器可直连" },
  { id: "openrouter",  protocol: "openai",    baseUrl: "https://openrouter.ai/api/v1",                          cors: "浏览器可直连" },
  { id: "openai",      protocol: "openai",    baseUrl: "https://api.openai.com/v1",                             cors: "不一定,失败就填中转" },
  { id: "groq",        protocol: "openai",    baseUrl: "https://api.groq.com/openai/v1",                        cors: "不一定,失败就填中转" },
  { id: "siliconflow", protocol: "openai",    baseUrl: "https://api.siliconflow.cn/v1",                         cors: "不一定,失败就填中转" },
  { id: "deepseek",    protocol: "openai",    baseUrl: "https://api.deepseek.com/v1",                           cors: "必须填中转" },
  { id: "moonshot",    protocol: "openai",    baseUrl: "https://api.moonshot.cn/v1",                            cors: "必须填中转" },
  { id: "zhipu",       protocol: "openai",    baseUrl: "https://open.bigmodel.cn/api/paas/v4",                  cors: "必须填中转" },
  { id: "qwen",        protocol: "openai",    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",     cors: "必须填中转" },
  { id: "ollama",      protocol: "openai",    baseUrl: "http://localhost:11434/v1",                             cors: "本地,需 OLLAMA_ORIGINS=*" },
  { id: "lmstudio",    protocol: "openai",    baseUrl: "http://localhost:1234/v1",                              cors: "本地,需在设置里开 CORS" },
  { id: "custom",      protocol: "openai",    baseUrl: "",                                                      cors: "视你的中转而定" }
];
