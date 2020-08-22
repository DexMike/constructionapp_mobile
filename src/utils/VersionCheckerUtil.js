
class VersionCheckerUtil {
  static checkVersionUpdate(appVersion, serverVersion) {
    const appVersionSplit = appVersion.split('.');
    const serverVersionSplit = serverVersion.split('.');
    for(let i = 0; i < 3; i++) {
      if(parseInt(appVersionSplit[i], 10) < parseInt(serverVersionSplit[i], 10)) {
        return true;
      }
    }
    return false;
  }
}

export default VersionCheckerUtil;
