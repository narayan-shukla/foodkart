import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173,http://localhost:5174').split(',').map((origin) => origin.trim());
const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads');
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/images', express.static(uploadsDir));
app.use('/api/food', foodRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.get('/', (_req, res) => res.json({ name: 'FoodKart API', status: 'ok' }));
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Internal server error' });
});

connectDB().then(() => app.listen(port, () => console.log(`FoodKart API listening on ${port}`))).catch((error) => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});
