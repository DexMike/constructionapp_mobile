import VersionCheckerUtil from './VersionCheckerUtil';

describe('Version Checker', () => {
  it('should be true since version is older', () => {
    let appVersion = '1.1.8';
    let serverVersion = '1.1.9';
    let result = VersionCheckerUtil.checkVersionUpdate(appVersion, serverVersion);
    expect(result).toBeTruthy();
    appVersion = '1.1.9';
    serverVersion = '1.1.10';
    result = VersionCheckerUtil.checkVersionUpdate(appVersion, serverVersion);
    expect(result).toBeTruthy();
  });

  it('Should be false since version is same or newer', () => {
    let appVersion = '1.1.8';
    let serverVersion = '1.1.8';
    let result = VersionCheckerUtil.checkVersionUpdate(appVersion, serverVersion);
    expect(result).toBeFalsy();
    appVersion = '1.1.9';
    serverVersion = '1.1.8';
    result = VersionCheckerUtil.checkVersionUpdate(appVersion, serverVersion);
    expect(result).toBeFalsy();
    appVersion = '1.1.10';
    serverVersion = '1.1.9';
    result = VersionCheckerUtil.checkVersionUpdate(appVersion, serverVersion);
    expect(result).toBeFalsy();
  });
});
