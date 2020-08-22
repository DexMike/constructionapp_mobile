import AgentService from './AgentService';

const PATH = '/onboarding';

class OnboardingService extends AgentService {

  static async checkOnBoardingStatus(request, accessToken, idToken) {
    const response = await this.postOnBoarding(`${PATH}/status`, request, accessToken, idToken);
    return (response);
  }

  static async onboardDriver(driver, accessToken, idToken) {
    const response = await this.postOnBoarding(`${PATH}/driver`, driver, accessToken, idToken);
    return (response);
  }

  static async onboardCarrier(carrier, accessToken, idToken) {
    const response = await this.postOnBoarding(`${PATH}/carrier`, carrier, accessToken, idToken);
    return (response);
  }

  static async sendSuccessRegistrationEmail() {
    const response = await super.get('/onboarding/notify_success');
    return (response);
  }

}

export default OnboardingService;
