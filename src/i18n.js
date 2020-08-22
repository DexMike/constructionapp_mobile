import I18n from 'react-native-i18n';
import en from './translations/en/translation.json';
import es from './translations/es/translation.json';
import English from './translations/en/translation.json';
import Spanish from './translations/es/translation.json';

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
  en,
  es,
  English,
  Spanish
};

// const currentLocale = I18n.currentLocale();
const currentLocale = 'English';

// Is it a RTL language?
// export const isRTL = currentLocale.indexOf('he') === 0 || currentLocale.indexOf('ar') === 0;

// Allow RTL alignment in RTL languages
// ReactNative.I18nManager.allowRTL(isRTL);

// The method we'll use instead of a regular string
export function translate(name, params = {}) {
  return I18n.t(name, params);
}

export default I18n;
