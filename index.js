const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Voyageia App is running!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Voyageia App listening at http://localhost:${port}`);
});
