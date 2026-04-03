const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/initiatives/:initiativeId/next-steps
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
      'SELECT * FROM next_steps WHERE initiative_id = $1 ORDER BY created_at ASC',
      [initiativeId]
    );

    res.json({ nextSteps: result.rows });
  } catch (err) {
    console.error('List next steps error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/initiatives/:initiativeId/next-steps
router.post('/', authMiddleware, async (req, res) => {
  const { initiativeId } = req.params;
  const userId = req.user.id;
  const { title, responsible, due_date, start_date, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
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
      `INSERT INTO next_steps (initiative_id, title, responsible, due_date, start_date, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        initiativeId,
        title.trim(),
        responsible || null,
        due_date || null,
        start_date || null,
        status || 'pending',
      ]
    );

    res.status(201).json({ nextStep: result.rows[0] });
  } catch (err) {
    console.error('Create next step error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/initiatives/:initiativeId/next-steps/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { initiativeId, id } = req.params;
  const userId = req.user.id;
  const { title, responsible, due_date, start_date, completed_date, status } = req.body;

  try {
    // Verify initiative belongs to user
    const initiative = await pool.query(
      'SELECT id FROM initiatives WHERE id = $1 AND user_id = $2',
      [initiativeId, userId]
    );

    if (initiative.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    const existing = await pool.query(
      'SELECT id FROM next_steps WHERE id = $1 AND initiative_id = $2',
      [id, initiativeId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Next step not found' });
    }

    const result = await pool.query(
      `UPDATE next_steps
       SET title = COALESCE($1, title),
           responsible = $2,
           due_date = $3,
           start_date = $4,
           completed_date = $5,
           status = COALESCE($6, status)
       WHERE id = $7 AND initiative_id = $8
       RETURNING *`,
      [
        title || null,
        responsible || null,
        due_date || null,
        start_date || null,
        completed_date || null,
        status || null,
        id,
        initiativeId,
      ]
    );

    res.json({ nextStep: result.rows[0] });
  } catch (err) {
    console.error('Update next step error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/initiatives/:initiativeId/next-steps/:id
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
      'DELETE FROM next_steps WHERE id = $1 AND initiative_id = $2 RETURNING id',
      [id, initiativeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Next step not found' });
    }

    res.json({ message: 'Next step deleted successfully' });
  } catch (err) {
    console.error('Delete next step error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
