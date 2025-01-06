const AudioSetup = require('./audioSetup');

async function initializeSystem() {
  try {
    console.log('Initializing system...');
    
    // Initialize audio setup
    const audioSetup = new AudioSetup();
    
    // Ensure audio directory exists
    await audioSetup.ensureAudioDirectory();
    
    // Generate welcome messages
    await audioSetup.generateWelcomeAudios();
    
    // Set up periodic cleanup (every 6 hours)
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    setInterval(() => {
      audioSetup.cleanupOldFiles()
        .catch(err => console.error('Error in cleanup:', err));
    }, SIX_HOURS);
    
    console.log('System initialization complete');
  } catch (error) {
    console.error('System initialization failed:', error);
    throw error;
  }
}

module.exports = { initializeSystem }; 