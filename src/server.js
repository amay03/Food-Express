import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

import menuRouter from './routes/menu.js';
import orderRouter from './routes/order.js';
import deliveryRouter from './routes/delivery.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic security headers
app.use(helmet());

// Logging
app.use(morgan('dev'));

// JSON body parsing
app.use(express.json());

// Serve static frontend files from existing folders
const projectRoot = path.resolve(__dirname, '..');
app.use('/CSS', express.static(path.join(projectRoot, 'CSS')));
app.use('/JS', express.static(path.join(projectRoot, 'JS')));
app.use('/HTML', express.static(path.join(projectRoot, 'HTML')));
app.use('/images', express.static(path.join(projectRoot, 'images')));

// Serve index.html by default from HTML directory
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'HTML', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/menu', menuRouter);
app.use('/order', orderRouter);
app.use('/delivery-time', deliveryRouter);

// 404 for API
app.use((req, res, next) => {
  if (req.path.startsWith('/menu') || req.path.startsWith('/order') || req.path.startsWith('/delivery-time')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return next();
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Basic error logging
  // Avoid leaking stack in production
  const isProd = process.env.NODE_ENV === 'production';
  // eslint-disable-next-line no-console
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isProd ? undefined : err.message,
  });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodexpress';
const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
    });
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();



