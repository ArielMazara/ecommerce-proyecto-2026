const express = require('express');
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// POST /api/orders - Crear orden (protegido con JWT)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, total } = req.body; // items: [{productId, quantity, price}]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Crear orden
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [req.userId, total, 'pending']
    );
    const orderId = orderResult.insertId;

    // Insertar items y descontar stock
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
      await pool.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    res.status(201).json({ orderId, message: 'Orden creada exitosamente' });
  } catch (err) {
    console.error('Error al crear orden:', err);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

// GET /api/orders/my-orders - Mis órdenes (protegido con JWT)
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.userId]
    );
    res.json(orders);
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
});

module.exports = router;
