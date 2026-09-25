const store = require('../../utils/store.js');
const { t } = require('../../utils/i18n.js');

Page({
  data: { T: {}, items: [], hasItems: false, previewMode: false },

  onShow() { this.refresh(); },

  refresh() {
    const D = store.getD();
    const T_ = t(D.lang);
    const raw = store.surfaceItems();
    const max = Math.max(1, ...raw.map(i => i.weight));
    const items = raw.map((it, i) => ({
      key: it.key, label: it.label, count: it.count, ids: it.ids,
      fontSize: (16 + Math.round((it.weight / max) * 22)) + 'px',
      opacity: (0.42 + (it.weight / max) * 0.58).toFixed(2)
    }));
    this.setData({ T: T_, items, hasItems: items.length > 0, previewMode: store.isPreview() });
    wx.setNavigationBarTitle({ title: `${T_.me1} · ${T_.surfaceLabel}` });
  },

  wordTap(e) {
    const idx = e.currentTarget.dataset.idx;
    const item = this.data.items[idx];
    if (!item) return;
    store.setFilter(item.label, item.ids);
    wx.navigateTo({ url: '/pages/memories/memories' });
  },

  exitDemo() { store.exitDemo(); wx.navigateBack(); },

  // 小程序原生的"转发"入口(右上角 ... → 转发给朋友/分享到群),
  // 比网页版那个手搓 canvas 下载卡片更直接——这是小程序生态本来就有的传播路径。
  onShareAppMessage() {
    const T_ = this.data.T;
    return { title: `${T_.me1 || 'Me 1'} · Fragments — Who Am I?`, path: '/pages/home/home' };
  }
});
