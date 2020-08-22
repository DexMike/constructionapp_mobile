import AgentService from './AgentService';

const PATH = '/usertos';

class UserTOSService extends AgentService {
  static async createOnBoardingUserTOS(userTOS, accessToken, idToken) {
    const response = await super.postOnBoarding(PATH, userTOS, accessToken, idToken);
    return response;
  }
}

export default UserTOSService;
