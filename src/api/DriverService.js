import AgentService from './AgentService';

const PATH = '/drivers';

class DriverService extends AgentService {
  static async getDrivers() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getDriverById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getDriverByCompanyId(companyId) {
    const response = await this.get(`/companies/${companyId}${PATH}`);
    return (response);
  }

  static async createDriver(equipment) {
    const response = await super.post(PATH, equipment);
    return (response);
  }


  static async createDriverOnBoarding(equipment, accessToken, idToken) {
    const response = await super.postOnBoarding(PATH, equipment, accessToken, idToken);
    return (response);
  }

  static async updateDriver(driver) {
    const response = await this.put(PATH, driver);
    return (response);
  }

  static async updateDriverOnBoarding(driver, accessToken, idToken) {
    const response = await this.putOnBoarding(PATH, driver, accessToken, idToken);
    return (response);
  }

  static async deleteDriverById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async createAndInviteDriver(user) {
    const response = await this.post('/drivers/invite', user);
    return (response);
  }
}

export default DriverService;
