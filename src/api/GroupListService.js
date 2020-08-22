import AgentService from './AgentService';

const PATH = '/grouplists';

class GroupListService extends AgentService {
  static async getGroupLists() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getGroupListById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getGroupListsByCompanyId(favoriteCompanyId, userCompanyId) {
    const response = await this.get(`/favoriteCompany/${favoriteCompanyId}/userCompany/${userCompanyId}${PATH}`);
    return (response);
  }

  static async getGroupListsByCompanyIdName(companyId) {
    const response = await this.get(`/companies/${companyId}/name${PATH}`);
    return (response);
  }

  static async getGroupListsFavorites() {
    const response = await this.get(`/favorites${PATH}`);
    return (response);
  }

  static async getGroupListByFavoriteAndCompanyId(companyId) {
    const response = await this.get(`/company/${companyId}/favorite${PATH}`);
    return (response);
  }

  static async createGroupList(group) {
    const response = await super.post(PATH, group);
    return (response);
  }

  static async createFavoriteGroupList(group) {
    const response = await this.post('/grouplists/favorite', group);
    return (response);
  }

  static async getGroupListByUserNameFiltered(userId, filters) {
    const url = `/user/${userId}/filtered${PATH}`;
    const response = await this.post(url, filters);
    return (response);
  }

  static async getBiddersFiltered(filters) {
    const url = `/bidders/filtered${PATH}`;
    const response = await this.post(url, filters);
    return (response);
  }

  static async updateGroupList(group) {
    const response = await this.put(PATH, group);
    return (response);
  }

  static async deleteGroupListById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default GroupListService;
