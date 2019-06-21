/**
缓存基类
config = {
  class:null, // 一个类，需要实现get,renew,clear三个函数
  ttl: 0, // 缓存时间，当options里也有ttl时，以options为准
}
options = {
  ttl: 0, // 缓存时间，优先级高于config
  keep:false, //无法获取源数据但缓存中仍有数据时是否使用缓存中的数据
  disable:false, //是否禁用缓存并且直接从数据源获取数据
  update:false,  //是否强制更新缓存数据
  autoRenew:false, //是否自动更新到期时间
}
**/
'use strict';
const _ = require('lodash');

class BaseDriver {
  constructor(config, errLog) {
    this.config = config;
    this.errLog = errLog;
  }
  // 更新或者获取缓存
  async get(key, func, options = {}) {
    const { update, disable } = options;
    const keep = this._getCfg(options, 'keep', false);
    const autoRenew = this._getCfg(options, 'autoRenew', false);

    if (disable) return await this._getRaw(func, options);

    const needUpdate = (update || this._checkUpdate(key, options));
    const { success, data } = needUpdate ? { success: false } : await this._getCache(key, options);
    if (success) {
      if (autoRenew) this.autoRenew(key, options);
      return data;
    }

    try {
      const result = await this._getRaw(func, options);
      this._save(key, result, options);

      return result;
    } catch (e) {
      if (!keep) throw e;
      if (success) {
        this.erLog(e);
        return data;
      }
      if (needUpdate) {
        const old = await this._getCache(key, options);
        if (old.success) {
          this.errLog(e);
          return data;
        }
      }
      throw e;
    }
  }
  // 更新时间戳
  renew(/* key, options*/) {
    // reset TTL
  }
  // 清除缓存
  clear(/* key*/) {
    // clear the cache data
  }
  // 销毁
  destroy() {}
  // 从配置或者选项中获取选项
  _getCfg(options, key, value) {
    let r = options[key];
    if (_.isUndefined(r)) r = this.config[key] || value;
    return r;
  }
  // 检查是否需要更新
  _checkUpdate(/* key, options */) {
    return true;
  }
  // 获取缓存内容
  async _getCache(/* key, options*/) {
    throw new Error('[cache9] invaild function:[_getCache]');
    // return { success, data }
  }
  // 获取源数据
  async _getRaw(func /* , options */) {
    return await func();
  }
  // 保存数据
  _save(/* key, data, options*/) {
    // save data to cache
  }
}

module.exports = BaseDriver;
