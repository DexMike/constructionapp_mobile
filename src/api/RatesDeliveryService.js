import AgentService from './AgentService';

const PATH = '/rates_deliveries';

class RatesDeliveryService extends AgentService {

  // Create
  static async createRatesDelivery(ratesDelivery) {
    const response = await super.post(PATH, ratesDelivery);
    return (response);
  }

  // Update
  static async updateRatesDelivery(ratesDelivery) {
    const response = await this.put(PATH, ratesDelivery);
    return (response);
  }

  // all of them, with pagination
  static async getRatesDeliveries(pageSize, pageNumber) {
    let response;
    if (pageSize) {
      response = await super.get(`${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await this.get(PATH);
    }
    return (response);
  }

  // specific id
  static async getRatesDeliveryById(ratesDeliveryId) {
    const response = await this.get(`${PATH}/${ratesDeliveryId}`);
    return (response);
  }

  // all for a specific companyId
  static async getRatesDeliveriesByCompanyId(companyId, pageSize, pageNumber) {
    let response;
    if (pageSize && pageNumber) {
      response = await this.get(`/companies/${companyId}${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await this.get(`/companies/${companyId}${PATH}`);
    }
    return (response);
  }

  static async deleteRatesDeliveryById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async createDefaultCompanyRatesDelivery(id) {
    const response = await super.post(`${PATH}/companies/${id}/default`);
    return (response);
  }

  static async calculateTrelarFee(companyRates) {
    const response = await super.post(`${PATH}/companies/trelarfee`, companyRates);
    return (response);
  }
}

export default RatesDeliveryService;
