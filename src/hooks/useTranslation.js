import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translationService } from '../services/translationService';

export const useTranslation = (text) => {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  const translateText = useCallback(async (textToTranslate, language) => {
    if (!textToTranslate || language === 'en') {
      return textToTranslate;
    }
    try {
      const translated = await translationService.translate(textToTranslate, language);
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return textToTranslate;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const updateTranslation = async () => {
      if (!text) return;
      
      if (currentLanguage === 'en') {
        if (isMounted) {
          setTranslatedText(text);
        }
        return;
      }

      try {
        const translated = await translateText(text, currentLanguage);
        if (isMounted) {
          setTranslatedText(translated);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(text);
        }
      }
    };

    updateTranslation();

    return () => {
      isMounted = false;
    };
  }, [text, currentLanguage, translateText]);

  return translatedText;
};

// Hook for translating multiple texts at once
export const useBatchTranslation = (texts) => {
  const { currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState(texts);

  const translateTexts = useCallback(async (textsToTranslate, language) => {
    if (!textsToTranslate?.length || language === 'en') {
      return textsToTranslate;
    }
    try {
      const translated = await translationService.translateBatch(textsToTranslate, language);
      return translated;
    } catch (error) {
      console.error('Batch translation error:', error);
      return textsToTranslate;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const updateTranslations = async () => {
      if (!texts?.length) return;

      if (currentLanguage === 'en') {
        if (isMounted) {
          setTranslatedTexts(texts);
        }
        return;
      }

      try {
        const translated = await translateTexts(texts, currentLanguage);
        if (isMounted) {
          setTranslatedTexts(translated);
        }
      } catch (error) {
        console.error('Batch translation error:', error);
        if (isMounted) {
          setTranslatedTexts(texts);
        }
      }
    };

    updateTranslations();

    return () => {
      isMounted = false;
    };
  }, [texts, currentLanguage, translateTexts]);

  return translatedTexts;
}; 