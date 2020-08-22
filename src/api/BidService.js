import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/bids';

class BidService extends AgentService {
  static async getBids() {
    const response = await super.get(PATH);
    return (response);
  }

  static async createBid(bid) {
    const response = await super.post(PATH, bid);
    return (response);
  }

  static async updateBid(bid) {
    const response = await this.put(PATH, bid);
    return (response);
  }

  static async deleteBidbById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getBidById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getBidsByJobId(jobId) {
    const response = await this.get(`/jobs/${jobId}${PATH}`);
    return (response);
  }

  static async acceptBid(jobId, bidId) {
    const response = await super.post(`/jobs/${jobId}/bids/${bidId}/accept`);
    return (response);
  }

  static async declineBid(jobId, bidId) {
    const response = await super.post(`/jobs/${jobId}/bids/${bidId}/decline`);
    return (response);
  }

  static getDefaultBid() {
    return {
      jobId: 0,
      hasCustomerAccepted: 0,
      hasSchedulerAccepted: 0,
      status: 'New',
      userId: 0,
      companyCarrierId: 0,
      rateType: 'Hour',
      rate: '',
      rateEstimate: '',
      notes: '',
      createdBy: [],
      createdOn: moment.utc().format(),
      modifiedBy: [],
      modifiedOn: moment.utc().format(),
      isArchived: 0
    };
  }
}

export default BidService;
