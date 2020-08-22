import AgentService from './AgentService';

const PATH = '/userdevices';

class UserDeviceService extends AgentService {
  static async registerUserDeviceByEmail(userDeviceRequest) {
    const response = await super.post(`${PATH}/register`, userDeviceRequest);
    return (response);
  }

  static async registerUserDeviceByUserId(userDevice) {
    const response = await super.post(`${PATH}`, userDevice);
    return (response);
  }
}

export default UserDeviceService;
