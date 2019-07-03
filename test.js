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

const cache = init(config);

async function singleTest(i, store, x, opt) {
  const data = await cache[store].get('test', async () => {
    console.log('raw!');
    return store + ' ' + x;
  }, opt);
  console.log(`${i}:${data}`);
}
async function multiplyTest(i, store, list, opt) {
  const data = await cache[store].getM('test', list, obj => obj, async lst => {
    console.log('from raw:' + lst.join(','));
    const result = [];
    for (const k of lst)result.push(k);
    return result;
  }, opt);
  console.log(`${i}:${data.list.join(',')}`);
}

const wait = promisify((n, callback) => {
  setTimeout(() => {
    callback(null, 0);
  }, n);
});

async function runTest(store) {
  await singleTest(1, store, '1st');
  await singleTest(2, store, '2nd with update', { update: true });
  cache[store].renew('test');
  console.log('renew!');
  await singleTest(3, store, '3rd');
  cache[store].clear('test');
  console.log('clear!');
  await singleTest(4, store, '4th');
  await wait(1000);
  await singleTest(5, store, '5th');
}

async function runTestM(store) {
  await multiplyTest(1, store, [ 1, 3, 5 ]);
  await multiplyTest(2, store, [ 1, 2 ], { update: true });
  cache[store].renewM('test', [ 1, 2, 3, 5 ]);
  console.log('renew 1,2,3,5!');
  await multiplyTest(3, store, [ 1, 2, 3, 4, 5 ]);
  await cache[store].clearM('test', [ 3, 4, 5 ]);
  console.log('clear 3,4,5!');
  await multiplyTest(4, store, [ 1, 2, 3, 4 ]);
  await wait(1000);
  await multiplyTest(5, store, [ 1, 2, 3, 4, 5 ]);
}

describe('Array', function() {
  it('memory single', async function() {
    this.timeout(3000);
    await runTest('memory');
  });
  it('redis single', async function() {
    this.timeout(3000);
    await runTest('redis');
  });
  it('memory multiply', async function() {
    this.timeout(3000);
    await runTestM('memory');
  });
  it('redis multiply', async function() {
    this.timeout(3000);
    await runTestM('redis');
    cache.memory.destroy();
    cache.redis.destroy();
  });
});
