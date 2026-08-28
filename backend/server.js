require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware CORS - permite requests solo desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));

// Parsear JSON
app.use(express.json());

// ============================================
// RUTAS
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🍷 Viñeta Boutique API',
    status: 'online',
    version: '1.0.0'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Base de datos: ${process.env.DB_NAME || 'no configurada'}`);
});
