import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// "common" is used by the navbar/footer on every page, so it ships in the main
// bundle for both languages. All other namespaces load as one small chunk per
// language (src/locales/<lng>/lazy.js) the first time a page needs them.
import commonHi from './locales/hi/common.json';
import commonEn from './locales/en/common.json';

const LAZY_NAMESPACES = ['admin', 'auth', 'cart', 'csc', 'notifications', 'product', 'repair'];

const lazyBundles = {
  en: () => import('./locales/en/lazy.js'),
  hi: () => import('./locales/hi/lazy.js'),
};

const lazyBackend = {
  type: 'backend',
  init() {},
  read(language, namespace, callback) {
    const loadBundle = lazyBundles[language] || lazyBundles.en;
    loadBundle()
      .then((module) => callback(null, module.default[namespace] || {}))
      .catch((error) => callback(error, null));
  },
};

i18n
  .use(lazyBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      hi: { common: commonHi },
      en: { common: commonEn },
    },
    // Use the bundled "common" resources and fetch the rest through the backend
    partialBundledLanguages: true,
    lng: 'en', // default language set to English
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

/**
 * Load every lazy namespace for the current language. Route loaders call this
 * alongside the page import so translations arrive in parallel with the page
 * code (some components use "cart:..." etc. without declaring the namespace).
 */
export const loadPageTranslations = () => i18n.loadNamespaces(LAZY_NAMESPACES);

export default i18n;
