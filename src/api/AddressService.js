// consider using this type of file (independent from AgentService)
// in order to keep all files separated
import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/addresses';

class AddressService extends AgentService {
  static async getAddresses(pageSize, pageNumber) {
    let response;
    if (pageSize) {
      response = await super.get(`${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await super.get(PATH);
    }
    return (response);
  }

  static async getAddressesByCompanyId(id, pageSize, pageNumber) {
    let response;
    if (pageSize) {
      response = await this.get(`/companies/${id}${PATH}?pageSize=${pageSize}&pageNumber=${pageNumber}`);
    } else {
      response = await this.get(`/companies/${id}${PATH}`);
    }
    return (response);
  }

  static async createAddress(address) {
    const response = await super.post(PATH, address);
    return (response);
  }

  static async createAddressOnBoarding(address, accessToken, idToken) {
    const response = await super.postOnBoarding(PATH, address, accessToken, idToken);
    return (response);
  }

  static async updateAddress(address) {
    const response = await this.put(PATH, address);
    return (response);
  }

  static async deleteAddressbById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getAddressById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static getDefaultAddress() {
    return {
      type: '',
      name: '',
      address1: '',
      address2: '',
      address3: '',
      address4: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      note: '',
      latitude: 0.0,
      longitude: 0.0,
      createdBy: 1,
      createdOn: moment.utc().format(),
      modifiedBy: 0,
      modifiedOn: moment.utc().format(),
      isArchived: 0
    };
  }
}

export default AddressService;
