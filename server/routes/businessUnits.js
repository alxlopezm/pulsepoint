const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/business-units
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM business_units ORDER BY name ASC'
    );
    res.json({ businessUnits: result.rows });
  } catch (err) {
    console.error('Business units error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
