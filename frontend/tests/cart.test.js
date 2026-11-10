import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartSubtotal } from '../src/utils/cart.js';

test('calculates subtotal from available products and quantities', () => {
  const foods = [{ _id: 'a', price: 10 }, { _id: 'b', price: 2.5 }];
  assert.equal(calculateCartSubtotal({ a: 2, b: 3 }, foods), 27.5);
});

test('ignores missing products and invalid quantities during loading', () => {
  assert.equal(calculateCartSubtotal({ missing: 2, a: -1, b: 1.5 }, [{ _id: 'a', price: 9 }, { _id: 'b', price: 5 }]), 0);
});
