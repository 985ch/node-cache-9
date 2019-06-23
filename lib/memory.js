/**
内存缓存，可以使用redis来实现多端同步刷新
config = {
  channel:'', //需要同时和rds配置或者和getRedis函数使用，当需要多服务器同步刷新缓存时会用上
  getRedis(){return {sub,pub}}, //用于获取redis客户端实例
  rds:{}, //redis配置，用于建立redis客户端实例
  clearTime:0, //定时清除缓存的时间，单位（s），当其大于0时，不得低于1800秒
}
**/
'use strict';
const _ = require('lodash');
const redis = require('redis');
const BaseDriver = require('./baseDriver');

// 缓存基类
class MemoryCache extends BaseDriver {
  constructor(config, errLog) {
    super(config, errLog);
    this.cache = {};
    this.cacheM = {};

    const { channel, rds, getRedis, clearTime } = config;
    if (channel) {
      if (getRedis) {
        const { sub, pub } = getRedis();
        this.rdsSub = sub;
        this.rdsPub = pub;
      } else {
        this.rdsSub = redis.createClient(rds || {});
        this.rdsPub = redis.createClient(rds || {});
      }

      this.rdsSub.on('message', (chan, msg) => {
        if (channel !== chan) return;
        msg = JSON.parse(msg);
        if (msg.op === 'clear') {
          this.clear(msg.key, false);
        } else if (msg.op === 'clearM') {
          this._clearM(msg.key, msg.keys, false);
        }
      });
      this.rdsSub.subscribe(channel);
    }
    if (clearTime && clearTime >= 1800) {
      setInterval(() => { this._clearTimeout(); }, clearTime * 1000);
    }
  }
  // 检查是否需要更新
  _checkUpdate(key, options = {}) {
    const ttl = this._getCfg(options, 'ttl', 0);
    if (ttl <= 0) return false;

    const now = Date.now();
    const last = _.get(this.cache, [ key, 't' ], 0);

    return (now - last) > ttl * 1000;
  }
  // 获取缓存内容
  async _getCache(key) {
    const obj = this.cache[key];
    if (!obj) return { success: false };
    return {
      success: true,
      data: obj.data,
    };
  }
  // 更新时间戳
  renew(key) {
    const obj = this.cache[key];
    if (!obj) return;
    obj.t = Date.now();
  }
  // 保存数据
  _save(key, data) {
    this.cache[key] = {
      data,
      t: Date.now(),
    };
  }
  // 清除缓存
  clear(key, publish = true) {
    if (publish && this.rdsPub) {
      this.rdsPub.publish(this.config.channel, JSON.stringify({
        op: 'clear',
        key,
      }));
    }
    if (this.cache[key]) {
      delete this.cache[key];
    }
  }
  // 清除超时数据
  _clearTimeout() {
    const now = Date.now();
    const clearTime = this.config.clearTime * 1000;
    for (const key in this.cache) {
      const cur = this.cache[key];
      if (now - cur.t > clearTime) {
        delete this.cache[key];
      }
    }
    for (const key in this.cacheM) {
      for (const subKey in this.cacheM[key]) {
        const cur = this.cacheM[key][subKey];
        if (now - cur.t > clearTime) {
          delete this.cacheM[key][subKey];
        }
      }
    }
  }
  // 销毁
  destroy() {
    if (this.rdsPub) this.rdsPub.quit();
    if (this.rdsSub) this.rdsSub.quit();
  }
  // 批量获取缓存
  async _getCacheM(key, keys, options) {
    const now = Date.now();
    const ttl = this._getCfg(options, 'ttl', 0) * 1000;
    const main = this.cacheM[key];

    const cachedKeys = [];
    const datas = {};
    const timeoutDatas = {};
    if (main) {
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const curKey = keys[i];
        const curData = main[curKey];
        if (curData) {
          if (now - curData.t < ttl) {
            cachedKeys.push(curKey);
            datas[curKey] = curData.data;
          } else {
            timeoutDatas[curKey] = curData.data;
          }
        }
      }
    }
    return { keys: cachedKeys, datas, timeout: timeoutDatas };
  }
  // 批量存储数据中的储存单个数据
  _saveM(key, subKey, data = null) {
    _.set(this.cacheM, [ key, subKey ], { data, t: Date.now() });
  }
  // 批量更新缓存时间
  _renewM(key, keys) {
    const now = Date.now();
    const main = this.cacheM[key];
    if (!main) return;
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const cur = main[keys[i]];
      if (cur)cur.t = now;
    }
  }
  // 清除缓存
  _clearM(key, keys, publish = true) {
    if (publish && this.rdsPub) {
      this.rdsPub.publish(this.config.channel, JSON.stringify({
        op: 'clearM',
        key,
        keys,
      }));
    }
    if (!keys) {
      if (this.cacheM[key]) {
        delete this.cacheM[key];
      }
    } else {
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const subKey = keys[i];
        if (this.cacheM[key][subKey]) {
          delete this.cacheM[key][subKey];
        }
      }
    }
  }
}

module.exports = MemoryCache;
