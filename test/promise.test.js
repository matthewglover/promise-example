import test from 'ava';
import Promise, { compose } from '../promise';

const addOne = x => x + 1;
const timesTwo = x => x * 2;
const identity = x => x;

const testError = new Error('Test error');

const asyncFn = (x, cb) => setTimeout(() => cb(x * 2), 1);
const variableAsyncFn = (x, delay, cb) => setTimeout(() => cb(x), delay);
const asyncErrorFn = cb => setTimeout(() => cb(testError), 1);
const syncError = () => {
  throw testError;
};

const variableResolvingPromise = (x, delay) =>
  new Promise(resolve => variableAsyncFn(x, delay, resolve));

const simpleResolvingPromise = x =>
  new Promise(resolve => asyncFn(x, resolve));

const simpleRejectingPromise = () =>
  new Promise((resolve, reject) => asyncErrorFn(reject));

const simpleResolvedPromise = x =>
  new Promise(resolve => resolve(x * 2));

const simpleRejectedPromise = () =>
    new Promise((resolve, reject) => reject(testError));

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

test.cb('Promise.then takes a resolve handler which receives resolved value', (t) => {
  t.plan(1);
  const p = simpleResolvingPromise(10);
  p.then((x) => {
    t.is(x, 20);
    t.end();
  });
});

test.cb('Promise.then takes a reject handler which receives rejected error', (t) => {
  t.plan(1);
  const p = simpleRejectingPromise();
  p.then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.then calls resolve handler when resolved value already received', (t) => {
  t.plan(1);
  const p = simpleResolvedPromise(10);
  p.then((x) => {
    t.is(x, 20);
    t.end();
  });
});

test.cb('Promise.then calls reject handler when rejected error already received', (t) => {
  t.plan(1);
  const p = simpleRejectedPromise();
  p.then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test('Promise.then returns a Promise (resolving/rejecting promise)', (t) => {
  const p = simpleResolvingPromise(10);
  const q = simpleRejectingPromise();
  t.true(p.then(addOne) instanceof Promise);
  t.true(q.then(addOne, identity) instanceof Promise);
});

test('Promise.then returns a Promise (resolved/rejected promise)', (t) => {
  const p = simpleResolvedPromise(10);
  const q = simpleRejectedPromise();
  t.true(p.then(addOne) instanceof Promise);
  t.true(q.then(addOne, identity) instanceof Promise);
});

test.cb('Promise.then uses identity function if called with any non-function arguments (resolving)', (t) => {
  const p = simpleResolvingPromise(10);
  p.then().then('blah', 'blah').then((x) => {
    t.is(x, 20);
    t.end();
  });
});

test.cb('Promise.then uses identity function if called with any non-function arguments (resolved)', (t) => {
  const p = simpleResolvedPromise(10);
  p.then().then('blah', 'blah').then((x) => {
    t.is(x, 20);
    t.end();
  });
});

test.cb('Promise.then uses identity function if called with any non-function arguments (rejecting)', (t) => {
  const q = simpleRejectingPromise();
  q.then().then('blah', 'blah').then(null, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.then uses identity function if called with any non-function arguments (rejected)', (t) => {
  const q = simpleRejectedPromise();
  q.then().then('blah', 'blah').then(null, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.then accepts a -> Promise b resolve handler (resolving)', (t) => {
  const p = simpleResolvingPromise(10);
  p.then(simpleResolvingPromise).then((x) => {
    t.is(x, 40);
    t.end();
  });
});

test.cb('Promise.then accepts a -> Promise b resolve handler (resolved)', (t) => {
  const p = simpleResolvedPromise(10);
  p.then(simpleResolvedPromise).then((x) => {
    t.is(x, 40);
    t.end();
  });
});

test.cb('Promise.then propagates sync errors (resolving)', (t) => {
  const p = simpleResolvingPromise(10);
  p.then(syncError).then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.then propagates sync errors (resolved)', (t) => {
  const p = simpleResolvedPromise(10);
  p.then(syncError).then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.catch captures errors (rejecting)', (t) => {
  const p = simpleRejectingPromise();
  p.catch((error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.catch captures errors (rejected)', (t) => {
  const p = simpleRejectedPromise();
  p.catch((error) => {
    t.is(error, testError);
    t.end();
  });
});

test('Promise.catch returns a Promise', (t) => {
  const p = simpleRejectingPromise();
  const q = simpleRejectedPromise();
  t.plan(2);
  t.true(p.catch() instanceof Promise);
  t.true(q.catch() instanceof Promise);
});

test.cb('Promise.resolve returns a Promise resolving to provided value', (t) => {
  const p = Promise.resolve(10);
  t.plan(2);
  t.true(p instanceof Promise);
  p.then((value) => {
    t.is(value, 10);
    t.end();
  });
});

test.cb('Promise.reject returns a Promise rejecting to provided error', (t) => {
  const p = Promise.reject(testError);
  t.plan(2);
  t.true(p instanceof Promise);
  p.then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.all takes an array of promises and returns a promise resolving to an array of resolved values', (t) => {
  const p = Promise.all([Promise.resolve(10), Promise.resolve(20), Promise.resolve(30)]);
  t.plan(2);
  t.true(p instanceof Promise);
  p.then((value) => {
    t.deepEqual(value, [10, 20, 30]);
    t.end();
  });
});

test.cb('Promise.all works with values resolving at different times', (t) => {
  const p =
    Promise.all([
      variableResolvingPromise(10, 100),
      variableResolvingPromise(20, 1000),
      variableResolvingPromise(30, 900)]);

  p.then((value) => {
    t.deepEqual(value, [10, 20, 30]);
    t.end();
  });
});

test.cb('Promise.all rejects with error if any promise rejects', (t) => {
  const p = Promise.all([Promise.resolve(10), Promise.resolve(20), Promise.reject(testError)]);

  p.then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.all rejects with first error to reject', (t) => {
  const customError = new Error('Custom error');
  const p = Promise.all([simpleRejectingPromise(), Promise.reject(customError)]);

  p.then(undefined, (error) => {
    t.is(error, customError);
    t.end();
  });
});

test.cb('Promise.race resolves with value of first resolving/rejecting promise in array', (t) => {
  const a = variableResolvingPromise(1, 100);
  const b = variableResolvingPromise(2, 10);
  const c = variableResolvingPromise(3, 90);

  const p = Promise.race([a, b, c]);

  p.then((value) => {
    t.is(value, 2);
    t.end();
  });
});

test.cb('Promise.race rejects with value of first resolving/rejecting promise in array', (t) => {
  const a = variableResolvingPromise(1, 100);
  const b = variableResolvingPromise(2, 10);
  const c = variableResolvingPromise(3, 90);
  const d = Promise.reject(testError);

  const p = Promise.race([a, b, c, d]);

  p.then(undefined, (error) => {
    t.is(error, testError);
    t.end();
  });
});

test.cb('Promise.race resolves with value of first resolving/rejecting promise in iterable', (t) => {
  function* promiseGenerator() {
    yield variableResolvingPromise(1, 100);
    yield variableResolvingPromise(2, 10);
    yield variableResolvingPromise(3, 90);
  }

  const p = Promise.race(promiseGenerator());

  p.then((value) => {
    t.is(value, 2);
    t.end();
  });
});
