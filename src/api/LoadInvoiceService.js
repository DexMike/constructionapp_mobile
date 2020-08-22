import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/loadinvoices';

class LoadInvoiceService extends AgentService {
  static async createLoadInvoices(loadInvoices) {
    const response = await super.post(`${PATH}/list`, loadInvoices);
    return (response);
  }

  static async getLoadInvoicesByLoadId(loadId) {
    const response = await this.get(`/load/${loadId}${PATH}`);
    return response;
  }

  static async getLoadsInvoicesByBookingId(id) {
    const response = await this.get(`/bookings/${id}${PATH}`);
    return (response);
  }
}

export default LoadInvoiceService;
