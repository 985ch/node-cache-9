/**
redis缓存
config = {
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
    if (getRedis) {
      this.rds = getRedis();
    } else {
      const cli = redis.createClient(rds || {});
      this.rds = cli;
      this.rds.getAsync = promisify(cli.get).bind(cli);
    }
    if (!this.rds) throw new Error('[cache9] invaild redis client');
  }
  // 检查是否需要更新
  _checkUpdate() {
    return false;
  }
  // 获取缓存内容
  async _getCache(key, options = {}) {
    const raw = this._getCfg(options, 'raw', false);
    const realKey = this._getKey(key);
    const data = this.rds.getAsync ? await this.rds.getAsync(realKey) : await this.rds.get(realKey);
    if (!data) return { success: false };
    return {
      success: true,
      data: raw ? data : JSON.parse(data),
    };
  }
  // 更新时间戳
  renew(key, options = {}) {
    const ttl = this._getCfg(options, 'ttl', 0);
    if (ttl > 0) this.rds.expire(this._getKey(key), ttl);
  }
  // 保存数据
  _save(key, data, options = {}) {
    const ttl = this._getCfg(options, 'ttl', 0);
    const raw = this._getCfg(options, 'raw', false);
    this.rds.setex(this._getKey(key), ttl, raw ? data : JSON.stringify(data));
  }
  // 清除缓存
  clear(key) {
    this.rds.del(this._getKey(key));
  }
  // 获取redis键
  _getKey(key) {
    return `${this.config.channel}:${key}`;
  }
  // 销毁
  destroy() {
    if (this.rds) this.rds.quit();
  }
}

module.exports = RedisCache;
