'use strict';

const init = require('./index').init;
const { promisify } = require('util');

const config = {
  memory: {
    class: 'memory',
    channel: 'cache9',
    ttl: 1,
    rds: {
      host: '127.0.0.1',
      db: 1,
    },
  },
  redis: {
    class: 'redis',
    ttl: 1,
    rds: {
      host: '127.0.0.1',
      db: 0,
    },
  },
};

const cache = init(config, console.log);

async function singleTest(i, store, x, opt) {
  const data = await cache[store].get('test', async () => {
    console.log('raw!');
    return store + ' ' + x;
  }, opt);
  console.log(`${i}:${data}`);
}

const wait = promisify((n, callback) => {
  setTimeout(() => {
    callback(null, 0);
  }, n);
});

async function runTest(store) {
  console.log(`start ${store} test`);
  await singleTest(1, store, '1st');
  await singleTest(2, store, '2nd', { update: true });
  cache[store].renew('test');
  console.log('renew!');
  await singleTest(3, store, '3rd');
  cache[store].clear('test');
  console.log('clear!');
  await singleTest(4, store, '4th');
  await wait(1000);
  await singleTest(5, store, '5th');
  console.log(`complete ${store} test`);
}

(async () => {
  await runTest('memory');
  await runTest('redis');
  cache.memory.destroy();
  cache.redis.destroy();
})();
