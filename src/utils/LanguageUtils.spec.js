import React from 'react';
import LanguageUtils from './LanguageUtils';
import { translate } from '../i18n';

describe('LanguageUtils', () => {
  it('gets the device language', () => {
    const language = LanguageUtils.getDeviceLanguage();
    expect(language).toBe('en');
  });

  it('gets the app language code', () => {
    let languageCode = LanguageUtils.getAppLanguageCode('English');
    expect(languageCode).toBe('en');
    languageCode = LanguageUtils.getAppLanguageCode('Spanish');
    expect(languageCode).toBe('es');
  });

  it('should be able to translate various words and phrases', () => {
    LanguageUtils.setAppLanguage('es');
    let expectedResult = '';
    let actualResult = 'caracteres';
    expectedResult = translate('characters');
    expect(expectedResult).toBe(actualResult);
  });
});
