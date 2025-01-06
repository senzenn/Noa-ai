# R3F Virtual Girlfriend Backend

Backend server for the R3F Virtual Girlfriend project with FFmpeg and ElevenLabs integration.

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- ElevenLabs API key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your ElevenLabs API key and other configurations

## FFmpeg Setup

Make sure FFmpeg is installed on your system:

### Windows
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Add FFmpeg to your system PATH or set the path in `.env`

### Linux
```bash
sudo apt update
sudo apt install ffmpeg
```

### macOS
```bash
brew install ffmpeg
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Text to Speech
- POST `/tts/convert`
  ```json
  {
    "text": "Text to convert to speech",
    "options": {
      "format": "wav",  // optional, defaults to mp3
      "bitrate": "192k",  // optional
      "channels": 2,  // optional
      "sampleRate": 44100  // optional
    }
  }
  ```

### Chat
- POST `/chat`
  ```json
  {
    "message": "Your message here"
  }
  ```

### Voice List
- GET `/tts/voices`

## Environment Variables

- `PORT`: Server port (default: 3001)
- `ELEVEN_LABS_API_KEY`: Your ElevenLabs API key
- `VOICE_ID`: ElevenLabs voice ID (optional)
- `FFMPEG_PATH`: Path to FFmpeg executable (optional)
- `FFPROBE_PATH`: Path to FFprobe executable (optional)

## License

MIT 