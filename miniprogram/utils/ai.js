/* ai.js —— 跟网页版 index.html 里的 askAI() 逻辑一一对应,把 fetch 换成 wx.request。
   小程序没有 CORS 这回事,但有自己的限制:request 的域名必须先加进小程序后台的
   "服务器域名白名单",否则请求会在离开小程序之前就被平台拦掉——不是 Key 错了,
   也不是网络问题,是这一步没配。 */

const { getD, save } = require('./store');
const { t } = require('./i18n');

function keyRequired() {
  const base = getD().settings.baseUrl || '';
  return !/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(base);
}
function applyProxy(url) {
  const px = (getD().settings.proxy || '').trim();
  if (!px) return url;
  return px.includes('{url}') ? px.replace('{url}', encodeURIComponent(url)) : px.replace(/\/+$/, '') + '/' + url;
}
function configured() {
  const s = getD().settings;
  return !!(s.baseUrl && s.model && (s.apiKey || !keyRequired()));
}

function wxRequest(opts) {
  return new Promise((resolve, reject) => {
    wx.request(Object.assign({}, opts, {
      success: res => resolve(res),
      fail: err => reject(new Error(err.errMsg || 'request failed'))
    }));
  });
}

async function askAI(prompt, retry) {
  const D = getD();
  const s = D.settings, proto = s.protocol || 'openai';
  const T_ = t(D.lang);
  const base = (s.baseUrl || '').replace(/\/+$/, '');
  if (!s.apiKey && keyRequired()) throw new Error(T_.errNoKey);
  if (!base) throw new Error(T_.errNoBase);
  if (!s.model) throw new Error(T_.errNoModel);
  const temp = +s.temperature || 0.2;
  let url, header, data;

  if (proto === 'anthropic') {
    url = base + '/messages';
    header = { 'Content-Type': 'application/json', 'x-api-key': s.apiKey,
      'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
    data = { model: s.model, max_tokens: 1500, temperature: temp, messages: [{ role: 'user', content: prompt }] };
  } else if (proto === 'gemini') {
    url = base + '/models/' + encodeURIComponent(s.model) + ':generateContent?key=' + encodeURIComponent(s.apiKey);
    header = { 'Content-Type': 'application/json' };
    data = { contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: temp, responseMimeType: 'application/json' } };
  } else {
    url = base + '/chat/completions';
    header = { 'Content-Type': 'application/json' };
    if (s.apiKey) header['Authorization'] = 'Bearer ' + s.apiKey;
    data = { model: s.model, temperature: temp, messages: [{ role: 'user', content: prompt }] };
    if (!retry) data.response_format = { type: 'json_object' };
  }

  let res;
  try {
    res = await wxRequest({ url: applyProxy(url), method: 'POST', header, data, dataType: 'json', timeout: 60000 });
  } catch (e) {
    throw new Error(T_.errNetwork(e.message));
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    if (proto === 'openai' && !retry && (res.statusCode === 400 || res.statusCode === 422)) return askAI(prompt, true);
    let msg = res.data;
    try { const j = typeof res.data === 'string' ? JSON.parse(res.data) : res.data; msg = (j.error && (j.error.message || j.error.type)) || j.message || JSON.stringify(j); } catch (e) {}
    throw new Error(T_.errUpstream(res.statusCode, String(msg).slice(0, 200)));
  }
  const j = res.data;
  if (proto === 'anthropic') return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  if (proto === 'gemini') {
    const c = (j.candidates || [])[0];
    return c ? ((c.content && c.content.parts || []).map(x => x.text || '').join('')) : '';
  }
  const m = j.choices && j.choices[0] && j.choices[0].message;
  return (m && (typeof m.content === 'string' ? m.content : (m.content || []).map(x => x.text || '').join(''))) || '';
}

function parseJSON(raw) {
  let x = String(raw).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = x.indexOf('{'), b = x.lastIndexOf('}');
  if (a < 0 || b < 0) throw new Error('parse');
  return JSON.parse(x.slice(a, b + 1));
}

function profileDigest(p) {
  const surface = p.surface.slice(0, 12).map(k => `${k.keyword}(${k.weight})`).join('、');
  const deep = p.deep.slice(0, 12).map(d => `${d.term}(${d.weight})`).join('、');
  const recent = p.entries.slice(-4).map(en => `- ${en.text.slice(0, 60)}`).join('\n');
  return `已有表层关键词:${surface || '无'}\n已有深层构念:${deep || '无'}\n最近的记忆:\n${recent || '无'}`;
}

let translating = false;
async function ensureTranslations() {
  const D = getD();
  if (translating || !configured()) return false;
  const needEn = D.surface.filter(w => !w.en || w.en === w.keyword).map(w => w.keyword);
  const needZh = D.deep.filter(d => !d.zh).map(d => d.term);
  if (!needEn.length && !needZh.length) return false;
  translating = true;
  const { TRANSLATE_PROMPT } = require('./prompts');
  try {
    const r = parseJSON(await askAI(TRANSLATE_PROMPT(needEn, needZh)));
    D.surface.forEach(w => { if (r.surface && r.surface[w.keyword]) w.en = r.surface[w.keyword]; });
    D.deep.forEach(d => { if (r.deep && r.deep[d.term]) d.zh = r.deep[d.term]; });
    save();
    translating = false;
    return true;
  } catch (e) { translating = false; return false; }
}

module.exports = { keyRequired, configured, askAI, parseJSON, profileDigest, ensureTranslations };
