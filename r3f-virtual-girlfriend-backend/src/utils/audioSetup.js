const fs = require('fs').promises;
const path = require('path');
const voice = require('elevenlabs-node');
const ffmpeg = require('fluent-ffmpeg');

// Default welcome messages to generate
const DEFAULT_MESSAGES = [
  "Hello! I'm your virtual girlfriend. How are you today?",
  "Welcome back! I've missed you.",
  "Hi there! It's so nice to see you again.",
  "Hey! I'm really happy you're here.",
];

class AudioSetup {
  constructor() {
    this.audioDir = path.join(__dirname, '..', '..', 'audios');
    this.elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
    this.voiceID = process.env.VOICE_ID || "kgG7dCoKCfLehAPWkJOE";
  }

  async ensureAudioDirectory() {
    try {
      await fs.access(this.audioDir);
    } catch (error) {
      console.log('Creating audios directory...');
      await fs.mkdir(this.audioDir, { recursive: true });
    }
  }

  async convertToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioChannels(2)
        .audioFrequency(44100)
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
  }

  async generateWelcomeAudios() {
    console.log('Generating welcome audio files...');
    
    for (let i = 0; i < DEFAULT_MESSAGES.length; i++) {
      const message = DEFAULT_MESSAGES[i];
      const baseFileName = `welcome_${i}`;
      const mp3Path = path.join(this.audioDir, `${baseFileName}.mp3`);
      const wavPath = path.join(this.audioDir, `${baseFileName}.wav`);

      try {
        // Check if files already exist
        try {
          await fs.access(mp3Path);
          await fs.access(wavPath);
          console.log(`Welcome audio ${i + 1} already exists, skipping...`);
          continue;
        } catch (error) {
          // Files don't exist, proceed with generation
        }

        console.log(`Generating welcome audio ${i + 1}...`);
        
        // Generate MP3 using ElevenLabs
        await voice.textToSpeech(this.elevenLabsApiKey, this.voiceID, mp3Path, message);
        
        // Convert to WAV
        await this.convertToWav(mp3Path, wavPath);
        
        console.log(`Welcome audio ${i + 1} generated successfully`);
      } catch (error) {
        console.error(`Error generating welcome audio ${i + 1}:`, error);
      }
    }
  }

  async cleanupOldFiles(maxAge = 24 * 60 * 60 * 1000) { // Default: 24 hours
    try {
      const files = await fs.readdir(this.audioDir);
      const now = Date.now();

      for (const file of files) {
        if (file.startsWith('welcome_')) continue; // Skip welcome messages

        const filePath = path.join(this.audioDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          await fs.unlink(filePath);
          console.log(`Deleted old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }
}

module.exports = AudioSetup; 