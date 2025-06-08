import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translationService } from '../services/translationService';

export const useTranslation = (text) => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const translateText = async () => {
      if (text && currentLanguage !== 'en') {
        const translated = await translationService.translate(text, currentLanguage);
        setTranslatedText(translated);
      } else {
        setTranslatedText(text);
      }
    };

    translateText();
  }, [text, currentLanguage]);

  return translatedText;
};

// Hook for translating multiple texts at once
export const useBatchTranslation = (texts) => {
  const { currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState(texts);

  useEffect(() => {
    const translateTexts = async () => {
      if (texts && texts.length > 0 && currentLanguage !== 'en') {
        const translated = await translationService.translateBatch(texts, currentLanguage);
        setTranslatedTexts(translated);
      } else {
        setTranslatedTexts(texts);
      }
    };

    translateTexts();
  }, [texts, currentLanguage]);

  return translatedTexts;
}; 