// src/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
  res.send('Real-time Collaboration API');
});

module.exports = app;
