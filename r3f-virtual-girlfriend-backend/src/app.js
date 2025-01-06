require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { initializeSystem } = require('./utils/setup');
const app = express();

// FFmpeg setup - make sure ffmpeg is in your system PATH
// You can also set the ffmpeg path manually if needed:
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

// Update CORS configuration to allow all origins in development
app.use(cors({
  origin: '*',  // Be more restrictive in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the audios directory
app.use('/audios', express.static(path.join(__dirname, '..', 'audios')));

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/chat', require('./routes/chat'));
app.use('/tts', require('./routes/tts'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message 
  });
});

// Initialize system before starting the server
initializeSystem().then(() => {
  // Start server
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize system:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
}); 