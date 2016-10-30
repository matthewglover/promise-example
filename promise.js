
export const compose = (f, g) => x => f(g(x));

const identity = x => x;

const defaultToIdentity = f =>
  (typeof f === 'function'
    ? f
    : identity);

const tryCatch = (handleError, v) => (f) => {
  try {
    f(v);
  } catch (error) {
    handleError(error);
  }
};

const allResolved = promises => promises.every(p => p.__resolved);

const resolvePromises = promises =>
  promises.reduce(
    (acc, p) => {
      let value;
      p.then((v) => { value = v; });
      return acc.concat(value);
    }, []);

const runOnce = (f) => {
  let hasRun = false;
  return (...args) => {
    if (hasRun) return;
    hasRun = true;
    return f(...args);  // eslint-disable-line consistent-return
  };
};


export default class Promise {
  constructor(f) {
    this.__pending = true;
    this.__resolvers = [];
    this.__rejectors = [];
    f(this.__resolve.bind(this), this.__reject.bind(this));
  }

  then(resolve, reject) {
    const _resolve = defaultToIdentity(resolve);
    const _reject = defaultToIdentity(reject);

    return this.__pending
      ? this.__thenPending(_resolve, _reject)
      : this.__thenDone(_resolve, _reject);
  }

  catch(reject) {
    return this.then(undefined, reject);
  }

  __thenPending(resolve, reject) {
    return new Promise((_resolve, _reject) => {
      this.__resolvers.push(compose(_resolve, resolve));
      this.__rejectors.push(compose(_reject, reject));
    });
  }

  __thenDone(resolve, reject) {
    return new Promise((_resolve, _reject) => {
      const __resolve = compose(_resolve, resolve);
      const __reject = compose(_reject, reject);
      if (this.__resolved) tryCatch(__reject, this.__value)(__resolve);
      else __reject(this.__error);
    });
  }

  __resolve(value) {
    if (value instanceof Promise) {
      value.then(this.__resolve.bind(this), this.__reject.bind(this));
    } else {
      this.__pending = false;
      this.__resolved = true;
      this.__value = value;
      this.__resolvers.forEach(tryCatch(this.__reject.bind(this), value));
    }
  }

  __reject(error) {
    this.__pending = false;
    this.__resolved = false;
    this.__error = error;
    this.__rejectors.forEach(f => f(error));
  }
}

Promise.resolve = value =>
  new Promise(resolve => resolve(value));

Promise.reject = error =>
  new Promise((resolve, reject) => reject(error));

Promise.all = promises =>
  new Promise((resolve, reject) => {
    const _resolve = runOnce(compose(resolve, resolvePromises));

    const tryResolve = () => {
      if (allResolved(promises)) _resolve(promises);
    };

    promises.forEach(p => p.then(tryResolve, reject));
  });
