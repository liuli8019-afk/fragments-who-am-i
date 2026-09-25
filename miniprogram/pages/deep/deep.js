const store = require('../../utils/store.js');
const { t, DOMAINS } = require('../../utils/i18n.js');

const REVEAL_AFTER = 8, HOLD_MS = 1200;

Page({
  data: { T: {}, items: [], hasItems: false, previewMode: false, unlocked: false, revealed: false, doms: [] },

  onShow() {
    this.refresh();
  },

  refresh() {
    const D = store.getD();
    const T_ = t(D.lang);
    const raw = store.deepItems();
    const max = Math.max(1, ...raw.map(i => i.weight));
    const items = raw.map(it => ({
      key: it.key, label: it.label, count: it.count, ids: it.ids,
      fontSize: (16 + Math.round((it.weight / max) * 22)) + 'px',
      opacity: (0.42 + (it.weight / max) * 0.58).toFixed(2)
    }));
    const domsRaw = D.domains.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
    const unlocked = D.entries.length >= REVEAL_AFTER && domsRaw.length > 0;
    const doms = domsRaw.map((d, i) => {
      const p = domsRaw.length <= 1 ? 0 : i / (domsRaw.length - 1);
      const from = [255, 255, 255], to = [150, 150, 155];
      const rgb = from.map((v, k) => Math.round(v + (to[k] - v) * p));
      return { name: D.lang === 'en' ? (DOMAINS[d.name] || d.name) : d.name, color: `rgb(${rgb.join(',')})` };
    });
    this.setData({ T: T_, items, hasItems: items.length > 0, previewMode: store.isPreview(), unlocked, doms, revealed: this.data.revealed && unlocked });
    wx.setNavigationBarTitle({ title: `${T_.me2} · ${T_.deepLabel}` });
    wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#17161A' });
  },

  wordTap(e) {
    // 长按 1.2 秒揭示方向标签之后松手,那根手指底下如果正好压着一个词,
    // 触摸结束时小程序仍然会补发一次 tap——这里拦掉,不然会被误当成点词进筛选。
    if (this._holdFired) { this._holdFired = false; return; }
    const idx = e.currentTarget.dataset.idx;
    const item = this.data.items[idx];
    if (!item) return;
    store.setFilter(item.label, item.ids, true);
    wx.navigateTo({ url: '/pages/memories/memories' });
  },

  cloudTouchStart() {
    if (!this.data.unlocked || this.data.revealed) return;
    this._holdTimer = setTimeout(() => { this._holdTimer = null; this._holdFired = true; this.setData({ revealed: true }); }, HOLD_MS);
  },
  cloudTouchEnd() {
    if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
  },

  exitDemo() { store.exitDemo(); wx.navigateBack(); },

  onShareAppMessage() {
    const T_ = this.data.T;
    return { title: `${T_.me2 || 'Me 2'} · Fragments — Who Am I?`, path: '/pages/home/home' };
  }
});
