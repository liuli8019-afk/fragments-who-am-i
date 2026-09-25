/* i18n.js —— 文案表,内容和网页版 index.html 里的 T / DOMAINS / PROVIDERS 等常量逐字对应。 */

const T = {
  zh: {
    title: '我是谁?', subtitle: '说出一件想起来的事。一句也行,不用完整,不用按顺序。',
    placeholder: '我小时候经常害怕犯错……', me1: '我1', me2: '我2',
    surfaceLabel: '浅层', deepLabel: '深层', merged: '已并入你的地图', analysisLabel: '分析',
    del: '删除', deleted: '已删除', undo: '撤销',
    countZero: '还没有找回记忆', count: n => `已找回 ${n} 个记忆`,
    clear: '清空', clearWarn: '清空后无法恢复。', clearYes: '确认清空', clearNo: '取消',
    back: '返回', empty: '这里还是空的。回到首页,说一件想起来的事。',
    notDiagnosis: '非确诊', fromN: n => `${n} 个记忆`,
    errAnalyze: '分析没有完成。再发一次,或者把这段话说得短一点。',
    errSave: '这次没能存进档案,内容还在屏幕上。',
    noConfig: '还没有配置接口。去设置页配置一下。',
    crisis: '这里只做记录和整理,处理不了此刻的重量。如果你正处在危险中,请联系当地紧急服务,或身边任何一个你还愿意打电话的人。',
    introTitle: '开始之前',
    introBody: [
      '这里生成的词和标签,是基于你写下的内容做的模式描述——不是诊断,也不代表你有任何疾病。',
      '所有数据只保存在这台设备上,不会被上传、不会被我们看到。',
      '如果你最近很难受,这个工具能帮你整理,但接不住那份重量——建议找一个信任的人聊聊,或寻求专业支持。'
    ],
    introOk: '我知道了,继续',
    deepFooter: '以上是基于你写下的内容做的可能的模式描述,不是诊断。数据只留在这台设备上。如果最近很难受,建议找信任的人聊聊或者寻求专业的帮助。',
    seeDemo: '想先看看效果？查看示例 →',
    previewLabel: '示例数据', previewExit: '退出预览',
    previewLocked: '这是示例数据,退出预览后才能操作真实记录。',
    locale: 'zh', other: 'EN',
    setConn: 'AI 接口', setProvider: '服务商', setProto: '接口协议',
    setBase: '接口地址(Base URL,不用带 /chat/completions)', setModel: '模型',
    setTemp: '温度(越低越保守,推荐 0.2)', setProxy: '跨域中转(可选)',
    setKey: 'API Key', setKeyOpt: 'API Key(本地模型可以留空)',
    errNoKey: '还没有配置 API Key', errNoBase: '还没有填写接口地址', errNoModel: '还没有填写模型名称',
    errNetwork: m => `请求没有发出去(${m})。检查一下这个域名有没有加进小程序后台的服务器域名白名单。`,
    errUpstream: (code, msg) => `接口返回 ${code}:${msg}`,
    setSave: '保存', setTest: '测试连接', setTesting: '测试中……', setOk: '连接正常。',
    setIntro: '任何大模型接口都可以用。Key 只保存在这台设备上,不会发给第三方。',
    setData: '数据', setExport: '导出 JSON', setImport: '导入 JSON', setWipe: '清空全部数据',
    setRules: '边界', setDone: '已保存。',
    proxyPh: '接口不支持直连时,填一个中转地址',
    importFail: '文件读不出来',
    domainWhitelist: '第一次用某个服务商之前,记得去小程序管理后台 → 开发管理 → 服务器域名,把它的接口地址加进"request合法域名"列表,否则请求会被小程序直接拦掉。',
    rules: ['只整理你说过的内容,不补写、不推测你没讲的经历。',
      '浅层词描述故事里当时的那个人,好听的和不好听的都给。',
      '深层构念是描述性的心理学概念,不是疾病名称。',
      '方向那一排是模式描述,不是诊断,也不代表你有任何疾病。',
      '这不是医疗器械,不提供诊断、评估或治疗建议。'],
    stat: e => `记忆 ${e.entries.length} · 浅层词 ${e.surface.length} · 深层构念 ${e.deep.length}`
  },
  en: {
    title: 'Who am I?', subtitle: "Say one thing you remember. A sentence is enough — it doesn't have to be complete or in order.",
    placeholder: 'As a kid I was always afraid of getting things wrong…', me1: 'Me 1', me2: 'Me 2',
    surfaceLabel: 'Surface', deepLabel: 'Deep', merged: 'Added to your map', analysisLabel: 'Analysis',
    del: 'Delete', deleted: 'Deleted', undo: 'Undo',
    countZero: 'No memories yet', count: n => `${n} ${n === 1 ? 'memory' : 'memories'} recovered`,
    clear: 'Clear', clearWarn: "This can't be undone.", clearYes: 'Clear it', clearNo: 'Cancel',
    back: 'Back', empty: 'Nothing here yet. Go back and say something you remember.',
    notDiagnosis: 'Not a diagnosis', fromN: n => `${n} ${n === 1 ? 'memory' : 'memories'}`,
    errAnalyze: "The analysis didn't finish. Send it again, or make it shorter.",
    errSave: "That didn't save. It's still on screen.",
    noConfig: 'No API configured yet. Go to Settings to set one up.',
    crisis: "This place only records and sorts. It can't carry what you're holding right now. If you're in danger, contact your local emergency services, or anyone you'd still be willing to call.",
    introTitle: 'Before you start',
    introBody: [
      'The words and labels generated here are pattern descriptions based on what you write — not a diagnosis, and not a claim that you have any condition.',
      'All data stays on this device. Nothing is uploaded, and we never see it.',
      "If you've been having a hard time lately, this tool can help you organize your thoughts, but it can't carry that weight — please talk to someone you trust, or reach out for professional support."
    ],
    introOk: 'I understand, continue',
    deepFooter: 'The above is a possible pattern description based on what you wrote, not a diagnosis. Data stays on this device only. If things have been hard lately, please talk to someone you trust or seek professional support.',
    seeDemo: 'Curious what this looks like? See an example →',
    previewLabel: 'Example data', previewExit: 'Exit preview',
    previewLocked: 'This is example data — exit preview to work with your real records.',
    locale: 'en', other: '中',
    setConn: 'AI connection', setProvider: 'Provider', setProto: 'Protocol',
    setBase: 'Base URL (no /chat/completions)', setModel: 'Model',
    setTemp: 'Temperature (lower is safer, 0.2 recommended)', setProxy: 'CORS proxy (optional)',
    setKey: 'API key', setKeyOpt: 'API key (optional for local models)',
    errNoKey: 'No API key configured yet', errNoBase: 'Base URL is empty', errNoModel: 'Model name is empty',
    errNetwork: m => `The request never went out (${m}). Check whether this domain is in the mini program's server-domain whitelist.`,
    errUpstream: (code, msg) => `Endpoint returned ${code}: ${msg}`,
    setSave: 'Save', setTest: 'Test', setTesting: 'Testing…', setOk: 'Connection works.',
    setIntro: 'Any model endpoint works. The key is stored only on this device, never sent anywhere else.',
    setData: 'Data', setExport: 'Export JSON', setImport: 'Import JSON', setWipe: 'Erase everything',
    setRules: 'Boundaries', setDone: 'Saved.',
    proxyPh: 'If the endpoint blocks direct calls, put a relay URL here',
    importFail: "That file couldn't be read",
    domainWhitelist: "Before using a provider for the first time, add its API domain to the mini program admin console → Development → Server Domains → request whitelist, or every request will be blocked by the platform itself.",
    rules: ['Only organises what you actually said. Nothing is inferred or filled in.',
      'Surface words describe the person in that story, flattering or not.',
      'Deep terms are descriptive psychological constructs, not illness names.',
      'The bottom row is pattern description, not a diagnosis.',
      'This is not a medical device, and does not provide diagnosis, assessment, or treatment advice.'],
    stat: e => `${e.entries.length} memories · ${e.surface.length} surface · ${e.deep.length} deep`
  }
};

const DOMAINS = {
  创伤后应激方向: 'Post-traumatic stress',
  抑郁情绪方向: 'Depressive mood',
  焦虑与过度警觉方向: 'Anxiety and hypervigilance',
  社交回避方向: 'Social avoidance',
  强迫倾向方向: 'Obsessive-compulsive tendency',
  解离方向: 'Dissociation',
  情绪调节困难方向: 'Emotion dysregulation',
  依恋不安全方向: 'Insecure attachment',
  羞耻与自我否定方向: 'Shame and self-negation',
  躯体化与睡眠方向: 'Somatization and sleep',
  人际信任受损方向: 'Impaired interpersonal trust',
  注意力困难方向: 'Attention difficulty'
};

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic Claude', nameEn: 'Anthropic Claude', proto: 'anthropic', base: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-5' },
  { id: 'gemini', name: 'Google Gemini', nameEn: 'Google Gemini', proto: 'gemini', base: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.0-flash' },
  { id: 'openrouter', name: 'OpenRouter', nameEn: 'OpenRouter', proto: 'openai', base: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { id: 'openai', name: 'OpenAI', nameEn: 'OpenAI', proto: 'openai', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { id: 'deepseek', name: 'DeepSeek 深度求索', nameEn: 'DeepSeek', proto: 'openai', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { id: 'moonshot', name: 'Moonshot Kimi', nameEn: 'Moonshot Kimi', proto: 'openai', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { id: 'zhipu', name: '智谱 GLM', nameEn: 'Zhipu GLM', proto: 'openai', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { id: 'qwen', name: '阿里通义千问', nameEn: 'Alibaba Qwen', proto: 'openai', base: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { id: 'custom', name: '自定义接口 / 中转', nameEn: 'Custom endpoint / relay', proto: 'openai', base: '', model: '' }
];
const PROTO_NAME = {
  zh: { openai: 'OpenAI 兼容(/chat/completions)', anthropic: 'Anthropic(/messages)', gemini: 'Gemini(:generateContent)' },
  en: { openai: 'OpenAI compatible (/chat/completions)', anthropic: 'Anthropic (/messages)', gemini: 'Gemini (:generateContent)' }
};

function t(lang) { return T[lang] || T.zh; }

module.exports = { T, DOMAINS, PROVIDERS, PROTO_NAME, t };
