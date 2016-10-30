
export const compose = (f, g) => x => f(g(x));

const identity = x => x;

const defaultToIdentity = f =>
  (typeof f === 'function'
    ? f
    : identity);

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

  __thenPending(resolve, reject) {
    return new Promise((_resolve, _reject) => {
      this.__resolvers.push(compose(_resolve, resolve));
      this.__rejectors.push(compose(_reject, reject));
    });
  }

  __thenDone(resolve, reject) {
    return new Promise((_resolve, _reject) => {
      if (this.__resolved) compose(_resolve, resolve)(this.__value);
      else compose(_reject, reject)(this.__error);
    });
  }

  __resolve(value) {
    if (value instanceof Promise) {
      value.then(this.__resolve.bind(this), this.__reject.bind(this));
    } else {
      this.__pending = false;
      this.__resolved = true;
      this.__value = value;
      this.__resolvers.forEach(f => f(value));
    }
  }

  __reject(error) {
    this.__pending = false;
    this.__resolved = false;
    this.__error = error;
    this.__rejectors.forEach(f => f(error));
  }
}
