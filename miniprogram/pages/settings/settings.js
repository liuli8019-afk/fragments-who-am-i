const store = require('../../utils/store.js');
const { t, PROVIDERS, PROTO_NAME } = require('../../utils/i18n.js');
const ai = require('../../utils/ai.js');

Page({
  data: {
    T: {}, statText: '',
    providerNames: [], providerIdx: 0,
    protoNames: [], protoIdx: 0,
    baseUrl: '', model: '', temperature: '0.2', proxy: '', apiKey: '',
    keyLabel: '', testOut: '', testWarn: false, domainNote: ''
  },

  onShow() { this.refresh(); },

  refresh() {
    const D = store.getD();
    const T_ = t(D.lang);
    const s = D.settings;
    const providerIdx = Math.max(0, PROVIDERS.findIndex(p => p.id === s.provider));
    const protoKeys = Object.keys(PROTO_NAME[D.lang] || PROTO_NAME.zh);
    const protoIdx = Math.max(0, protoKeys.indexOf(s.protocol || 'openai'));
    this.setData({
      T: T_,
      statText: T_.stat(D),
      providerNames: PROVIDERS.map(p => D.lang === 'en' ? (p.nameEn || p.name) : p.name),
      providerIdx,
      protoNames: protoKeys.map(k => (PROTO_NAME[D.lang] || PROTO_NAME.zh)[k]),
      protoKeys, protoIdx,
      baseUrl: s.baseUrl, model: s.model, temperature: String(s.temperature),
      proxy: s.proxy || '', apiKey: s.apiKey,
      keyLabel: ai.keyRequired() ? T_.setKey : T_.setKeyOpt,
      domainNote: T_.domainWhitelist
    });
  },

  onProviderChange(e) {
    const idx = Number(e.detail.value);
    const p = PROVIDERS[idx];
    if (!p) return;
    const protoKeys = this.data.protoKeys;
    this.setData({
      providerIdx: idx,
      baseUrl: p.base || this.data.baseUrl,
      model: p.model || this.data.model,
      protoIdx: Math.max(0, protoKeys.indexOf(p.proto))
    });
  },
  onProtoChange(e) { this.setData({ protoIdx: Number(e.detail.value) }); },
  onBaseUrl(e) { this.setData({ baseUrl: e.detail.value }); },
  onModel(e) { this.setData({ model: e.detail.value }); },
  onTemp(e) { this.setData({ temperature: e.detail.value }); },
  onProxy(e) { this.setData({ proxy: e.detail.value }); },
  onKey(e) { this.setData({ apiKey: e.detail.value }); },

  applyToStore() {
    const D = store.getD();
    D.settings.provider = PROVIDERS[this.data.providerIdx].id;
    D.settings.protocol = this.data.protoKeys[this.data.protoIdx];
    D.settings.baseUrl = (this.data.baseUrl || '').trim();
    D.settings.model = (this.data.model || '').trim();
    D.settings.temperature = Math.max(0, Math.min(1, parseFloat(this.data.temperature) || 0.2));
    D.settings.proxy = (this.data.proxy || '').trim();
    D.settings.apiKey = (this.data.apiKey || '').trim();
  },

  save() {
    this.applyToStore();
    store.save();
    this.setData({ testOut: this.data.T.setDone, testWarn: false });
  },

  async test() {
    this.applyToStore();
    store.save();
    this.setData({ testOut: this.data.T.setTesting, testWarn: false });
    try {
      await ai.askAI('只回一个 JSON:{"ok":true}');
      this.setData({ testOut: this.data.T.setOk, testWarn: false });
    } catch (e) {
      this.setData({ testOut: e.message, testWarn: true });
    }
  },

  copyExport() {
    const D = store.getD();
    wx.setClipboardData({
      data: JSON.stringify(D),
      success: () => wx.showToast({ title: this.data.T.locale === 'zh' ? '已复制' : 'Copied', icon: 'none' })
    });
  },
  pasteImport() {
    const T_ = this.data.T;
    wx.getClipboardData({
      success: (res) => {
        try {
          const d = JSON.parse(res.data);
          const base = store.clone(store.DEFAULTS);
          const merged = Object.assign(base, d);
          merged.settings = Object.assign(base.settings, d.settings || {});
          // store.getD() 给的是模块内部那个 D 对象的引用,不是拷贝——外面没法直接把
          // 整个引用换掉,只能把字段一个个写回这同一个对象上,效果等同于整体替换。
          const D = store.getD();
          Object.keys(base).forEach(k => { D[k] = merged[k]; });
          store.save();
          wx.showToast({ title: T_.locale === 'zh' ? '已导入' : 'Imported', icon: 'none' });
          this.refresh();
        } catch (e) {
          wx.showToast({ title: T_.importFail, icon: 'none' });
        }
      }
    });
  },

  wipeAll() {
    const T_ = this.data.T;
    wx.showModal({
      content: T_.clearWarn,
      confirmText: T_.clearYes,
      cancelText: T_.clearNo,
      success: (res) => {
        if (res.confirm) { store.wipeAll(); this.refresh(); }
      }
    });
  }
});
