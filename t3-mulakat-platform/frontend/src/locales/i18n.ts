import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './translations/en';
import { tr } from './translations/tr';

// Tarayıcının dili
const browserLanguages = navigator.languages || [navigator.language || navigator.language];
const userLanguage = browserLanguages.find(lang => Object.keys({ en, tr }).includes(lang)) || 'tr';

const DEFAULT_LANGUAGE_KEY = 'i18n';
const savedLanguage = localStorage.getItem(DEFAULT_LANGUAGE_KEY) || userLanguage;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(DEFAULT_LANGUAGE_KEY, lng);
});
