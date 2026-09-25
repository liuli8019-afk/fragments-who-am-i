const store = require('../../utils/store.js');
const { t } = require('../../utils/i18n.js');
const ai = require('../../utils/ai.js');
const { INGEST_PROMPT } = require('../../utils/prompts.js');

Page({
  data: {
    T: {}, dark: false,
    entryCount: 0, showDemoLink: false, previewMode: false,
    text: '', busy: false, err: '',
    reply: null,
    confirmReset: false,
    showIntro: false
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const D = store.getD();
    const T_ = t(D.lang);
    // T_.count 是函数,直接塞进 data 传不过逻辑层/渲染层之间那道 setData 的 JSON 桥
    // (函数会被静默丢弃)——WXML 里不能写 {{T.count(x)}},得在这边先算成字符串。
    this.setData({
      T: T_,
      countText: T_.count(D.entries.length),
      entryCount: D.entries.length,
      showDemoLink: D.entries.length === 0 && !store.isPreview(),
      previewMode: store.isPreview(),
      showIntro: !D.seenIntro
    });
  },

  toggleLang() {
    const D = store.getD();
    D.lang = D.lang === 'zh' ? 'en' : 'zh';
    store.save();
    this.refresh();
    ai.ensureTranslations().then(ok => { if (ok) this.refresh(); });
  },

  onInput(e) { this.setData({ text: e.detail.value }); },

  async submit() {
    const D = store.getD();
    const T_ = t(D.lang);
    const v = (this.data.text || '').trim();
    if (!v || this.data.busy) return;
    if (store.isPreview()) { this.setData({ err: T_.previewLocked }); return; }
    if (!ai.configured()) { this.setData({ err: T_.noConfig }); return; }
    this.setData({ busy: true, err: '', reply: null });

    try {
      const raw = await ai.askAI(INGEST_PROMPT(v, ai.profileDigest(D), D.lang));
      const r = ai.parseJSON(raw);
      let replyZh = r.replyZh || '', replyEn = r.replyEn || '';
      if (!replyZh && !replyEn && r.reply) {
        if (typeof r.reply === 'string') { if (D.lang === 'en') replyEn = r.reply; else replyZh = r.reply; }
        else if (typeof r.reply === 'object') { replyZh = r.reply.zh || replyZh; replyEn = r.reply.en || replyEn; }
      }
      const entry = {
        id: 'e' + Date.now(), text: v, at: Date.now(), event: r.event || null, safety: r.safety || 'none',
        replyZh, replyEn
      };
      D.entries.push(entry);
      store.mergeProfile(entry.id, r);
      store.save();

      const replyText = D.lang === 'en' ? (replyEn || replyZh) : (replyZh || replyEn);
      const surfaceChips = D.surface.filter(w => store.uniqIds(w.sources).includes(entry.id))
        .map(w => D.lang === 'en' ? (w.en || w.keyword) : w.keyword);
      const deepChips = D.deep.filter(d => store.uniqIds(d.sources).includes(entry.id))
        .map(d => D.lang === 'en' ? d.term : (d.zh || d.term));
      const ev = entry.event ? [entry.event.time, entry.event.ageStage, entry.event.title].filter(Boolean).join(' · ') : '';

      this.setData({
        reply: { text: replyText, safety: entry.safety, surfaceChips, deepChips, ev, crisis: entry.safety === 'crisis' },
        text: '', busy: false
      });
      this.refresh();
      ai.ensureTranslations().then(ok => { if (ok) this.refresh(); });
    } catch (e) {
      const msg = /API key|Base URL|Model name|Endpoint returned|never went out|Key|接口|请求没有|接口返回/.test(e.message)
        ? e.message : T_.errAnalyze;
      this.setData({ busy: false, err: msg });
    }
  },

  goSurface() { wx.navigateTo({ url: '/pages/surface/surface' }); },
  goDeep() { wx.navigateTo({ url: '/pages/deep/deep' }); },
  goMemories() {
    // 不带筛选进清单页:store.takeFilter() 每次读取都会自动清空,上一次点词云
    // 留下的筛选早在那次清单页 onLoad 时就被消费掉了,这里不会读到脏数据。
    wx.navigateTo({ url: '/pages/memories/memories' });
  },

  enterDemo() {
    store.enterDemo();
    wx.navigateTo({ url: '/pages/surface/surface' });
  },
  exitDemo() {
    store.exitDemo();
    this.refresh();
  },

  askWipe() { this.setData({ confirmReset: true }); },
  cancelWipe() { this.setData({ confirmReset: false }); },
  doWipe() {
    store.wipeEntries();
    this.setData({ confirmReset: false, reply: null });
    this.refresh();
  },

  dismissIntro() {
    const D = store.getD();
    D.seenIntro = true;
    store.save();
    this.setData({ showIntro: false });
  },

  // 长按标题 1.2 秒进设置,跟网页版一样是刻意藏起来的入口——不用小程序自带的
  // bindlongpress(触发太快,大概 350ms),手写一个计时器才能保住这 1.2 秒的分寸感。
  titleTouchStart() {
    this._titleTimer = setTimeout(() => {
      this._titleTimer = null;
      wx.navigateTo({ url: '/pages/settings/settings' });
    }, 1200);
  },
  titleTouchEnd() {
    if (this._titleTimer) { clearTimeout(this._titleTimer); this._titleTimer = null; }
  }
});
