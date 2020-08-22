import AgentService from './AgentService';

const PATH = '/equipment-details';

class EquipmentDetailService extends AgentService {
  static async getEquipmentDefaultDriverList(companyId, equipmentId) {
    const response = await this.get(`${PATH}/companies/${companyId}/equipments/${equipmentId}/default-drivers`);
    return (response);
  }
  static async getMostRecentEnabledDriverByCompany(id) {
    const response = await this.get(`${PATH}/companies/${id}/most-recent-driver-enabled`);
    return (response);
  }

  static async getDefaultDriverList(companyId, equipmentId) {
    const response = await this.get(`${PATH}/companies/${companyId}/default-drivers`);
    return (response);
  }
}

export default EquipmentDetailService;
