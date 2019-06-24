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
> 这是一个简单易用的数据缓存模块，利用该模块任何人都可以简单的把数据放入缓存而不需要去处理相关逻辑

###  [主页](https://github.com/985ch/node-cache-9#readme)

## 需求

- node &gt;=8
- redis &gt;=2.8.0

## 安装

```sh
npm i node-cache-9
```
## 使用方法

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
  // 从数据源或者缓存获取数据
  const data = await cache.xxx.get('cachekey', async () => {
    // 在这里获取源数据并返回
    return 'something';
  }, options);
  // 刷新缓存过期时间
  cache.xxx.renew('cachekey', options);
  // 清空缓存
  cache.xxx.clear('cachekey');
  console.log(data);

  // 批量从数据源或者缓存获取数据，该方法会自动筛选出未缓存的数据，只有这些未缓存的数据会从数据源获取
  const datas = await cache.xxx.getM('mainKey', [ 'objA', 'objB', 'objC' ], obj => obj.key, async lst => {
    // 根据传入的lst数组来获取数据并返回
    return [];
  });
  // 批量刷新数据过期时间
  cache.xxx.renewM('mainKey', [ 'objA', 'objB' ], options);
  // 清空缓存
  cache.xxx.clearM('mainKey', [ 'objC' ]);
  cache.xxx.clearM('mainKey');
  console.log(datas.list);
})();
```
## 创建缓存
模块提供了两种方法来创建缓存
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
// 创建一组缓存
const cacheGroup = cache9.init(config);
cacheGroup.xxx.get(key, func);
cacheGroup.yyy.get(key, func);
// 创建单独的缓存
const cache = cache9.create(config.xxx);
cache.get(key, func);
```
## 缓存驱动类
缓存驱动类是一个包含了一些特定方法的类，我们通过驱动类提供的方法来操作缓存
### 针对单个缓存的方法
| 方法 | 返回 | 描述 |
|:----|:-----|:----|
| async get(key,func,options) | any | 从缓存获取数据或是调用func()获取数据 |
| renew(key,options) | - | 刷新缓存的有效时间 |
| async clear(key) | - | 清除缓存 |
| setCache(key, data, options) | - | 设置缓存数据 |
| async getCache(key, options) | any | 从缓存获取数据 |
### 针对分组缓存的方法
| 方法 | 返回 | 描述 |
|:----|:-----|:----|
| async getM(key,list,saveKey,func,options) | {list, json} | 批量从缓存中获取数据，缓存中没有的数据会整理出来，通过func(lst)函数获取并缓存，其中saveKey(obj)用于获取一个值对应的键 |
| renewM(key,list,options) | - | 批量刷新缓存的有效时间 |
| async clearM(key, list, options) | - | 批量清空缓存，当若省略list参数，则清除整组缓存 |
| setCacheM(key, subkey, data, options) | - | 设置一组缓存中的单个数据 |
| async getCacheM(key, list, options) | {list, json} | 从缓存获取一组数据 |
### 内置的缓存驱动类
* **memory**: 内存缓存驱动类，利用内存作为缓存，可以缓存任何数据类型
* **redis**: redis缓存驱动类，利用redis服务器来缓存数据，待缓存的数据必须支持JSON.stringify
### BaseDriver
[BaseDriver](./lib/baseDriver.js)是memory和redis两个缓存驱动类的基类，其中已经实现了不少基础缓存逻辑，通过对其进行派生可以快速的得到一个新的缓存驱动类
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
| 名字 | 所属驱动类 | 描述 | 默认值 |
|:----|:----------|:-----|:--------|
| class | - | 缓存驱动类，可以是内置的缓存驱动类名，或是一个自定义的缓存驱动类 | undefined |
| ttl | - | 缓存过期时间，单位是秒，当其为0时永远不会过期 | 0 |
| keep | - | 当无法从数据源获取数据时，是否用已过期缓存来作为返回结果 | false |
| autoRenew | - | 每次从缓存获取数据时，是不是同时更新缓存的过期时间 | false |
| cacheUndefined | - | 批量获取数据时，那些数据源没有返回的数据是否作为null写入缓存 | false |
| channel | memory | redis的发布和监听频道，需要配合getRedis或rds使用 | undefined |
| channel | redis | redis缓存的前缀，前缀和键值之间会用半角冒号隔开 | 'cache9' |
| getRedis | memory | 一个无参数的函数，需要返回一个包含sub和pub两个redis客户端的JSON | undefined |
| getRedis | redis | 一个无参数的函数，需要返回一个redis客户端 | undefined |
| rds | - | redis配置JSON，如果配置了getRedis则该属性无效 | undefined |
| clearTime | memory | 自动删除缓存数据的时间，单位是秒，该值不能小于1800秒 | 0 |
| raw | redis | 读写缓存数据的时候，不使用JSON.stringify和JSON.parse对数据进行处理 | false |
## Options
| 名字 | 所属驱动类 | 描述 | 默认值 |
|:----|:----------|:-----|:------|
| ttl | - | 同config里的ttl | null |
| keep | - | 同config里的keep | false |
| autoRenew | - | 同config里的autoRenew | false|
| cacheUndefined | - | 同config里的cacheUndefined | false |
| getKey | - | 一个函数，在批量缓存中用于计算对象对应的子键 | obj=>obj |
| disable | - | 本次是否禁用缓存，直接从数据源获取数据 | false |
| update | - | 本次直接从数据源获取数据，并将其存入缓存 | false |
| raw | redis | 同config里的raw | false |
## 执行测试脚本

首先在本地启动你的redis服务器
```sh
npm run test
```

## 作者

 **985ch**

* Github: [@985ch](https://github.com/985ch)

## License

Copyright © 2019 [985ch](https://github.com/985ch).<br />
This project is [MIT](https://github.com/985ch/node-cache-9/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_