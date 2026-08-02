const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get translations
router.get('/', (req, res) => {
  try {
    const translationsFilePath = path.join(__dirname, '../../frontend/src/data/translations.json');
    console.log('Reading translations from:', translationsFilePath);
    
    if (!fs.existsSync(translationsFilePath)) {
      console.error('Translations file does not exist at:', translationsFilePath);
      return res.status(404).json({ error: 'Translations file not found' });
    }
    
    const translations = JSON.parse(fs.readFileSync(translationsFilePath, 'utf8'));
    console.log('Successfully read translations');
    res.json(translations);
  } catch (error) {
    console.error('Error reading translations:', error);
    res.status(500).json({ error: 'Failed to read translations', details: error.message });
  }
});

// POST route to save new translations
router.post('/', (req, res) => {
  try {
    const { text, translations } = req.body;
    console.log('Received translation request for:', text, translations);
    
    if (!text || !translations) {
      console.error('Missing required fields:', { text, translations });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const translationsFilePath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'translations.json');
    console.log('Saving to translations file:', translationsFilePath);
    
    // Ensure the directory exists
    const dir = path.dirname(translationsFilePath);
    if (!fs.existsSync(dir)) {
      console.log('Creating directory:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read current translations or create new if file doesn't exist
    let currentTranslations;
    if (fs.existsSync(translationsFilePath)) {
      console.log('Reading existing translations file');
      currentTranslations = JSON.parse(fs.readFileSync(translationsFilePath, 'utf8'));
    } else {
      console.log('Creating new translations file');
      currentTranslations = { allergens: {} };
    }
    
    // Add new translation
    currentTranslations.allergens[text] = {
      ...currentTranslations.allergens[text],
      ...translations
    };
    
    // Write back to file
    writeTranslations(currentTranslations, translationsFilePath);

    res.json({ success: true, translations: currentTranslations });
  } catch (error) {
    console.error('Error saving translation:', error);
    res.status(500).json({ 
      error: 'Failed to save translation', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Helper function to write translations to the JSON file
const writeTranslations = (translations, filePath) => {
  try {
    console.log('Writing translations to:', filePath);
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('Created directory:', dir);
    }

    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
    console.log('Successfully saved translation'); // This log is now inside writeTranslations
  } catch (error) {
    console.error('Error writing to translations.json:', error);
  }
};

module.exports = router; 