App({
  onLaunch() {
    // 启动时做一次性的数据迁移:老存档里如果缺字段,这里补齐,跟网页版的
    // migrateLangFields() / migrateDomainSources() 是同一套逻辑。
    const store = require('./utils/store.js');
    store.migrateLangFields();
    store.migrateDomainSources();
  }
});
