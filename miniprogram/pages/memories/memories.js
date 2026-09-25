const store = require('../../utils/store.js');
const { t } = require('../../utils/i18n.js');

function fmt(ts, lang) {
  const d = new Date(ts);
  const locale = lang === 'en' ? 'en-US' : 'zh-CN';
  const date = d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

Page({
  data: { T: {}, rows: [], hasTrash: false, dark: false },

  onLoad() {
    this._filter = store.takeFilter();
  },
  onShow() { this.refresh(); },

  refresh() {
    const D = store.getD();
    const T_ = t(D.lang);
    const filter = this._filter;
    let list = filter ? D.entries.filter(e => filter.ids.includes(e.id)) : D.entries;
    list = list.slice().reverse();
    const rows = list.map(e => {
      const f = fmt(e.at, D.lang);
      return { id: e.id, date: f.date, time: f.time };
    });
    this.setData({ T: T_, rows, hasTrash: store.hasTrash(), dark: !!(filter && filter.dark) });
    wx.setNavigationBarTitle({ title: filter ? filter.label : (D.lang === 'en' ? 'Memories' : '记忆清单') });
  },

  openRow(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/memory/memory?id=' + encodeURIComponent(id) });
  },

  delRow(e) {
    const id = e.currentTarget.dataset.id;
    store.deleteEntry(id);
    this.refresh();
  },
  undo() {
    store.undoDelete();
    this.refresh();
  }
});
