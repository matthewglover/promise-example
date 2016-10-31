# Building a promise implementation


## What

An A+ Promise implementation

## How

Using ES6 and TDD

## Why

To learn about Promises and how they work.

# Requirements

- Basic callbacks: Promise.then should call resolve/reject when an async function resolves/rejects

- Synchronous callbacks: Promise.then should call resolve/reject when a sync function resolves/rejects

- Return a Promise - Promise.then should return a Promise

- Default arguments - Promise.then should use identity function if called with a non-function argument

- Then asynchronous chains - Promise.then should chain asynchronous handlers (i.e. should accept both: `a -> b` and `a -> Promise b error`, returning a `Promise b error` for both)

- Promise.catch - should be able to just handle errors

- Promise.resolve - should wrap given value in a resolving promise

- Promise.reject - should wrap given error in a rejecting promise

- Promise.then - sync handler errors should propagate

- Promise.all - resolves takes an array of Promises and returns a Promise resolving to the results of all Promises

- Promise.race - takes iterable of Promises and resolves to value of first promise to resolve
