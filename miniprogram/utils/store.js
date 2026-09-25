/* store.js —— 数据模型,跟网页版 index.html 里的存储/合并逻辑一一对应,只是把
   localStorage 换成小程序的 wx.getStorageSync / wx.setStorageSync。 */

const STORE = 'rememberme.v1';

const DEFAULTS = {
  entries: [], surface: [], deep: [], domains: [], lang: 'zh', seenIntro: false,
  settings: {
    provider: 'anthropic', protocol: 'anthropic', apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-5', temperature: 0.2, proxy: ''
  }
};

let D = load();
let previewMode = false;
let previewBackup = null;
let trash = null;

function clone(x) { return JSON.parse(JSON.stringify(x)); }

function load() {
  try {
    const raw = wx.getStorageSync(STORE);
    if (!raw) return clone(DEFAULTS);
    const base = clone(DEFAULTS);
    const merged = Object.assign(base, raw);
    merged.settings = Object.assign(base.settings, raw.settings || {});
    return merged;
  } catch (e) { return clone(DEFAULTS); }
}

function save() {
  if (previewMode) return;
  try { wx.setStorageSync(STORE, D); } catch (e) { /* 存储写满等极端情况,静默失败,内容还在内存里 */ }
}

function getD() { return D; }

/* ------------------------- 双语字段防串位 ------------------------- */
const hasCJK = x => /[一-鿿]/.test(String(x || ''));
function fixSurfaceWord(w) {
  if (!w) return w;
  if (w.keyword && w.en && !hasCJK(w.keyword) && hasCJK(w.en)) { const k = w.keyword; w.keyword = w.en; w.en = k; }
  return w;
}
function fixDeepTerm(d) {
  if (!d) return d;
  if (d.term && d.zh && hasCJK(d.term) && !hasCJK(d.zh)) { const x = d.term; d.term = d.zh; d.zh = x; }
  return d;
}
function migrateLangFields() {
  if (D.langFixedAt) return;
  D.surface.forEach(fixSurfaceWord);
  D.deep.forEach(fixDeepTerm);
  D.langFixedAt = Date.now();
  save();
}
function migrateDomainSources() {
  if (D.domainsFixedAt) return;
  D.domains.forEach(d => { if (!d.sources) d.sources = []; });
  D.domainsFixedAt = Date.now();
  save();
}

/* ------------------------- 合并逻辑 ------------------------- */
function scoreOf(sum, weight) {
  const avg = (sum || 50) / weight;
  return Math.min(100, Math.round(avg * (1 + 0.16 * (weight - 1))));
}
const uniqIds = src => Array.from(new Set((src || []).map(x => x.entryId)));

function mergeProfile(entryId, r) {
  (r.surface || []).forEach(s => {
    if (!s || !s.keyword) return;
    fixSurfaceWord(s);
    const key = String(s.keyword).trim();
    const hit = D.surface.find(k => k.keyword === key);
    if (hit) {
      hit.weight += 1;
      if (s.en && !hit.en) hit.en = s.en;
      hit.sources.push({ entryId, evidence: s.evidence || '' });
    } else {
      D.surface.push({ keyword: key, en: s.en || key, weight: 1, sources: [{ entryId, evidence: s.evidence || '' }] });
    }
  });

  const DOMAINS = require('./i18n').DOMAINS;
  (r.deep || []).forEach(s => {
    if (!s || !s.term) return;
    fixDeepTerm(s);
    const term = String(s.term).trim();
    const st = Math.max(0, Math.min(100, Number(s.strength) || 50));
    const hit = D.deep.find(d => d.term === term);
    if (hit) {
      hit.weight += 1; hit.strengthSum = (hit.strengthSum || 50) + st;
      if (s.zh && !hit.zh) hit.zh = s.zh;
      hit.sources.push({ entryId, evidence: s.evidence || '', strength: st });
    } else {
      D.deep.push({ term, zh: s.zh || '', weight: 1, strengthSum: st, sources: [{ entryId, evidence: s.evidence || '', strength: st }] });
    }
  });
  D.deep.forEach(d => d.score = scoreOf(d.strengthSum, d.weight));

  (r.domains || []).forEach(s => {
    if (!s || !s.name) return;
    const name = String(s.name).trim();
    if (!DOMAINS[name]) return;
    const st = Math.max(0, Math.min(100, Number(s.strength) || 50));
    const hit = D.domains.find(d => d.name === name);
    if (hit) { hit.weight += 1; hit.strengthSum = (hit.strengthSum || 50) + st; (hit.sources = hit.sources || []).push({ entryId, strength: st }); }
    else { D.domains.push({ name, weight: 1, strengthSum: st, sources: [{ entryId, strength: st }] }); }
  });
  D.domains.forEach(d => d.score = scoreOf(d.strengthSum, d.weight));

  D.surface.sort((a, b) => b.weight - a.weight);
  D.deep.sort((a, b) => (b.score || 0) - (a.score || 0));
  D.domains.sort((a, b) => (b.score || 0) - (a.score || 0));
}

function unmergeWeighted(list, entryId) {
  return list.filter(item => {
    const removed = (item.sources || []).filter(s => s.entryId === entryId);
    if (!removed.length) return true;
    item.sources = item.sources.filter(s => s.entryId !== entryId);
    const avgFallback = item.weight ? (item.strengthSum || 0) / item.weight : 0;
    const removedStrength = removed.reduce((sum, s) => sum + (typeof s.strength === 'number' ? s.strength : avgFallback), 0);
    item.weight -= removed.length;
    item.strengthSum = Math.max(0, (item.strengthSum || 0) - removedStrength);
    if (item.weight > 0) item.score = scoreOf(item.strengthSum, item.weight);
    return item.weight > 0 && item.sources.length > 0;
  });
}

function deleteEntry(id) {
  const idx = D.entries.findIndex(e => e.id === id);
  if (idx < 0) return;
  trash = clone(D);
  D.entries.splice(idx, 1);

  D.surface = D.surface.filter(w => {
    const before = w.sources.length;
    w.sources = w.sources.filter(s => s.entryId !== id);
    const removed = before - w.sources.length;
    if (!removed) return true;
    w.weight -= removed;
    return w.weight > 0 && w.sources.length > 0;
  });
  D.deep = unmergeWeighted(D.deep, id);
  D.domains = unmergeWeighted(D.domains, id);

  D.surface.sort((a, b) => b.weight - a.weight);
  D.deep.sort((a, b) => (b.score || 0) - (a.score || 0));
  D.domains.sort((a, b) => (b.score || 0) - (a.score || 0));
  save();
}

function undoDelete() {
  if (!trash) return;
  D = trash; trash = null;
  save();
}
function hasTrash() { return !!trash; }

function wipeEntries() {
  const keep = D.settings, lang = D.lang;
  D = clone(DEFAULTS); D.settings = keep; D.lang = lang;
  save();
}
function wipeAll() {
  const keep = D.settings;
  D = clone(DEFAULTS); D.settings = keep;
  save();
}

/* ------------------------- 示例数据 / 预览模式 -------------------------
   跟网页版一样:临时把 D 换成一份手写的、结构和真实合并结果完全一致的假数据,
   不经过 save()——previewMode 打开时 save() 直接短路。 */
function buildSampleD() {
  const now = Date.now(), day = 86400000;
  const mk = (id, text, replyZh, replyEn, daysAgo) =>
    ({ id, text, at: now - daysAgo * day, event: null, safety: 'none', replyZh, replyEn });

  const entries = [
    mk('d1', '转学第一天,谁都不认识,自己在操场边坐了一整节课间。',
      '那天你没有硬挤进任何一群人,而是先坐下来看清楚状况——这不是怯懦,是你应对陌生环境的方式:先观察,再决定要不要靠近。这个习惯后来一直都在。',
      "You didn't force your way into a group that day — you sat down and watched first. That's not timidity, it's how you handle unfamiliar situations: observe before deciding whether to get closer. The habit stuck.", 210),
    mk('d2', '答应帮同事带饭,那天自己其实特别忙,还是绕路去买了。',
      '明明自己那天顾不过来,你还是把答应过的事情做到了。这种说到做到,不是理所应当,是你一直在主动扛的东西。',
      "You were clearly stretched thin that day, and you still followed through on what you'd promised. Keeping your word like that isn't a given — it's something you actively carry.", 178),
    mk('d3', '在会议上被当众指出错误,当场脸红了,但还是把剩下的汇报讲完了。',
      '脸红说明那一下真的扎到你了,但你没有找借口提前结束——把剩下的讲完,这需要比看上去更多的定力。',
      "Blushing means it actually stung. But you didn't cut the presentation short to escape it — finishing it took more composure than it looked like from outside.", 151),
    mk('d4', '工作上卡住的时候,会先自己查很久资料,不太习惯第一时间开口求助。',
      "你把'自己先试'当成默认选项,这让你解决问题的能力很扎实,但也可能让你在真正需要帮忙的时候,拖了太久才开口。",
      "Your default is to try it yourself first. That's built you real problem-solving muscle — but it may also mean you wait too long to ask when you genuinely need help.", 122),
    mk('d5', '朋友出事的时候,会比自己遇到事更上心,熬夜帮忙想办法。',
      '别人的事你会更用力地去扛,这是你在乎人的方式。但也可以问问自己:轮到你需要人扛一下的时候,你会不会也这样对自己?',
      "You show up harder for other people's problems than your own — that's how you love people. Worth asking, though: when it's your turn to need carrying, do you extend yourself the same effort?", 96),
    mk('d6', '很少主动说自己过得好不好,更习惯先问别人。',
      '把话题先转向别人,是一种很熟练的自我保护——不用先暴露自己。但这也意味着,想真正了解你的人,得自己先问出口才行。',
      "Turning the conversation toward someone else first is a well-practiced kind of self-protection — you don't have to expose yourself first. It also means anyone who wants to know you has to be the one to ask.", 61),
    mk('d7', '计划被临时打乱的时候,表面很冷静,其实心里已经在重新排列所有步骤。',
      '外面看起来毫无波澜,脑子里其实已经在飞速重新规划——这种冷静不是没感觉,是你处理不确定性的方式已经练得很快了。',
      "It looks unruffled from the outside, but your mind is already re-sequencing everything. That calm isn't the absence of a reaction — it's how fast you've learned to process uncertainty.", 30),
    mk('d8', '犯错之后,会反复回想很久,比别人指出来的还严厉。',
      '别人可能早就翻篇了,你自己还在反复审判自己。这种自我要求让你很少懈怠,但代价是你对自己,常常比对别人更狠。',
      "Other people may have already moved on, but you're still re-trying the case against yourself. That standard keeps you from coasting — at the cost of being harder on yourself than you'd ever be on someone else.", 6)
  ];

  const surface = [
    { keyword: '谨慎', en: 'cautious', in: ['d1', 'd4', 'd7'] },
    { keyword: '独立', en: 'self-reliant', in: ['d1', 'd4'] },
    { keyword: '内敛', en: 'reserved', in: ['d1', 'd6'] },
    { keyword: '守信', en: 'reliable', in: ['d2'] },
    { keyword: '责任心强', en: 'dependable', in: ['d2', 'd5'] },
    { keyword: '敏感', en: 'sensitive', in: ['d3'] },
    { keyword: '冷静', en: 'composed', in: ['d3', 'd7'] },
    { keyword: '体贴', en: 'considerate', in: ['d5'] },
    { keyword: '隐忍', en: 'self-restrained', in: ['d6', 'd8'] },
    { keyword: '自我苛责', en: 'self-critical', in: ['d8'] }
  ].map(w => ({ keyword: w.keyword, en: w.en, weight: w.in.length, sources: w.in.map(id => ({ entryId: id, evidence: '' })) }))
   .sort((a, b) => b.weight - a.weight);

  const deep = [
    { term: 'Emotional Suppression', zh: '情绪抑制', in: [['d3', 70], ['d6', 65], ['d8', 68]] },
    { term: 'Avoidant Coping', zh: '回避型应对', in: [['d1', 65], ['d4', 60]] },
    { term: 'Conditional Self-Worth', zh: '条件性自我价值', in: [['d2', 55], ['d5', 60]] },
    { term: 'Hypervigilance', zh: '高度警觉', in: [['d7', 60]] }
  ].map(d => {
    const weight = d.in.length, strengthSum = d.in.reduce((s, p) => s + p[1], 0);
    return { term: d.term, zh: d.zh, weight, strengthSum, score: scoreOf(strengthSum, weight),
      sources: d.in.map(p => ({ entryId: p[0], evidence: '', strength: p[1] })) };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  const domains = [
    { name: '情绪调节困难方向', in: [['d6', 55], ['d7', 50]] },
    { name: '羞耻与自我否定方向', in: [['d3', 50], ['d8', 55]] }
  ].map(d => {
    const weight = d.in.length, strengthSum = d.in.reduce((s, p) => s + p[1], 0);
    return { name: d.name, weight, strengthSum, score: scoreOf(strengthSum, weight),
      sources: d.in.map(p => ({ entryId: p[0], strength: p[1] })) };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  const base = clone(DEFAULTS);
  base.entries = entries; base.surface = surface; base.deep = deep; base.domains = domains;
  base.lang = D.lang; base.seenIntro = true; base.langFixedAt = Date.now(); base.domainsFixedAt = Date.now();
  return base;
}

function enterDemo() {
  previewBackup = D;
  D = buildSampleD();
  previewMode = true;
}
function exitDemo() {
  if (!previewMode) return;
  D = previewBackup; previewBackup = null; previewMode = false;
}
function isPreview() { return previewMode; }

/* ------------------------- 词云条目 ------------------------- */
function surfaceItems() {
  return D.surface.map(w => {
    const ids = uniqIds(w.sources);
    return { key: w.keyword, label: D.lang === 'en' ? (w.en || w.keyword) : w.keyword, weight: w.weight, count: ids.length, ids };
  });
}
function deepItems() {
  return D.deep.map(d => {
    const ids = uniqIds(d.sources);
    return { key: d.term, label: D.lang === 'en' ? d.term : (d.zh || d.term), weight: d.weight, count: ids.length, ids };
  });
}

/* ------------------------- 页面间传筛选条件 -------------------------
   点词云进记忆清单时,要带的是一串 entryId,放 URL query 里太长也不稳妥,
   干脆放模块内存里,清单页 onLoad 时直接读。只活一次跳转,不落盘。 */
let pendingFilter = null;
function setFilter(label, ids, dark) { pendingFilter = { label, ids, dark: !!dark }; }
function takeFilter() { const f = pendingFilter; pendingFilter = null; return f; }

module.exports = {
  STORE, DEFAULTS, getD, save, clone,
  migrateLangFields, migrateDomainSources, fixSurfaceWord, fixDeepTerm,
  scoreOf, uniqIds, mergeProfile, deleteEntry, undoDelete, hasTrash,
  wipeEntries, wipeAll, enterDemo, exitDemo, isPreview,
  surfaceItems, deepItems, setFilter, takeFilter
};
