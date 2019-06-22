<h1 align="center">node-cache-9 </h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/node-%3E%3D8-blue.svg" />
  <a  href="https://npmjs.org/package/node-cache-9">
    <img src="https://img.shields.io/npm/v/node-cache-9.svg?style=flat-square" />
  </a>
  <a  href="https://npmjs.org/package/node-cache-9">
    <img alt="NPM version" src="https://https://img.shields.io/npm/dm/node-cache-9.svg?style=flat-square" target="_blank"/>
  </a>
  <a href="https://github.com/985ch/node-cache-9/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
</p>
> 这是一个让用户可以简单的把数据加入缓存的缓存库，当你需要把某个耗时较长的计算结果缓存起来的时候，使用该库可以把所有关于缓存的复杂逻辑隐藏起来，只要简单的把原本的获取数据方法包裹起来即可

###  [主页](https://github.com/985ch/node-cache-9#readme)

## 需求

- node &gt;=8

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
// get data from raw or cache
  const data = await cache.xxx.get('cachekey', async () => { /* get your data and return it here */ }, options);
  // renew the cached data
  cache.xxx.renew('cachekey', options);
  // clear the cache
  cache.xxx.clear('cachekey');

  console.log(data);
})();
```
## 缓存驱动类
缓存驱动类是一个包含了**get(key, func, options),renew(key, options),clear(key)**这三个方法的类
### 内置的缓存驱动类
* **memory**: 内存缓存驱动类，利用内存作为缓存，有最高的执行效率，而且任何对象都可以储存进去，但是占用内存资源较多
* **redis**: redis缓存驱动类，利用redis服务器来缓存数据，数据必须是可以支持JSON.stringify的数据类型
### BaseDriver
是memory和redis两个缓存驱动类的基类，可以通过以下方式获取它
```js
const BaseDriver = require('node-cache-9').BaseDriver;
```
## Config
一个配置必须包含一个或多个仓库，仓库即[使用方法](#使用方法)中的xxx。在配置中配置多个仓库时，仓库的键值即对应缓存的键值
### 仓库通用配置
    |名字|描述|是否必须|
    |:---|:---------|:------:|
    |class|缓存驱动类，可以是内置的缓存驱动类名，或是一个自定义的缓存驱动类|true|
    |ttl|缓存过期时间，单位是秒，当其为0时永远不会过期|false|
### memory的额外配置
    | 名字 | 描述 | 是否必须 |
    | :--- | :--------- | :------：|
    | channel | redis的发布和监听频道，配置该属性之后也要配置getRedis或者rds的其中一个 | false |
    | getRedis   | 一个返回格式是{pub, sub}的无参数函数,pub和sub都是redis客户端实例 | false |
    | rds | redis配置JSON，如果配置了getRedis则该属性无效 | false|
### redis的额外配置
    | 名字 | 描述 | 是否必须 |
    | :--- | :--------- | :------：|
    | raw | 当其为真，则在写入和读取缓存时不使用JSON.stringify和JSON.parse两个函数来处理数据 | false |
    | getRedis   | 一个能返回一个redis客户端的无参数函数，该属性和rds必须有其中一个 | false |
    | rds | redis配置JSON，如果配置了getRedis则该属性无效 | false|
## Options
使用缓存时的额外选项
### 通用选项
    | 名字 | 描述 | 默认值 |
    | :--- | :--------- | :------：|
    | ttl | 缓存过期时间，单位是秒，当其为0时永远不会过期，选项的ttl比配置的ttl优先级更高 | null |
    | keep   | 当无法从数据源获取新的数据时，是否返回缓存中的数据 | false |
    | disable | 本次是否禁用缓存，直接从数据源获取数据 | false|
    | update   | 本次直接从数据源获取数据，并将其存入缓存 | false |
    | autoRenew | 是否自动刷新缓存过期时间，利用该选项可以让活跃的缓存永不过期 | false|
### Redis driver extend options
    | 名字 | 描述 | 默认值 |
    | :--- | :--------- | :------：|
    | raw | 当其为真，则在写入和读取缓存时不使用JSON.stringify和JSON.parse两个函数来处理数据 | false |
## 执行测试脚本

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