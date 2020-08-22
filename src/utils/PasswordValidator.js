
class PasswordValidator {
  static isValidPassword(password) {
    // /^
    // (?!.* )           // should not contain ' '
    // (?=.*\d)          // should contain at least one number
    // (?=.*[a-z])       // should contain at least one lower case
    // (?=.*[A-Z])       // should contain at least one upper case
    // .{8,}             // should contain at least 8 characters
    // $/
    const regex = /^(?!.* )(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    const found = password.match(regex);
    return !!found;
  }
}

export default PasswordValidator;
