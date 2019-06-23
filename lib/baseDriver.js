/**
缓存基类
config = {
  class:null, // 一个类，需要实现get,renew,clear三个函数
  ttl: 0, // 缓存时间，当options里也有ttl时，以options为准
  cacheUndefined: false, //批量获取时，是否把未匹配的数据作为null缓存起来
}
options = {
  getKey:(obj)=>obj.key, //批量获取时，提供一个函数根据list对象获取键值
  cacheUndefined: false, //批量获取时，是否把未匹配的数据作为null缓存起来
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
      if (autoRenew) this.renew(key, options);
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
  // 批量更新或者获取缓存
  async getM(key, list, saveKey, func, options = {}) {
    const { update, disable } = options;
    if (!_.isArray(list))list = [ list ];
    const autoRenew = this._getCfg(options, 'autoRenew', false);
    const ttl = this._getCfg(options, 'ttl', 0);

    const keys = this._getKeys(list, options);
    if (disable || update) {
      const raw = await this._getRawM(key, keys, list, (!disable) ? saveKey : null, func, options);
      return this._mergeDatas(keys, null, raw, options);
    }

    const cached = await this._getCacheM(key, keys, options);
    let raw = {};
    if (autoRenew) this._renewM(key, cached.keys, ttl);
    if (cached.keys.length < keys.length) {
      const r = this._getNeedList(list, keys, cached.datas);
      raw = await this._getRawM(key, r.keys, r.list, saveKey, func, options);
    }

    return this._mergeDatas(keys, cached, raw, options);
  }
  // 更新时间戳
  renew(/* key, options*/) {
    // reset TTL
  }
  renewM(key, list, options = {}) {
    const keys = this._getKeys(list, options);
    const ttl = this._getCfg(options, 'ttl', 0);
    this._renewM(key, keys, ttl);
  }
  // 清除缓存
  clear(/* key*/) {
    // clear the cache data
  }
  // 清除缓存
  clearM(key, list, options) {
    if (!list) {
      this._clearM(key);
    } else {
      this._clearM(key, this._getKeys(list, options));
    }
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
  // 获取键组
  _getKeys(list, { getKey } = {}) {
    if (!getKey) return list;

    const len = list.length;
    const keys = [];
    for (let i = 0; i < len; i++) {
      keys.push(getKey(list[i]));
    }

    return keys;
  }
  // 批量获取数据
  async _getRawM(key, keys, list, saveKey, func, options = {}) {
    const cacheUndefined = this._getCfg(options, 'cacheUndefined', false);
    const result = {};

    const datas = await func(list);
    if (!_.isArray(datas)) throw new Error('[cache9] the function must return a array');

    let len = datas.length;
    for (let i = 0; i < len; i++) {
      const data = datas[i];
      const dataKey = saveKey(data);
      result[dataKey] = data;
      this._saveM(key, dataKey, data, options);
    }
    if (cacheUndefined) {
      len = keys.length;
      for (let i = 0; i < len; i++) {
        const dataKey = keys[i];
        if (_.isUndefined(result[dataKey])) {
          result[dataKey] = null;
          this._saveM(key, dataKey, null, options);
        }
      }
    }

    return result;
  }
  // 批量存储数据中的储存单个数据
  _saveM(/* key, subKey, data = null, options*/) {
    // save data to cache
  }
  // 批量更新缓存时间
  _renewM(/* key, keys, ttl*/) {
    // renew cache data
  }
  // 清除缓存
  _clearM(/* key, [keys]*/) {
    // clear the cache data
  }
  // 批量获取缓存
  async _getCacheM(/* key, keys, options*/) {
    throw new Error('[cache9] invaild function:[_getCacheM]');
    // return {keys, datas, timeout}
  }
  // 根据缓存获取结果和待获取键值的对比来获取需求列表
  _getNeedList(list, keys, datas) {
    const needKeys = [];
    const needList = [];

    const len = keys.length;
    for (let i = 0; i < len; i++) {
      if (_.isUndefined(datas[keys[i]])) {
        needKeys.push(keys[i]);
        needList.push(list[i]);
      }
    }

    return {
      keys: needKeys,
      list: needList,
    };
  }
  // 合并结果数据并返回合并后的数据
  _mergeDatas(keys, cache = { datas: {}, timeout: {} }, raw, options = {}) {
    const keep = this._getCfg(options, 'keep', false);
    const list = [];
    const json = {};
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const curKey = keys[i];
      let data = raw[curKey] || cache.datas[curKey];
      if (keep && _.isUndefined(data)) {
        data = cache.timeOut[curKey];
      }
      if (!_.isUndefined(data)) {
        list.push(data);
        json[curKey] = data;
      }
    }
    return { list, json };
  }
}

module.exports = BaseDriver;
