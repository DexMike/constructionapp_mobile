import AgentService from './AgentService';

const PATH = '/shifts';

class ShiftService extends AgentService {

  static async getShiftById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createShift(shift) {
    const response = await this.post(PATH, shift);
    return (response);
  }

  static async updateShift(shift) {
    const response = await this.put(`${PATH}`, shift);
    return (response);
  }

  static async isDriverOnShift(driverId) {
    const response = await this.get(`${PATH}/${driverId}/isonshift`);
    return (response);
  }

}

export default ShiftService;
