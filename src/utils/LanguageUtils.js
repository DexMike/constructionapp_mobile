import DeviceInfo from 'react-native-device-info';
import I18n from 'react-native-i18n';
import * as moment from 'moment';
import 'moment/locale/es';

class LanguageUtils {
  static getDeviceLanguage() {
    // Possible values currently: en-US, es-US (android), en/en-en, es-US  (ios).
    const deviceLocale = DeviceInfo.getDeviceLocale();
    return deviceLocale;
  }

  // Currently app supports en, and es.
  static getAppLanguageCode(language) {
    let appLanguageCode = 'en';
    switch (language) {
      case 'Spanish': appLanguageCode = 'es'; break;
      case 'es-US': appLanguageCode = 'es'; break;
      case 'es': appLanguageCode = 'es'; break;
      // Don't really need this part since it default's to en but it there for clarity.
      case 'English': appLanguageCode = 'en'; break;
      case 'en-US': appLanguageCode = 'en'; break;
      case 'en': appLanguageCode = 'en'; break;
      default: appLanguageCode = 'en'; break;
    }
    return appLanguageCode;
  }

  // Changes the app and date library language to either English or Spanish.
  static setAppLanguage(languageCode) {
    I18n.locale = languageCode;
    moment.locale(languageCode);
  }
}

export default LanguageUtils;
