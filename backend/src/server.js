import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes (to be implemented)
app.use('/api/auth', (req, res) => res.status(404).json({ error: 'Auth routes not implemented' }));
app.use('/api/posts', (req, res) => res.status(404).json({ error: 'Post routes not implemented' }));
app.use('/api/adoptions', (req, res) => res.status(404).json({ error: 'Adoption routes not implemented' }));
app.use('/api/products', (req, res) => res.status(404).json({ error: 'Product routes not implemented' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
