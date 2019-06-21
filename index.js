'use strict';

const _ = require('lodash');
const BaseDriver = require('./lib/baseDriver');
const memory = require('./lib/memory');
const redis = require('./lib/redis');

const drivers = { memory, redis };

function init(config, errLog) {
  const cache = {};

  for (const key in config) {
    const cur = config[key];
    let driver = null;
    if (!cur.class) throw new Error(`[cache9] invalid class in config '${key}'`);
    if (_.isFunction(cur.class)) {
      driver = new cur.class(cur, errLog);
    } else if (drivers[cur.class]) {
      driver = new drivers[cur.class](cur, errLog);
    } else {
      throw new Error(`[cache9] invalid class in config '${key}'`);
    }
    cache[key] = driver;
  }

  return cache;
}

module.exports = {
  BaseDriver,
  init,
};
