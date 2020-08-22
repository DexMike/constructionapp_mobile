import AgentService from './AgentService';

const PATH = '/groups';

class GroupService extends AgentService {
  static async getGroups() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getGroupById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getGroupByCompanyId(companyId) {
    const response = await this.get(`/companies/${companyId}${PATH}`);
    return (response);
  }

  static async getGroupByFavoriteAndCompanyId(companyId) {
    const response = await this.get(`/company/${companyId}/favorite${PATH}`);
    return (response);
  }

  static async getGroupAdminsTels(companiesIds) {
    const newPath = `/companies/adminstels${PATH}`;
    const response = await super.post(newPath, companiesIds);
    return (response);
  }

  static async getGroupListByUserName(userId) {
    const response = await this.get(`/user/${userId}/favorite${PATH}`);
    return (response);
  }

  static async createGroup(group) {
    const response = await super.post(PATH, group);
    return (response);
  }

  static async updateGroup(group) {
    const response = await this.put(PATH, group);
    return (response);
  }

  static async deleteGroupById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default GroupService;
