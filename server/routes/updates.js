const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/initiatives/:initiativeId/updates
router.get('/', authMiddleware, async (req, res) => {
  const { initiativeId } = req.params;
  const userId = req.user.id;

  try {
    // Verify initiative belongs to user
    const initiative = await pool.query(
      'SELECT id FROM initiatives WHERE id = $1 AND user_id = $2',
      [initiativeId, userId]
    );

    if (initiative.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    const result = await pool.query(
      'SELECT * FROM updates WHERE initiative_id = $1 ORDER BY created_at DESC',
      [initiativeId]
    );

    res.json({ updates: result.rows });
  } catch (err) {
    console.error('List updates error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/initiatives/:initiativeId/updates
router.post('/', authMiddleware, async (req, res) => {
  const { initiativeId } = req.params;
  const userId = req.user.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    // Verify initiative belongs to user
    const initiative = await pool.query(
      'SELECT id FROM initiatives WHERE id = $1 AND user_id = $2',
      [initiativeId, userId]
    );

    if (initiative.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    const result = await pool.query(
      'INSERT INTO updates (initiative_id, content) VALUES ($1, $2) RETURNING *',
      [initiativeId, content.trim()]
    );

    // Update initiative updated_at
    await pool.query(
      'UPDATE initiatives SET updated_at = NOW() WHERE id = $1',
      [initiativeId]
    );

    res.status(201).json({ update: result.rows[0] });
  } catch (err) {
    console.error('Create update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/initiatives/:initiativeId/updates/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const { initiativeId, id } = req.params;
  const userId = req.user.id;

  try {
    // Verify initiative belongs to user
    const initiative = await pool.query(
      'SELECT id FROM initiatives WHERE id = $1 AND user_id = $2',
      [initiativeId, userId]
    );

    if (initiative.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    const result = await pool.query(
      'DELETE FROM updates WHERE id = $1 AND initiative_id = $2 RETURNING id',
      [id, initiativeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    res.json({ message: 'Update deleted successfully' });
  } catch (err) {
    console.error('Delete update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
