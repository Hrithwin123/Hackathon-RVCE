import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: { name: 'English', code: 'en' },
  hi: { name: 'हिंदी', code: 'hi' },
  kn: { name: 'ಕನ್ನಡ', code: 'kn' }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    return localStorage.getItem('selectedLanguage') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    setCurrentLanguage,
    languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 