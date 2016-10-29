import test from 'ava';
import { compose } from '../promise';

const addOne = x => x + 1;
const timesTwo = x => x * 2;

test('compose combines two functions', (t) => {
  t.is(compose(addOne, timesTwo)(10), 21);
});

test('compose applies functions right to left', (t) => {
  t.is(compose(timesTwo, addOne)(10), 22);
});
