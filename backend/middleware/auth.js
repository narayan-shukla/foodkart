import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export default async function authMiddleware(req, res, next) {
  const token = req.get('token') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(payload.id).select('_id role');
    if (!user) return res.status(401).json({ success: false, message: 'Account no longer exists' });
    req.user = user;
    req.body ||= {};
    req.body.userId = user.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
