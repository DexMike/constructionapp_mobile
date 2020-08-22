import AgentService from './AgentService';

const PATH = '/user_settings';

class CompanySettingsService extends AgentService {
  static async getCompanySettings(id) {
    const response = await this.get(`${PATH}/${id}/get/create/default`);
    return (response);
  }

  static async updateUserTimeZone(userSettings) {
    const response = await super.post(`${PATH}/updatetimezone`, userSettings);
    return (response);
  }
}

export default CompanySettingsService;
