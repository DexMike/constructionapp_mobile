import AgentService from './AgentService';

const PATH = '/coiattachments';

class CoiAttachmentService extends AgentService {

  static async createCoiAttachmentsOnBoarding(coiAttachments, accessToken, idToken) {
    const response = await super.postOnBoarding(`${PATH}/list`, coiAttachments, accessToken, idToken);
    return (response);
  }

  static async createCoiAttachments(coiAttachments) {
    const response = await super.post(`${PATH}/list`, coiAttachments);
    return (response);
  }

  static async getCoiAttachmentsByCompany(companyId) {
    const response = await super.get(`/company/${companyId}${PATH}`);
    return (response);
  }
}

export default CoiAttachmentService;
