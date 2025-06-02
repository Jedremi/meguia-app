import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../locales/translations/en.json';
import pt from '../locales/translations/pt.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: Localization.locale.split('-')[0], // pega o idioma do dispositivo
    fallbackLng: 'pt',
    resources: {
      en: { translation: en },
      pt: { translation: pt }
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;