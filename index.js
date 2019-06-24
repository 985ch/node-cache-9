'use strict';

const _ = require('lodash');
const BaseDriver = require('./lib/baseDriver');
const memory = require('./lib/memory');
const redis = require('./lib/redis');

const drivers = { memory, redis };

function init(config, errLog = console.log) {
  const cache = {};
  for (const key in config) {
    cache[key] = create(config[key], errLog, key);
  }
  return cache;
}

function create(config, errLog = console.log, cacheName) {
  let driver = null;
  const driverClass = config.class;
  if (!driverClass) throw new Error(`[cache9] invalid class in config${cacheName ? ` '${cacheName}'` : ''}`);
  if (_.isFunction(driverClass)) {
    driver = new driverClass(config, errLog);
  } else if (drivers[driverClass]) {
    driver = new drivers[driverClass](config, errLog);
  } else {
    throw new Error(`[cache9] invalid class in config${cacheName ? ` '${cacheName}'` : ''}`);
  }
  return driver;
}

module.exports = {
  BaseDriver,
  init,
  create,
};
