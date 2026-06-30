const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();

// Logs directory inside the container — this is the bind mount target
const logsDir = path.join(__dirname, 'logs');
const logFilePath = path.join(logsDir, 'error.log');

function writeLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(logFilePath, line, (err) => {
    if (err) console.error('Failed to write log file:', err);
  });
}

// SABOTAGE 1: Expects a very specific environment variable name!
const dbUri = process.env.DATABASE_URI || 'mongodb://localhost:27017/phoenix';

mongoose.connect(dbUri)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => {
    console.error('Failed to connect:', err);
    writeLog(`CRITICAL: Failed to connect to MongoDB - ${err.message}`);
  });

// FIXED: Vite builds the frontend into 'dist', so Express must serve from there.
const uiPath = path.join(__dirname, 'dist'); 
app.use(express.static(uiPath));

app.get('/api/health', (req, res) => {
  writeLog('Health check hit: API is alive');
  res.json({ status: 'API is alive' });
});

app.listen(5000, () => console.log('Server running on port 5000'));