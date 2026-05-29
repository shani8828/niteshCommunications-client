import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Hindi translation files
import commonHi from './locales/hi/common.json';
import authHi from './locales/hi/auth.json';
import cartHi from './locales/hi/cart.json';
import adminHi from './locales/hi/admin.json';
import deliveryHi from './locales/hi/delivery.json';
import productHi from './locales/hi/product.json';
import repairHi from './locales/hi/repair.json';
import cscHi from './locales/hi/csc.json';
import notificationsHi from './locales/hi/notifications.json';

// English translation files
import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import cartEn from './locales/en/cart.json';
import adminEn from './locales/en/admin.json';
import deliveryEn from './locales/en/delivery.json';
import productEn from './locales/en/product.json';
import repairEn from './locales/en/repair.json';
import cscEn from './locales/en/csc.json';
import notificationsEn from './locales/en/notifications.json';

const resources = {
  hi: {
    common: commonHi,
    auth: authHi,
    cart: cartHi,
    admin: adminHi,
    delivery: deliveryHi,
    product: productHi,
    repair: repairHi,
    csc: cscHi,
    notifications: notificationsHi
  },
  en: {
    common: commonEn,
    auth: authEn,
    cart: cartEn,
    admin: adminEn,
    delivery: deliveryEn,
    product: productEn,
    repair: repairEn,
    csc: cscEn,
    notifications: notificationsEn
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi', // default language set to Hindi
    fallbackLng: 'en',
    ns: ['common', 'auth', 'cart', 'admin', 'delivery', 'product', 'repair', 'csc', 'notifications'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
