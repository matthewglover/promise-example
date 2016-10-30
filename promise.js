
export const compose = (f, g) => x => f(g(x));

export default class Promise {
  constructor(f) {
    this.__resolvers = [];
    this.__rejectors = [];
    f(this.__resolve.bind(this), this.__reject.bind(this));
  }

  then(resolve, reject) {
    this.__resolvers.push(resolve);
    this.__rejectors.push(reject);
  }

  __resolve(value) {
    this.__resolvers.forEach(f => f(value));
  }

  __reject(error) {
    this.__rejectors.forEach(f => f(error));
  }
}
