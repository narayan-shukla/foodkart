import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const loginUser = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  if (!validator.isEmail(email) || typeof password !== 'string') return res.status(400).json({ success: false, message: 'Enter a valid email and password' });
  const user = await userModel.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  res.json({ success: true, token: createToken(user.id), role: user.role });
};
const registerUser = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  if (name.length < 2 || name.length > 80 || !validator.isEmail(email) || typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: 'Enter a name, valid email, and password of at least 8 characters' });
  if (await userModel.exists({ email })) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  const user = await userModel.create({ name, email, password: await bcrypt.hash(password, 12) });
  res.status(201).json({ success: true, token: createToken(user.id), role: user.role });
};
export { loginUser, registerUser };
