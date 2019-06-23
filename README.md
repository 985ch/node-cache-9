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
> a lazy load cache module

### [中文说明](./README.zh_CN.md)
### [Homepage](https://github.com/985ch/node-cache-9#readme)

## Prerequisites

- node &gt;=8

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
  // renew the cached data
  cache.xxx.renew('cachekey', options);
  // clear the cache
  cache.xxx.clear('cachekey');
  // get multiply datas from raw or cache
  const datas = await cache.xxx.getM('mainKey', [ 'objA', 'objB', 'objC' ], obj => obj.key, async lst => {
    // get your data and return as array here
    return [];
  });
  // renew the cached data
  cache.xxx.renewM('mainKey', [ 'objA', 'objB' ], options);
  // clear the cached data
  cache.xxx.clearM('mainKey', [ 'objC' ]);
  cache.xxx.clearM('mainKey');

  console.log(data);
  console.log(datas.list);
})();
```
## Driver
a cache driver need some functions
### Need functions
| function | return | description |
|:----|:-----|:----|
| get(key,func,options) | any | get a data from cache or run func() to get data |
| renew(key,options) | null | renew cache TTL |
| clear(key) | null | delete cache |
| getM(key,list,saveKey,func,options) | array | get multiply data from cache or run func(lst) to get a array |
| renewM(key,list,options) | null | renew multiply cache TTL |
| clearM(key, list, options) | null | delete multiply cache data |
### Default dirvers
* **memory**: a memory cache you can save everything into it
* **redis**: a redis cache you can save something can stringify
### BaseDriver
you can use BaseDriver from your custom driver
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
a config with one or more store
### Store config
| name | driver | description | default |
|:-----|:-------|:------------|:--------|
| class | - | the cache driver,it can be a default driver name or a driver class | undefined |
| ttl | - | time to live(second) | 0 |
| keep | - | when fail to get raw data, use timeout cached data | false |
| autoRenew | - | auto renew TTL when get data from cache | false |
| cacheUndefined | - | cache the undefined data as null when you get multiply data | false |
| channel | memory | the redis publish/subscribe channel,need getRedis or rds | undefined |
| channel | redis | redis prefix, auto add ':' | 'cache9' |
| getRedis | memory | function(){ return {pub, sub}},pub and sub is redis client | undefined |
| getRedis | redis | function(){ return rds},rds is redis client | undefined |
| rds | - | a redis client config, use it when you don't set getRedis | undefined |
| clearTime | memory | auto delete memory cached time(second), clearTime >= 1800s | 0 |
| raw | redis |  when it is true we don't use JSON.stringify and JSON.parse for redis | false |
## Options
cache options
### Default options
| name | driver | description | default |
|:-----|:-------|:------------|:--------|
| ttl | - | same as config | null |
| keep | - | same as config | false |
| autoRenew | - | same as config | false|
| cacheUndefined | - | same as config | false |
| getKey | - | a function get key from object in list | obj=>obj |
| disable | - | disable cache this time | false |
| update | - | force update cache data | false |
| raw | redis | same as config | false |
## Run tests

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
This project is [MIT](https://github.com/985ch/node-cache-9/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_