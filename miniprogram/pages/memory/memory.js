const store = require('../../utils/store.js');
const { t } = require('../../utils/i18n.js');

function fmt(ts, lang) {
  const d = new Date(ts);
  const locale = lang === 'en' ? 'en-US' : 'zh-CN';
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }) +
    ' · ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

Page({
  data: { T: {}, found: false, stamp: '', text: '', meta: '', analysis: '', sw: [], dw: [] },

  onLoad(query) { this._id = decodeURIComponent(query.id || ''); },
  onShow() { this.refresh(); },

  refresh() {
    const D = store.getD();
    const T_ = t(D.lang);
    const e = D.entries.find(x => x.id === this._id);
    if (!e) { this.setData({ T: T_, found: false }); return; }
    const sw = D.surface.filter(w => store.uniqIds(w.sources).includes(e.id))
      .map(w => D.lang === 'en' ? (w.en || w.keyword) : w.keyword);
    const dw = D.deep.filter(d => store.uniqIds(d.sources).includes(e.id))
      .map(d => D.lang === 'en' ? d.term : (d.zh || d.term));
    const meta = e.event ? [e.event.time, e.event.ageStage].concat(e.event.people || []).filter(Boolean).join(' · ') : '';
    const analysis = D.lang === 'en' ? (e.replyEn || e.replyZh || '') : (e.replyZh || e.replyEn || '');
    this.setData({
      T: T_, found: true, stamp: fmt(e.at, D.lang), text: e.text, meta, analysis, sw, dw
    });
  }
});
