import AgentService from './AgentService';

const PATH = '/company_settings';

class CompanySettingService extends AgentService {
  static async getCompanySettings(id) {
    const response = await this.get(`${PATH}/${id}/get/create/default`);
    return (response);
  }

  static async createDefaultCompanySettingsOnBoarding(id, accessToken, idToken) {
    const response = await this.postOnBoarding(`/onboarding${PATH}/${id}/default`, {}, accessToken, idToken);
    return (response);
  }

  static async updateCompanySettings(companySettings, companyId) {
    const params = {
      companySettings,
      companyId
    };
    const response = await super.post(`${PATH}/update`, params);
    return (response);
  }
}

export default CompanySettingService;
