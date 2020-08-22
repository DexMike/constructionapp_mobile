// setup-tests.js
jest.mock('react-native-device-info', () => {
  return {
    getModel: jest.fn(() => '?'),
    getDeviceLocale: jest.fn(() => 'en')
  };
});

// const keychainMock = {
//   SECURITY_LEVEL_ANY: "MOCK_SECURITY_LEVEL_ANY",
//   SECURITY_LEVEL_SECURE_SOFTWARE: "MOCK_SECURITY_LEVEL_SECURE_SOFTWARE",
//   SECURITY_LEVEL_SECURE_HARDWARE: "MOCK_SECURITY_LEVEL_SECURE_HARDWARE",
//   setGenericPassword: jest.fn().mockResolvedValue(),
//   getGenericPassword: jest.fn().mockResolvedValue(),
//   resetGenericPassword: jest.fn().mockResolvedValue()
//   // ...
// };

// jest.mock("react-native-keychain", () => keychainMock);

// Note: not using Enzyme until this gets resolved
// https://github.com/airbnb/enzyme/issues/2094
// https://github.com/airbnb/enzyme/issues/1436 need a react native adapter
// import 'react-native';
// import 'jest-enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// import Enzyme from 'enzyme';
//
// /**
//  * Set up DOM in node.js environment for Enzyme to mount to
//  */
// const { JSDOM } = require('jsdom');
//
// const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
// const { window } = jsdom;
//
// function copyProps(src, target) {
//   Object.defineProperties(target, {
//     ...Object.getOwnPropertyDescriptors(src),
//     ...Object.getOwnPropertyDescriptors(target),
//   });
// }
//
// global.window = window;
// global.document = window.document;
// global.navigator = {
//   userAgent: 'node.js',
// };
// copyProps(window, global);
//
// /**
//  * Set up Enzyme to mount to DOM, simulate events,
//  * and inspect the DOM in tests.
//  */
//
// Enzyme.configure({ adapter: new Adapter() });
