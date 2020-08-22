import AgentService from './AgentService';

const PATH = '/notifications';

class TwilioService extends AgentService {
  static async createSms(notification) {
    const response = await super.post(PATH, notification);
    return (response);
  }
  // Added this enpoint for non system users
  static async createSmsInvite(notification) {
    const response = await super.post(`${PATH}/invite`, notification);
    return (response);
  }
}

export default TwilioService;
