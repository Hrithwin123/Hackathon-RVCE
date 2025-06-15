// Using MyMemory Translation API (free, no auth required for limited usage)
const API_URL = 'https://api.mymemory.translated.net/get';

// Cache for translations to avoid unnecessary API calls
const translationCache = new Map();

// Map our language codes to MyMemory codes
// MyMemory uses ISO 639-1 language codes
const languageMap = {
  en: 'en',  // English
  hi: 'hi',  // Hindi
  kn: 'kn'   // Kannada
};

// Add email parameter to increase daily limit (optional)
const EMAIL = 'your-email@example.com'; // Replace with your email if you want to increase the daily limit

export const translationService = {
  translate: async (text, targetLanguage) => {
    console.log('Translation request:', { text, targetLanguage });
    
    // If text is empty or target language is English, return original text
    if (!text || targetLanguage === 'en') {
      console.log('Skipping translation - empty text or English target');
      return text;
    }

    // Create a cache key
    const cacheKey = `${text}:${targetLanguage}`;
    
    // Check if translation exists in cache
    if (translationCache.has(cacheKey)) {
      console.log('Using cached translation');
      return translationCache.get(cacheKey);
    }

    try {
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 100));

      // Construct URL with email parameter if available
      const url = `${API_URL}?q=${encodeURIComponent(text)}&langpair=en|${languageMap[targetLanguage]}${EMAIL ? `&de=${encodeURIComponent(EMAIL)}` : ''}`;
      console.log('Translation API URL:', url);

      const response = await fetch(url);
      console.log('Translation API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Translation API error response:', errorText);
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Translation API response data:', data);
      
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        console.log('Translation successful:', { original: text, translated: translatedText });
        // Store in cache
        translationCache.set(cacheKey, translatedText);
        return translatedText;
      } else {
        console.error('Translation API error:', {
          status: data.responseStatus,
          details: data.responseDetails,
          data: data.responseData
        });
        throw new Error(data.responseDetails || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', {
        error: error.message,
        text,
        targetLanguage,
        stack: error.stack
      });
      // Return original text if translation fails
      return text;
    }
  },

  // Batch translate multiple texts
  translateBatch: async (texts, targetLanguage) => {
    console.log('Batch translation request:', { texts, targetLanguage });
    
    if (!texts || texts.length === 0 || targetLanguage === 'en') {
      console.log('Skipping batch translation - empty texts or English target');
      return texts;
    }

    try {
      // Translate texts in parallel, but with a small delay between requests
      const translations = [];
      for (const text of texts) {
        console.log('Translating batch item:', text);
        const translation = await translationService.translate(text, targetLanguage);
        translations.push(translation);
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Batch translation complete:', translations);
      return translations;
    } catch (error) {
      console.error('Batch translation error:', {
        error: error.message,
        texts,
        targetLanguage,
        stack: error.stack
      });
      return texts;
    }
  },

  // Clear translation cache
  clearCache: () => {
    console.log('Clearing translation cache');
    translationCache.clear();
  }
}; 