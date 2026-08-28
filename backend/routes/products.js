const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// GET /api/products - Listar todos los productos
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE stock > 0 ORDER BY created_at DESC'
    );
    res.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/:id - Producto por ID
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(products[0]);
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

module.exports = router;
