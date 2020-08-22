import AgentService from './AgentService';

const PATH = '/usermanagement';

class UserManagementService extends AgentService {

  static async sendVerificationCodeByEmail(sendEmailVerificationRequest) {
    const response = await this.post(`${PATH}/sendemailcode`, sendEmailVerificationRequest);
    return (response);
  }

  static async sendVerificationCodeByEmailOnBoarding(sendEmailVerificationRequest, accessToken, idToken) {
    const response = await this.postOnBoarding(`${PATH}/sendemailcode`, sendEmailVerificationRequest, accessToken, idToken);
    return (response);
  }

  static async verifyCodeByEmail(verifyEmailCodeRequest) {
    const response = await this.post(`${PATH}/verifyemail`, verifyEmailCodeRequest);
    return (response);
  }

  static async verifyCodeByEmailOnBoarding(verifyEmailCodeRequest, accessToken, idToken) {
    const response = await this.postOnBoarding(`${PATH}/verifyemail`, verifyEmailCodeRequest, accessToken, idToken);
    return (response);
  }

  static async signIn(signInRequest) {
    const response = await this.post(`${PATH}/signin`, signInRequest);
    return response;
  }

  static async findCognito(cognitoRequest) {
    const response = await this.post(`${PATH}/hascognito`, cognitoRequest);
    return (response);
  }

}

export default UserManagementService;
