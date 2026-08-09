import translations from '../data/translations.json';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_CLIENT_BASE_URL}/api`;

// Function to get translation from cache
export const getTranslationFromCache = (text, language) => {
  if (!text || !language) return null;
  
  const normalizedText = text.trim();
  let allergenTranslations = translations.allergens[normalizedText];

  if (!allergenTranslations) {
    const foundKey = Object.keys(translations.allergens || {}).find(
      k => k.toLowerCase() === normalizedText.toLowerCase()
    );
    if (foundKey) {
      allergenTranslations = translations.allergens[foundKey];
    }
  }
  
  if (allergenTranslations && allergenTranslations[language]) {
    console.log('Found translation in cache:', normalizedText, language);
    return allergenTranslations[language];
  }
  
  return null;
};

// Function to save translation to cache
const saveTranslationToCache = async (text, newTranslations) => {
  try {
    const normalizedText = text.trim();
    console.log('Saving translation to cache:', normalizedText, newTranslations);
    
    // Get current translations from localStorage or use default
    const storedTranslations = localStorage.getItem('translations');
    const currentTranslations = storedTranslations ? JSON.parse(storedTranslations) : { allergens: {} };
    
    // Add new translation
    currentTranslations.allergens[normalizedText] = {
      ...currentTranslations.allergens[normalizedText],
      ...newTranslations
    };
    
    // Save to localStorage
    localStorage.setItem('translations', JSON.stringify(currentTranslations));
    console.log('Saved to localStorage');
    
    // Update in-memory translations
    translations.allergens[normalizedText] = currentTranslations.allergens[normalizedText];

    // Save to backend
    try {
      console.log('Saving to backend:', `${API_URL}/translations`);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/translations`,
        {
          text: normalizedText,
          translations: newTranslations
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Backend save response:', response.data);
    } catch (error) {
      console.error('Failed to save translation to backend:', error.response?.data || error.message);
      // Continue even if backend save fails
    }
  } catch (error) {
    console.error('Error saving translation to cache:', error);
  }
};

// Function to translate text using Google Translate API
export const translateWithGoogle = async (text, targetLang) => {
  try {
    console.log('Translating with Google:', text, targetLang);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      console.log('Translation successful:', data[0][0][0]);
      return data[0][0][0];
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.warn(`Translation failed for "${text}" to ${targetLang}:`, error);
    return text; // Return original text if translation fails
  }
};

// Main translation function that checks cache first
export const translateText = async (text, targetLang) => {
  if (!text) return '';
  
  // Check cache first
  const cachedTranslation = getTranslationFromCache(text, targetLang);
  if (cachedTranslation) {
    return cachedTranslation;
  }
  
  // If not in cache, use Google Translate
  let googleLang = targetLang;
  if (targetLang === 'hindi') googleLang = 'hi';
  if (targetLang === 'gujarati') googleLang = 'gu';
  if (targetLang === 'marathi') googleLang = 'mr';
  const translation = await translateWithGoogle(text, googleLang);
  
  // Save the new translation to cache
  if (translation !== text) {
    await saveTranslationToCache(text, {
      [targetLang]: translation
    });
  }
  
  return translation;
};

// Function to translate allergens with caching
export const translateAllergens = async (allergens) => {
  const translatedAllergens = {};

  for (const [category, items] of Object.entries(allergens)) {
    if (items.length === 0) {
      translatedAllergens[category] = []; // Keep original category name as key
      continue;
    }

    // Translate category name
    const translatedCategoryHindi = await translateText(category, 'hindi');
    const translatedCategoryGujarati = await translateText(category, 'gujarati');
    const translatedCategoryMarathi = await translateText(category, 'marathi');

    translatedAllergens[category] = []; // Keep original category name as key

    for (const item of items) {
      try {
        console.log('Translating allergen:', item.name);
        let hindiTranslation = getTranslationFromCache(item.name, 'hindi');
        let gujaratiTranslation = getTranslationFromCache(item.name, 'gujarati');
        let marathiTranslation = getTranslationFromCache(item.name, 'marathi');

        // Only use Google Translate if not in cache
        if (!hindiTranslation) {
          console.log('No Hindi cache, using Google Translate');
          hindiTranslation = await translateWithGoogle(item.name, 'hi');
        }
        
        if (!gujaratiTranslation) {
          console.log('No Gujarati cache, using Google Translate');
          gujaratiTranslation = await translateWithGoogle(item.name, 'gu');
        }

        if (!marathiTranslation) {
          console.log('No Marathi cache, using Google Translate');
          marathiTranslation = await translateWithGoogle(item.name, 'mr');
        }

        // Save new translations to cache (for allergen names)
        if (!getTranslationFromCache(item.name, 'hindi') || !getTranslationFromCache(item.name, 'gujarati') || !getTranslationFromCache(item.name, 'marathi')) {
          console.log('Saving new translations to cache');
          await saveTranslationToCache(item.name, {
            hindi: hindiTranslation,
            gujarati: gujaratiTranslation,
            marathi: marathiTranslation
          });
        }

        translatedAllergens[category].push({
          ...item,
          hindi: hindiTranslation,
          gujarati: gujaratiTranslation,
          marathi: marathiTranslation,
          categoryTranslations: { // Add translated category names
            hindi: translatedCategoryHindi,
            gujarati: translatedCategoryGujarati,
            marathi: translatedCategoryMarathi
          }
        });

      } catch (err) {
        console.error(`Translation failed for ${item.name}:`, err);
        translatedAllergens[category].push({
          ...item,
          hindi: item.name,
          gujarati: item.name,
          marathi: item.name,
          categoryTranslations: { // Add translated category names even if allergen translation fails
            hindi: translatedCategoryHindi,
            gujarati: translatedCategoryGujarati,
            marathi: translatedCategoryMarathi
          }
        });
      }
    }
  }

  return translatedAllergens;
};

// Utility to localize digits to Indian scripts
export const localizeDigits = (str, lang) => {
  if (!str || lang === 'english') return str;
  const digitMaps = {
    hindi:    ['०','१','२','३','४','५','६','७','८','९'],
    gujarati: ['૦','૧','૨','૩','૪','૫','૬','૭','૮','૯'],
    marathi:  ['०','१','२','३','४','५','६','७','८','९'],
  };
  const map = digitMaps[lang];
  if (!map) return str;
  return String(str).replace(/[0-9]/g, d => map[d]);
}; 