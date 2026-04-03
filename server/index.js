const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const businessUnitsRoutes = require('./routes/businessUnits');
const initiativesRoutes = require('./routes/initiatives');
const updatesRoutes = require('./routes/updates');
const nextStepsRoutes = require('./routes/nextSteps');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/business-units', businessUnitsRoutes);
app.use('/api/initiatives', initiativesRoutes);
app.use('/api/initiatives/:initiativeId/updates', updatesRoutes);
app.use('/api/initiatives/:initiativeId/next-steps', nextStepsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`PulsePoint server running on http://localhost:${PORT}`);
});

module.exports = app;
