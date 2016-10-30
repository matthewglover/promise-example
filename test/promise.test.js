import test from 'ava';
import Promise, { compose } from '../promise';

const addOne = x => x + 1;
const timesTwo = x => x * 2;

const testError = new Error('Test error');

const asyncFn = (x, cb) => setTimeout(() => cb(x * 2), 1);
const asyncErrorFn = cb => setTimeout(() => cb(testError), 1);


const simpleResolvingPromise = x =>
  new Promise(resolve => asyncFn(x, resolve));

const simpleRejectingPromise = () =>
  new Promise((resolve, reject) => asyncErrorFn(reject));

test('compose combines two functions', (t) => {
  t.is(compose(addOne, timesTwo)(10), 21);
});

test('compose applies functions right to left', (t) => {
  t.is(compose(timesTwo, addOne)(10), 22);
});

test('Promise takes a function and returns a Promise', (t) => {
  const p = simpleResolvingPromise(10);
  t.true(p instanceof Promise);
});

test.cb('Promise.then takes a resolve function which receives resolved value', (t) => {
  t.plan(1);
  const p = simpleResolvingPromise(10);
  p.then((x) => {
    t.is(x, 20);
    t.end();
  });
});

test.cb('Promise.then takes a reject function which receives rejected error', (t) => {
  t.plan(1);
  const p = simpleRejectingPromise(10);
  p.then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});
