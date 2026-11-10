import express from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import authMiddleware from '../middleware/auth.js';

const foodRouter = express.Router();
const storage = multer.diskStorage({ destination: 'uploads', filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) });
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) });
foodRouter.post('/add', authMiddleware, upload.single('image'), addFood);
foodRouter.get('/list', listFood);
foodRouter.post('/remove', authMiddleware, removeFood);
foodRouter.post('/update', authMiddleware, upload.single('image'), updateFood);
export default foodRouter;
