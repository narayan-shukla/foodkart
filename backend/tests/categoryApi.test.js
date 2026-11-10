import test from 'node:test';
import assert from 'node:assert/strict';
import categoryModel from '../models/categoryModel.js';
import foodModel from '../models/foodModel.js';
import { createCategory, deleteCategory, renameCategory } from '../controllers/categoryController.js';

function response() {
  return { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test('category API rejects non-admin writes and reports duplicate names', async (t) => {
  const oldExists = categoryModel.exists;
  const oldCreate = categoryModel.create;
  t.after(() => { categoryModel.exists = oldExists; categoryModel.create = oldCreate; });
  const denied = response();
  await createCategory({ user: { role: 'user' }, body: { name: 'Sides' } }, denied);
  assert.equal(denied.code, 403);
  categoryModel.exists = async () => true;
  const duplicate = response();
  await createCategory({ user: { role: 'admin' }, body: { name: 'Sides' } }, duplicate);
  assert.equal(duplicate.code, 409);
});

test('category delete refuses categories still used by menu items', async (t) => {
  const oldFind = categoryModel.findById;
  const oldFoodExists = foodModel.exists;
  t.after(() => { categoryModel.findById = oldFind; foodModel.exists = oldFoodExists; });
  categoryModel.findById = async () => ({ _id: 'cat-1', name: 'Sides' });
  foodModel.exists = async () => true;
  const result = response();
  await deleteCategory({ user: { role: 'admin' }, params: { id: 'cat-1' } }, result);
  assert.equal(result.code, 409);
  assert.match(result.body.message, /Move or remove menu items/);
});

test('renaming a category moves matching menu items', async (t) => {
  const oldFind = categoryModel.findById;
  const oldExists = categoryModel.exists;
  const oldUpdateMany = foodModel.updateMany;
  let moved = false;
  const category = { _id: 'cat-1', id: 'cat-1', name: 'Sides', key: 'sides', async save() {} };
  categoryModel.findById = async () => category;
  categoryModel.exists = async () => false;
  foodModel.updateMany = async (filter, update) => { moved = filter.category === 'Sides' && update.$set.category === 'Small Plates'; };
  t.after(() => { categoryModel.findById = oldFind; categoryModel.exists = oldExists; foodModel.updateMany = oldUpdateMany; });
  const result = response();
  await renameCategory({ user: { role: 'admin' }, params: { id: 'cat-1' }, body: { name: 'Small Plates' } }, result);
  assert.equal(result.code, 200);
  assert.equal(moved, true);
  assert.equal(category.name, 'Small Plates');
});
