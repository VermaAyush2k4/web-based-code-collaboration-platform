// src/server.js
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
const { setupWebSocket } = require('./socket/socket');

dotenv.config();

const server = http.createServer(app);

setupWebSocket(server);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  // Start the server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
