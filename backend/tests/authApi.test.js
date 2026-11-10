import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import authMiddleware from '../middleware/auth.js';

process.env.JWT_SECRET = 'test-only-jwt-secret';

 test('HTTP auth route rejects anonymous users and honors token roles over request bodies', async (t) => {
  const originalFindById = userModel.findById;
  userModel.findById = (id) => ({ select: async () => ({ id, role: id === 'admin-1' ? 'admin' : 'user' }) });
  t.after(() => { userModel.findById = originalFindById; });

  const app = express();
  app.use(express.json());
  app.post('/admin-only', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false });
    return res.json({ success: true, userId: req.body.userId });
  });
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const anonymous = await fetch(`${base}/admin-only`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(anonymous.status, 401);

  const userToken = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET, { expiresIn: '2m' });
  const forgedRole = await fetch(`${base}/admin-only`, { method: 'POST', headers: { 'content-type': 'application/json', token: userToken }, body: JSON.stringify({ userId: 'admin-1' }) });
  assert.equal(forgedRole.status, 403);

  const adminToken = jwt.sign({ id: 'admin-1' }, process.env.JWT_SECRET, { expiresIn: '2m' });
  const adminResponse = await fetch(`${base}/admin-only`, { method: 'POST', headers: { 'content-type': 'application/json', token: adminToken }, body: '{}' });
  assert.equal(adminResponse.status, 200);
  assert.equal((await adminResponse.json()).userId, 'admin-1');
});
