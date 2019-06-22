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
> a lazy load cache module

### [中文说明](./README.zh_CN.md)
###  [Homepage](https://github.com/985ch/node-cache-9#readme)

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
  const data = await cache.xxx.get('cachekey', async () => { /* get your data and return it here */ }, options);
  // renew the cached data
  cache.xxx.renew('cachekey', options);
  // clear the cache
  cache.xxx.clear('cachekey');

  console.log(data);
})();
```
## Driver
a cache driver mean a class with functions **get(key, func, options),renew(key, options),clear(key)**
### Default dirvers
* **memory**: a memory cache you can save everything into it
* **redis**: a redis cache you can save something can stringify
### BaseDriver
you can get BaseDriver from package with is a driver base of memory and redis, you can get it like this
```js
const BaseDriver = require('node-cache-9').BaseDriver;
```
## Config
a config with one or more store
### Store config
    |name|description|required|
    |:---|:---------|:------:|
    |class|the cache driver,it can be a default driver name or a driver class|true|
    |ttl|time to live(second), 0 = ∞|false|
### memory driver extends config
    | name | description | required |
    | :--- | :--------- | :------：|
    | channel | the redis publish/subscribe channel,need getRedis or rds | false |
    | getRedis   | function(){ return {pub, sub}},pub and sub is redis client | false |
    | rds | a redis client config, use it when you don't set getRedis | false|
### redis driver extend config
    | name | description | required |
    | :--- | :--------- | :------：|
    | raw | when it is true we don't use JSON.stringify and JSON.parse for raw data | false |
    | getRedis   | function(){ return rds},rds is redis client | false |
    | rds | a redis client config, use it when you don't set getRedis | false|
## Options
cache options
### Default options
    | name | description | default |
    | :--- | :--------- | :------：|
    | ttl | time to live | null |
    | keep   | when fail to get raw, use cached data | false |
    | disable | disable cache this time | false|
    | update   | force update data | false |
    | autoRenew | auto renew cached data | false|
### Redis driver extend options
    | name | description | required |
    | :--- | :--------- | :------：|
    | raw | when it is true we don't use JSON.stringify and JSON.parse for raw data | false |
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