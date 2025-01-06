const express = require('express');
const router = express.Router();
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const voice = require('elevenlabs-node');
const fs = require('fs').promises;

// Get API key from environment variables
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.VOICE_ID || "kgG7dCoKCfLehAPWkJOE"; // Default voice ID

// Helper function to process audio with FFmpeg
const processAudio = (inputPath, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (options.format) {
      command = command.toFormat(options.format);
    }

    if (options.bitrate) {
      command = command.audioBitrate(options.bitrate);
    }

    if (options.channels) {
      command = command.audioChannels(options.channels);
    }

    if (options.sampleRate) {
      command = command.audioFrequency(options.sampleRate);
    }

    command
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

// Convert text to speech
router.post('/convert', async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Generate a unique filename using timestamp
    const timestamp = Date.now();
    const fileName = `tts_${timestamp}`;
    const mp3Path = path.join(__dirname, '..', '..', 'audios', `${fileName}.mp3`);
    const wavPath = path.join(__dirname, '..', '..', 'audios', `${fileName}.wav`);

    // Convert text to speech using ElevenLabs
    await voice.textToSpeech(elevenLabsApiKey, voiceID, mp3Path, text);

    // Convert to WAV if requested
    if (options.format === 'wav') {
      await processAudio(mp3Path, wavPath, {
        format: 'wav',
        bitrate: options.bitrate || '192k',
        channels: options.channels || 2,
        sampleRate: options.sampleRate || 44100
      });
    }

    // Return the audio file URLs
    res.json({
      success: true,
      mp3Url: `/audios/${fileName}.mp3`,
      ...(options.format === 'wav' && { wavUrl: `/audios/${fileName}.wav` })
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      error: 'Failed to convert text to speech',
      message: error.message 
    });
  }
});

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    const voices = await voice.getVoices(elevenLabsApiKey);
    res.json(voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch voices',
      message: error.message 
    });
  }
});

module.exports = router; 