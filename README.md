<h1 align="center">node-cache-9 </h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/node-%3E%3D8-blue.svg" />
  <a  href="https://npmjs.org/package/node-cache-9">
    <img src="https://img.shields.io/npm/v/node-cache-9.svg?style=flat-square" />
  </a>
  <a href="https://github.com/985ch/node-cache-9/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
</p>
> This is an easy-to-use data caching module that allows anyone to simply put data into the cache without additional operations.

### [中文说明](./README.zh_CN.md)
### [Homepage](https://github.com/985ch/node-cache-9#readme)

## Prerequisites

- node &gt;=8
- redis &gt;=2.8.0

## Install

```sh
npm i node-cache-9
```
## Usage

```js
'use strict';
const cache9 = require('node-cache-9');
const config = {
  xxx: {
    class: 'memory',
    ttl: 5 * 60,
  },
};
const options = { ttl: 10 * 60 };
const cache = cache9.init(config);

(async function() {
  // get data from raw or cache
  const data = await cache.xxx.get('cachekey', async () => {
    // get your data and return it here
    return 'something';
  }, options);
  // update expiration time
  cache.xxx.renew('cachekey', options);
  // clear the cache
  cache.xxx.clear('cachekey');
  console.log(data);

  // get multiply datas from raw or cache
  const datas = await cache.xxx.getM('mainKey', [ 'objA', 'objB', 'objC' ], obj => obj.key, async lst => {
    // get your data and return as array here
    return [];
  });
  // update expiration time
  cache.xxx.renewM('mainKey', [ 'objA', 'objB' ], options);
  // clear the cached data
  cache.xxx.clearM('mainKey', [ 'objC' ]);
  cache.xxx.clearM('mainKey');
  console.log(datas.list);
})();
```
## Create cache
The module provides two ways to create a cache
```js
const cache9 = require('node-cache-9');
const config = {
  xxx: {
    class: 'memory',
    ttl: 5 * 60,
  },
  yyy: {
    class: 'redis',
    ttl: 10 * 60,
    rds: {
      host: '127.0.0.1',
      db: 0
    }
  }
};
// create a set of caches
const cacheGroup = cache9.init(config);
cacheGroup.xxx.get(key, func);
cacheGroup.yyy.get(key, func);
// create a cache
const cache = cache9.create(config.xxx);
cache.get(key, func);
```
## Cache driver class
The cache driver class is a class that contains some specific methods. We operate the cache by the methods provided by the driver class.
### Single cache
| function | return | description |
|:----|:-----|:----|
| async get(key,func,options) | any | Get data from cache or func() method |
| renew(key,options) | - | Update expiration time |
| clear(key) | - | Clear cache |
| setCache(key, data, options) | - | Set cache data |
| async getCache(key, options) | any | Get data from cache |
### Muliply caches
| function | return | description |
|:----|:-----|:----|
| async getM(key,list,saveKey,func,options) | {list, json} | The data is obtained from the cache in batches, and the data not in the cache is sorted out, and is obtained and cached by the func(lst) function, where saveKey(obj) is used to obtain a key corresponding to a value |
| renewM(key,list,options) | - | Update expiration time |
| clearM(key, list, options) | - | Clear caches, parameter list can be omitted |
| setCacheM(key, subkey, data, options) | - | Set cache data |
| async getCacheM(key, list, options) | {list, json} | Get data from cache |
### Default dirvers
* **memory**: Memory cache driver class, using memory as a cache, can cache any data type
* **redis**: Redis cache driver class, using redis server to cache data, data to be cached must support JSON.stringify
### BaseDriver
[BaseDriver](./lib/baseDriver.js) is the base class for memory and redis. You can use BaseDriver to quickly create a new cache driver class
```js
const BaseDriver = require('node-cache-9').BaseDriver;
class yourDriver extends BaseDriver {}
const config = {
  xxx:{
    class: yourDriver
  }
}
```
## Config
| name | driver | description | default |
|:-----|:-------|:------------|:--------|
| class | - | Cache driver class, can be a built-in cache driver class name, or a custom cache driver class | undefined |
| ttl | - | Time to live(second) | 0 |
| keep | - | Whether the expired cache is used as the return result when data cannot be obtained from the data source | false |
| autoRenew | - | When the data is retrieved from the cache, the cache expiration time is also updated | false |
| cacheUndefined | - | When data is fetched in batches, those data sources that have not returned are treated as null write caches | false |
| channel | memory | The redis publish/subscribe channel,need getRedis or rds | undefined |
| channel | redis | The prefix of the redis cache, the prefix and the key are separated by a colon | 'cache9' |
| getRedis | memory | ()=>{ return {pub, sub}},pub and sub are redis client | undefined |
| getRedis | redis | ()=>{ return rds},rds is a redis client | undefined |
| rds | - | Redis configures JSON, this property is invalid if getRedis is configured | undefined |
| clearTime | memory | The time to automatically delete the cache, in seconds, which cannot be less than 1800 seconds. | 0 |
| raw | redis | When reading and writing cached data, do not use JSON.stringify and JSON.parse | false |
## Options
| name | driver | description | default |
|:-----|:-------|:------------|:--------|
| ttl | - | Same as config | null |
| keep | - | Same as config | false |
| autoRenew | - | Same as config | false|
| cacheUndefined | - | Same as config | false |
| getKey | - | Function for calculating the subkey corresponding to the object | obj=>obj |
| disable | - | Disable caching this time | false |
| update | - | Force update cache | false |
| raw | redis | Same as config | false |
## Run tests

Run redis-server in localhost first
```sh
npm run test
```

## Author

 **985ch**

* Github: [@985ch](https://github.com/985ch)

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2019 [985ch](https://github.com/985ch).<br />
This project is [MIT](https://github.com/985ch/node-cache-9/blob/master/LICENSE) licensed.<br />
This README was translate by [google](https://translate.google.cn)

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
