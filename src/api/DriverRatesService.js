import AgentService from './AgentService';

const PATH = '/driver_rates';

class DriverRatesService extends AgentService {
  static async createDriverRates(address) {
    const response = await super.post(PATH, address);
    return (response);
  }

  static async updateDriverRates(address) {
    const response = await this.put(PATH, address);
    return (response);
  }

  static async getCompanyDriverRates(id) {
    const response = await this.get(`/companies/${id}${PATH}`);
    return (response);
  }

  static async createOnBoardingDefaultCompanyDriverRates(id, accessToken, idToken) {
    const response = await super.postOnBoarding(`/companies/${id}${PATH}/default`, {}, accessToken, idToken);
    return (response);
  }
}

export default DriverRatesService;
