const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/initiatives
router.get('/', authMiddleware, async (req, res) => {
  const { status, business_unit_id, search } = req.query;
  const userId = req.user.id;

  try {
    let query = `
      SELECT i.*, bu.name AS business_unit_name
      FROM initiatives i
      LEFT JOIN business_units bu ON i.business_unit_id = bu.id
      WHERE i.user_id = $1
    `;
    const params = [userId];
    let paramIdx = 2;

    if (status) {
      query += ` AND i.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (business_unit_id) {
      query += ` AND i.business_unit_id = $${paramIdx}`;
      params.push(business_unit_id);
      paramIdx++;
    }

    if (search) {
      query += ` AND (i.name ILIKE $${paramIdx} OR i.description ILIKE $${paramIdx} OR i.owner ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ' ORDER BY i.updated_at DESC';

    const result = await pool.query(query, params);
    res.json({ initiatives: result.rows });
  } catch (err) {
    console.error('List initiatives error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/initiatives/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT i.*, bu.name AS business_unit_name
       FROM initiatives i
       LEFT JOIN business_units bu ON i.business_unit_id = bu.id
       WHERE i.id = $1 AND i.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    res.json({ initiative: result.rows[0] });
  } catch (err) {
    console.error('Get initiative error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/initiatives
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, owner, business_unit_id, priority, status, type } = req.body;
  const userId = req.user.id;

  if (!name || !owner || !priority || !type) {
    return res.status(400).json({ error: 'Name, owner, priority and type are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO initiatives (name, description, owner, business_unit_id, priority, status, type, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        description || null,
        owner,
        business_unit_id || null,
        priority,
        status || 'Requested',
        type,
        userId,
      ]
    );

    const initiative = result.rows[0];

    // Fetch business unit name
    if (initiative.business_unit_id) {
      const buResult = await pool.query(
        'SELECT name FROM business_units WHERE id = $1',
        [initiative.business_unit_id]
      );
      initiative.business_unit_name = buResult.rows[0]?.name || null;
    } else {
      initiative.business_unit_name = null;
    }

    res.status(201).json({ initiative });
  } catch (err) {
    console.error('Create initiative error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/initiatives/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, description, owner, business_unit_id, priority, status, type } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id FROM initiatives WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    const result = await pool.query(
      `UPDATE initiatives
       SET name = COALESCE($1, name),
           description = $2,
           owner = COALESCE($3, owner),
           business_unit_id = $4,
           priority = COALESCE($5, priority),
           status = COALESCE($6, status),
           type = COALESCE($7, type),
           updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, description || null, owner, business_unit_id || null, priority, status, type, id, userId]
    );

    const initiative = result.rows[0];

    if (initiative.business_unit_id) {
      const buResult = await pool.query(
        'SELECT name FROM business_units WHERE id = $1',
        [initiative.business_unit_id]
      );
      initiative.business_unit_name = buResult.rows[0]?.name || null;
    } else {
      initiative.business_unit_name = null;
    }

    res.json({ initiative });
  } catch (err) {
    console.error('Update initiative error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/initiatives/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM initiatives WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    res.json({ message: 'Initiative deleted successfully' });
  } catch (err) {
    console.error('Delete initiative error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
