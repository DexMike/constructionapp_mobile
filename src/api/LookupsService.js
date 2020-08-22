import AgentService from './AgentService';

const PATH = '/lookups';

class LookupsService extends AgentService {
  static async getLookupsOnBoarding(accessToken, idToken) {
    const response = await super.getOnBoarding(PATH, accessToken, idToken);
    return response;
  }

  static async getLookups() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getLookupsById(id) {
    const response = await super.get(PATH, id);
    return (response);
  }

  static async getLookupsByType(key) {
    const response = await super.get(`${PATH}/type/${key}`);
    return (response);
  }

  static async getLookupsCarrierCancelReasons() {
    const response = await super.get(`${PATH}/carriercancelreasons`);
    return (response);
  }

  static async getLookupsStates(accessToken, idToken) {
    const response = await super.getOnBoarding(`${PATH}/states`, accessToken, idToken);
    return (response);
  }

  static async createLookup(lookup) {
    const response = await super.post(PATH, lookup);
    return (response);
  }

  static async updateLookup(lookup) {
    const response = await this.put(PATH, lookup);
    return (response);
  }

  static async deleteLookupById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default LookupsService;

