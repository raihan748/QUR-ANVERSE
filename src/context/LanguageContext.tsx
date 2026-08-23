import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, translations, getSavedLanguage, saveLanguage } from '../services/i18nService';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: typeof translations['id'];
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(getSavedLanguage());

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'id' ? 'ar' : 'id';
    setLanguage(nextLang);
  };

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
    isRtl: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
