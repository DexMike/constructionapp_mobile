import PasswordValidator from './PasswordValidator';

describe('Password Validator', () => {
  it('should not be valid, too short', () => {
    const excepted = PasswordValidator.isValidPassword('1No4!');
    expect(excepted).toBeFalsy();
  });

  it('should not be valid, no digits', () => {
    const excepted = PasswordValidator.isValidPassword('Password');
    expect(excepted).toBeFalsy();
  });

  it('should not be valid, no uppercase', () => {
    const excepted = PasswordValidator.isValidPassword('password');
    expect(excepted).toBeFalsy();
  });

  it('should not be valid, no lowercase', () => {
    const excepted = PasswordValidator.isValidPassword('PASSWORD!');
    expect(excepted).toBeFalsy();
  });

  it('should not be a valid password, no whitespace', () => {
    const excepted = PasswordValidator.isValidPassword('abcdefG 1emf');
    expect(excepted).toBeFalsy();
  });

  it('should be a valid password', () => {
    const excepted = PasswordValidator.isValidPassword('abcdefG1emf');
    expect(excepted).toBeTruthy();
  });

  it('should be a valid password 2', () => {
    const excepted = PasswordValidator.isValidPassword('LetUsAuth1nt1c@te!');
    expect(excepted).toBeTruthy();
  });
});
