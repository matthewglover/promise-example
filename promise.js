
export const compose = (f, g) => x => f(g(x));

export default class Promise {
  constructor(f) {
    this.__pending = true;
    this.__resolvers = [];
    this.__rejectors = [];
    f(this.__resolve.bind(this), this.__reject.bind(this));
  }

  then(resolve, reject) {
    return this.__pending
      ? this.__thenPending(resolve, reject)
      : this.__thenDone(resolve, reject);
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
    this.__pending = false;
    this.__resolved = true;
    this.__value = value;
    this.__resolvers.forEach(f => f(value));
  }

  __reject(error) {
    this.__pending = false;
    this.__resolved = false;
    this.__error = error;
    this.__rejectors.forEach(f => f(error));
  }
}
