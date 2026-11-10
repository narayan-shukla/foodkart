import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrustedOrderItems, calculateOrderTotal } from '../utils/orderPricing.js';

test('uses database prices and computes delivery once', () => {
  const items = buildTrustedOrderItems([{ id: 'a', quantity: 2, price: 0.01 }], [{ _id: 'a', name: 'Dosa', price: 12.5 }]);
  assert.deepEqual(items, [{ _id: 'a', name: 'Dosa', price: 12.5, quantity: 2 }]);
  assert.deepEqual(calculateOrderTotal(items), { subtotal: 25, delivery: 2, amount: 27 });
});

test('rejects unknown products and invalid quantities', () => {
  assert.throws(() => buildTrustedOrderItems([{ id: 'missing', quantity: 1 }], []), /invalid item/);
  assert.throws(() => buildTrustedOrderItems([{ id: 'a', quantity: 0 }], [{ _id: 'a', name: 'Dosa', price: 12 }]), /invalid item/);
});
