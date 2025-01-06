const express = require('express');
const router = express.Router();
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const voice = require('elevenlabs-node');

// Get API keys from environment variables
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.VOICE_ID || "kgG7dCoKCfLehAPWkJOE"; // Default voice ID

// Helper function to process audio with FFmpeg
const processAudio = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

// Helper function to generate lip sync data
const generateLipSync = async (wavFile) => {
  // This is a placeholder for lip sync generation
  // You'll need to implement your own lip sync logic or use a third-party service
  return {
    metadata: {
      soundFile: wavFile,
      duration: 0
    },
    mouthCues: []
  };
};

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate a unique ID for this message
    const messageId = Date.now();
    const audioFileName = `message_${messageId}`;
    const mp3Path = path.join(__dirname, '..', '..', 'audios', `${audioFileName}.mp3`);
    const wavPath = path.join(__dirname, '..', '..', 'audios', `${audioFileName}.wav`);

    // Convert text to speech using ElevenLabs
    await voice.textToSpeech(elevenLabsApiKey, voiceID, mp3Path, message);

    // Convert MP3 to WAV for lip sync processing
    await processAudio(mp3Path, wavPath);

    // Generate lip sync data
    const lipSyncData = await generateLipSync(wavPath);

    // Return the response
    res.json({
      success: true,
      message: message,
      audio: `/audios/${audioFileName}.mp3`,
      lipSync: lipSyncData
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message
    });
  }
});

module.exports = router;