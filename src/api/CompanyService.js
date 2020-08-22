import AgentService from './AgentService';

const PATH = '/companies';

class CompanyService extends AgentService {
  static async getCompanies() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getCompanyById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getCompanyByIdOnBoarding(id, accessToken, idToken) {
    const response = await this.getOnBoarding(`${PATH}/${id}`, accessToken, idToken);
    return (response);
  }

  static async getCompanyTypeByUserId(userId) {
    const response = await this.get(`/users/${userId}/company_short`);
    return response;
  }

  static async createOnBoardingCompany(company, accessToken, idToken) {
    const response = await super.postOnBoarding(PATH, company, accessToken, idToken);
    return (response);
  }

  static async createCompany(company) {
    const response = await super.post(PATH, company);
    return (response);
  }

  static async updateCompany(company) {
    const response = await this.put(PATH, company);
    return (response);
  }

  static async updateCompanyOnBoarding(company, accessToken, idToken) {
    const response = await this.putOnBoarding(PATH, company, accessToken, idToken);
    return (response);
  }

  static async deleteCompanyById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default CompanyService;
