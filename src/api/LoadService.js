import AgentService from './AgentService';

const PATH = '/loads';

class LoadService extends AgentService {

  static async getLoadById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createLoad(load) {
    const response = await this.post(PATH, load);
    return (response);
  }

  static async updateLoad(load) {
    const response = await this.put(`${PATH}`, load);
    return (response);
  }

  static async getLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}`);
    return (response);
  }

  static async getLatestLoadByDriverId(id) {
    const response = await this.get(`/driver/${id}${PATH}`);
    return (response);
  }

  static async getLatestLoadByBookingEquipmentId(id) {
    const response = await this.get(`/bookingequipments/${id}${PATH}/latest`);
    return (response);
  }

  static async getActiveDriversByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}/active_drivers`);
    return (response);
  }

  static async getDriversWithLoadsByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}/drivers_with_loads`);
    return (response);
  }

  static async getLatestGPSForLoads(loadIdList) {
    const url = `/gpstrackings${PATH}`;
    const response = await this.post(url, loadIdList);
    return (response);
  }

  static async getDriverUserForLoad(loadId) {
    const response = await this.get(`${PATH}/${loadId}/user`);
    return (response);
  }

}

export default LoadService;
