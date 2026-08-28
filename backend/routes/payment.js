const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');
const router = express.Router();

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// POST /api/payment/create - Crear preferencia de pago en Mercado Pago
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { items } = req.body; // [{title, unit_price, quantity, productId}]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

    // Crear orden en la base de datos
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [req.userId, total, 'pending']
    );
    const orderId = orderResult.insertId;

    // Insertar items de la orden
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.unit_price]
      );
    }

    // Crear preferencia en Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map(i => ({
          title: i.title,
          unit_price: Number(i.unit_price),
          quantity: i.quantity,
          currency_id: 'ARS'
        })),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/ordenes.html?status=success`,
          failure: `${process.env.FRONTEND_URL}/ordenes.html?status=failure`,
          pending: `${process.env.FRONTEND_URL}/ordenes.html?status=pending`
        },
        auto_return: 'approved',
        external_reference: String(orderId)
      }
    });

    // Guardar el ID de preferencia
    await pool.query(
      'UPDATE orders SET mp_preference_id = ? WHERE id = ?',
      [result.id, orderId]
    );

    res.json({
      init_point: result.init_point,
      orderId,
      message: 'Preferencia de pago creada'
    });
  } catch (err) {
    console.error('Error al crear preferencia MP:', err);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
});

module.exports = router;
