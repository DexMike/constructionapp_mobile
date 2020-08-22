import AgentService from './AgentService';

const PATH = '/users';

class UserService extends AgentService {
  static async getUsers(pageSize, pageNumber) {
    let response;
    if (pageSize) {
      response = await super.get(`${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await this.get(PATH);
    }
    return (response);
  }

  static async getUsersByCompanyId(companyId, pageSize, pageNumber) {
    let response;
    if (pageSize) {
      response = await this.get(`/companies/${companyId}${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await this.get(`/companies/${companyId}${PATH}`);
    }
    return (response);
  }

  // getUsersByCompanyIdAndType
  // input
  //    companyID: id of company
  //    type: of user from Lookups; use All to get everything
  //    TODO: NOTE: type is being ignored right now
  // Usage:
  // const equipments = await UserService.getUsersByCompanyIdAndType(
  //   profile.companyId,
  //   'All'
  // );
  static async getUsersByCompanyIdAndType(companyId, type) {
    const response = await this.get(`/company/${companyId}/type/${type}/users`);
    return (response);
  }

  static async getDriversWithUserInfoByCompanyId(companyId) {
    const response = await this.get(`/companies/${companyId}/drivers`);
    return (response);
  }

  static async getDriversWithUserInfo() {
    const response = await this.get('/driversinfo');
    return (response);
  }

  static async getDriverByUserId(id) {
    const response = await this.get(`/users/${id}/driver`);
    return (response);
  }

  static async getUserById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createOnBoardUser(user, accessToken, idToken) {
    const response = await super.postOnBoarding(PATH, user, accessToken, idToken);
    return (response);
  }

  static async createUser(user) {
    const response = await super.post(PATH, user);
    return (response);
  }

  static async updateUserOnBoarding(user, accessToken, idToken) {
    const response = await this.putOnBoarding(PATH, user, accessToken, idToken);
    return (response);
  }

  static async updateUser(user) {
    const response = await this.put(PATH, user);
    return (response);
  }

  static async deleteUserById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getAdminByCompanyId(id) {
    const response = await this.get(`/companies/${id}/admin${PATH}`);
    return (response);
  }

  static async getUserByMobile(mobile) {
    const response = await this.get(`${PATH}/mobile/${mobile}`);
    return (response);
  }

  static async getUserByEmail(user) {
    const response = await this.post(`${PATH}/email`, user);
    return (response);
  }

  static async getUserSettings(id) {
    const response = await this.get(`${PATH}/${id}/settings`);
    return (response);
  }

  static async updateUserNotification(notification) {
    const response = await this.put(`${PATH}/settings`, notification);
    return (response);
  }

  static async getDriverByBookingEquipmentId(id) {
    const response = await this.get(`/booking_equipments/${id}/driver`);
    return (response);
  }

  static async getCompanyDrivers(companyId, pageNumber, pageSize) {
    const data = {
      pageNumber,
      pageSize
    };
    const response = await this.post(`/companies/${companyId}/users/drivers`, data);
    return (response);
  }

}

export default UserService;
