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
  // 从数据源或者缓存获取数据
  const data = await cache.xxx.get('cachekey', async () => {
    // 在这里获取源数据并返回
    return 'something';
  }, options);
  // 刷新缓存过期时间
  cache.xxx.renew('cachekey', options);
  // 清空缓存
  cache.xxx.clear('cachekey');
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

  console.log(data);
  console.log(datas.list);
})();
```
## 缓存驱动类
缓存驱动类是一个包含了一些特定方法的类
### 缓存驱动类需要的方法
| 方法 | 返回 | 描述 |
|:----|:-----|:----|
| get(key,func,options) | any | 独立缓存的核心方法，根据key和options自动决定从缓存获取数据或是调用func()获取数据 |
| renew(key,options) | null | 刷新单个缓存的有效时间的方法 |
| clear(key) | null | 清除单个缓存的方法 |
| getM(key,list,saveKey,func,options) | array | 批量缓存的核心方法，根据key，其中saveKey函数用于计算结果对应的键值，func(lst)函数会获得需要更新的数组，并返回对应的结果 |
| renewM(key,list,options) | null | 批量刷新缓存的有效时间的方法 |
| clearM(key, list, options) | null | 批量清空缓存的方法，当若省略list参数，则清除整组缓存 |
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
一个配置必须包含一个或多个仓库，仓库即[使用方法](#使用方法)中的xxx。在配置中配置多个仓库时，仓库的键值即对应缓存的键值
### 仓库配置
| 名字 | 所属驱动类 | 描述 | 默认值 |
|:----|:----------|:-----|:--------|
| class | 所有 | 缓存驱动类，可以是内置的缓存驱动类名，或是一个自定义的缓存驱动类 | undefined |
| ttl | 所有 | 缓存过期时间，单位是秒，当其为0时永远不会过期 | 0 |
| keep | 所有 | 当无法从数据源获取数据时，是否用已过期缓存来作为返回结果 | false |
| autoRenew | 所有 | 每次从缓存获取数据时，是不是同时更新缓存的过期时间 | false |
| cacheUndefined | 所有 | 在从数据源批量获取数据的时候，那些没有获取成功的数据是否以null为值写入缓存中 | false |
| channel | memory | redis的发布和监听频道，需要配合getRedis或rds使用 | undefined |
| channel | redis | redis缓存的前缀，前缀和键值之间会用半角冒号隔开 | 'cache9' |
| getRedis | memory | 一个无参数的函数，需要返回一个包含sub和pub两个redis客户端的JSON | undefined |
| getRedis | redis | 一个无参数的函数，需要返回一个redis客户端 | undefined |
| rds | 所有 | redis配置JSON，如果配置了getRedis则该属性无效 | undefined |
| clearTime | memory | 自动清除缓存的时间，单位时秒，该值不能小于1800秒 | 0 |
| raw | redis | 在往redis读写数据的时候，是否不使用JSON.stringify和JSON.parse对数据进行处理 | false |
## Options
使用缓存时的额外选项，绝大多数情况下，同名的选项会比对应的配置优先生效
### 所有选项
| 名字 | 所属驱动类 | 描述 | 默认值 |
|:----|:----------|:-----|:------|
| ttl | 所有 | 同config里的ttl | null |
| keep | 所有 | 同config里的keep | false |
| autoRenew | 所有 | 同config里的autoRenew | false|
| cacheUndefined | 所有 | 同config里的cacheUndefined | false |
| getKey | 所有 | 一个函数，在批量缓存中用于获取单个对象对应的子键 | obj=>obj |
| disable | 所有 | 本次是否禁用缓存，直接从数据源获取数据 | false |
| update | 所有 | 本次直接从数据源获取数据，并将其存入缓存 | false |
| raw | redis | 同config里的raw | false |
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