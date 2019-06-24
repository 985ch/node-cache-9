/**
redis缓存
config = {
  channel:'cache9', //缓存前缀
  getRedis(){return redisCli}, //用于获取redis客户端实例
  rds:{}, //redis配置，用于建立redis客户端实例
  raw:false, //该参数决定是否使用JSON.stringify和JSON.Parse
}
options = {
  raw:false
}
*/
'use strict';
const redis = require('redis');
const { promisify } = require('util');
const BaseCache = require('./baseDriver');

// 缓存基类
class RedisCache extends BaseCache {
  constructor(config, errLog) {
    super(config, errLog);
    const { rds, getRedis } = config;
    this.channel = config.channel || 'cache9';
    if (getRedis) {
      this.rds = getRedis();
    } else {
      const cli = redis.createClient(rds || {});
      this.rds = cli;
      this.rds.getAsync = promisify(cli.get).bind(cli);
      this.rds.mgetAsync = promisify(cli.mget).bind(cli);
      this.rds.keysAsync = promisify(cli.keys).bind(cli);
    }
    if (!this.rds) throw new Error('[cache9] invaild redis client');
  }
  // 获取缓存内容
  async _getCache(key, options = {}) {
    const raw = this._getCfg(options, 'raw', false);
    const realKey = this._getKey(key);
    const data = this.rds.getAsync ? await this.rds.getAsync(realKey) : await this.rds.get(realKey);
    if (!data) return { status: 'failed' };
    return {
      status: 'success',
      data: raw ? data : JSON.parse(data),
    };
  }
  // 更新时间戳
  renew(key, options = {}) {
    const ttl = this._getCfg(options, 'ttl', 0);
    if (ttl > 0) this.rds.expire(this._getKey(key), ttl);
  }
  // 保存数据
  setCache(key, data, options = {}) {
    const ttl = this._getCfg(options, 'ttl', 0);
    const raw = this._getCfg(options, 'raw', false);
    this.rds.setex(this._getKey(key), ttl, raw ? data : JSON.stringify(data));
  }
  // 清除缓存
  async clear(key) {
    this.rds.del(this._getKey(key));
  }
  // 获取redis键
  _getKey(key) {
    return `${this.channel}:${key}`;
  }
  // 销毁
  destroy() {
    if (this.rds) this.rds.quit();
  }
  // 获取批量处理的键
  _getMKey(key, subkey) {
    return `${this.channel}:${key}:${subkey}`;
  }
  // 批量存储数据中的储存单个数据
  setCacheM(key, subkey, data = null, options = {}) {
    const ttl = this._getCfg(options, 'ttl', 0);
    const raw = this._getCfg(options, 'raw', false);
    this.rds.setex(this._getMKey(key, subkey), ttl, raw ? data : JSON.stringify(data));
  }
  // 批量更新缓存时间
  _renewM(key, keys, ttl) {
    for (const subkey of keys) {
      this.rds.expire(this._getMKey(key, subkey), ttl);
    }
  }
  // 清除缓存
  async _clearM(key, keys) {
    if (!keys) return await this._clearMAsync(key);
    for (const subkey of keys) {
      this.rds.del(this._getMKey(key, subkey));
    }
  }
  async _clearMAsync(key) {
    const fKey = this._getMKey(key, '*');
    const keys = (this.rds.keysAsync) ? await this.rds.keysAsync(fKey) : await this.rds.keys(fKey);
    for (const k of keys) {
      this.rds.del(k);
    }
  }
  // 批量获取缓存
  async _getCacheM(key, keys, options) {
    const len = keys.length;
    const fullKeys = new Array(len);
    const raw = this._getCfg(options, 'raw', false);
    const cacheUndefined = this._getCfg(options, 'cacheUndefined', false);
    if (raw && cacheUndefined) throw new Error('[cache9] raw must be false when cacheUndefined is true');

    // 从redis获取数据
    for (let i = 0; i < len; i++) {
      fullKeys[i] = this._getMKey(key, keys[i]);
    }
    const list = (this.rds.mgetAsync) ? await this.rds.mgetAsync(fullKeys) : await this.rds.mget(fullKeys);

    // 将数据处理为指定格式
    const datas = {};
    const cachedKeys = [];
    for (let i = 0; i < len; i++) {
      const data = list[i];
      const dataKey = keys[i];
      if (data) {
        cachedKeys.push(dataKey);
        datas[dataKey] = raw ? data : JSON.parse(data);
      }
    }
    return { keys: cachedKeys, datas, timeout: {} };
  }
}

module.exports = RedisCache;
