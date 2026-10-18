import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import { requireAuth } from './middleware/auth.js';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}

const app = express();
const port = Number(process.env.PORT) || 5000;

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }));
app.use('/api/auth', authRoutes);
app.use('/api/employees', requireAuth, employeeRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () => {
  console.log(`People API listening on port ${port}`);
});
