import AgentService from './AgentService';

const PATH = '/equipmentmaterials';

class EquipmentMaterialsService extends AgentService {
  static async getEquipmentsMaterials() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getEquipmentMaterialById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getEquipmentMaterialsByFilters(filters) {
    const response = await super.post(`${PATH}/filters`, filters);
    return (response);
  }

  static async getEquipmentMaterialsByCompanyIdAndType(companyId, type) {
    const response = await this.get(`/company/${companyId}/type/${type}/equipments`);
    return (response);
  }

  static async getEquipmentMaterialsByEquipmentId(equipmentId) {
    const response = await this.get(`/equipments/${equipmentId}${PATH}`);
    return (response);
  }

  static async createEquipmentMaterials(equipment) {
    const response = await super.post(PATH, equipment);
    return (response);
  }

  static async createAllEquipmentMaterials(allEquipment, id) {
    const response = await super.post(`/equipments/${id}${PATH}`, allEquipment);
    return (response);
  }

  static async updateEquipmentMaterials(equipment) {
    const response = await this.put(PATH, equipment);
    return (response);
  }

  static async deleteEquipmentMaterialsById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default EquipmentMaterialsService;
