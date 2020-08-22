import { Auth } from 'aws-amplify';

class AuthService {
  static async refreshSession() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const currentSession = await Auth.currentSession();
      // NOTE: doesn't appear to be needed as library refreshes already.
      // await cognitoUser.refreshSession(currentSession.refreshToken, (err, session) => {
      //   console.log('session', err, session);
      //   // const { idToken, refreshToken, accessToken } = session;
      //   // do whatever you want to do now :)
      // });
      return currentSession;
    } catch (e) {
      console.log('Unable to refresh Token', e);
    }
    return {};
  }

  static isNonAuthPath(path) {
    const nonAuthPaths = [
      '/','/auth', '/actuator', '/users/email', '/users/email', '/users/mobile', '/usermanagement/signin',
      '/appmeta', '/login/logs', '/users/email/company'
    ];
    nonAuthPaths.some(nonAuthPath => {
      return path.indexOf(nonAuthPath) > -1;
    });
  }
}

export default AuthService;
