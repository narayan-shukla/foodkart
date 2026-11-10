import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCategoryName } from '../utils/category.js';

test('normalizes whitespace in category names', () => {
  assert.equal(validateCategoryName('  Fresh   Pasta  '), 'Fresh Pasta');
  assert.equal(validateCategoryName('Café & Tea'), 'Café & Tea');
});

test('rejects short, long, or unsafe category names', () => {
  assert.equal(validateCategoryName('x'), null);
  assert.equal(validateCategoryName('x'.repeat(41)), null);
  assert.equal(validateCategoryName('Lunch<script>'), null);
  assert.equal(validateCategoryName(17), null);
});
