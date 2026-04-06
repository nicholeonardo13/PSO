import { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('pso_lang') || 'id';
  });

  const toggleLang = () => {
    const next = lang === 'id' ? 'en' : 'id';
    localStorage.setItem('pso_lang', next);
    setLang(next);
  };

  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] ?? entry['id'] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
