// consider using this type of file (independent from AgentService)
// in order to keep al files separated
import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/jobs';

class JobService extends AgentService {
  static async getJobs() {
    const response = await super.get(PATH);
    return (response);
  }

  // getJobsByCompanyIdAndStatus
  // input
  //    companyID: id of company
  //    status: Status string from Lookups; use All to get everything
  //    TODO: NOTE: status is being ignored right now
  // Usage:
  // const equipments = await getJobsByCompanyIdAndStatus.getUsersByCompanyIdAndStatus(
  //   profile.companyId,
  //   'All'
  // );
  static async getJobsByCompanyIdAndStatus(companyId, status) {
    const response = await this.get(`/company/${companyId}/status/${status}${PATH}`);
    return (response);
  }

  // static async getJobById(id) {
  //   const response = await this.get(`${PATH}/${id}`);
  //   return (response);
  // }

  static async getJobMaterialsByJobId(id) {
    const response = await this.get(`${PATH}/${id}/jobmaterials`);
    // /jobs/jobId/jobMaterials/
    return (response);
  }

  static async getJobDashboardByFilters(filters) {
    const response = await super.post(`${PATH}/dashboard/filters`, filters);
    return (response);
  }

  static async getMarketplaceJobsByFilters(filters) {
    const response = await super.post(`${PATH}/marketplace/filters`, filters);
    return (response);
  }

  static async getMarketplaceRequestedAndPostedJobsByFilters(filters) {
    const response = await super.post(`${PATH}/marketplace/filters/all_jobs`, filters);
    return (response);
  }

  static async getJobCarrierDashboardByFilters(filters) {
    const response = await super.post(`${PATH}/dashboard/filters/carrier`, filters);
    return (response);
  }

  static async createJob(job) {
    const response = await super.post(PATH, job);
    return (response);
  }

  static async updateJob(job) {
    const response = await this.put(PATH, job);
    return (response);
  }

  static async deleteJobById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getActiveJobByDriverId(id) {
    const response = await this.get(`/drivers/${id}/activejob`);
    return (response);
  }

  static async getJobByLoad(id) {
    const response = await this.get(`/loads/${id}${PATH}`);
    return (response);
  }

  static async getJobById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getEquipmentsByJobId(jobId) {
    const response = await this.get(`${PATH}/${jobId}/equipments`);
    return (response);
  }

  static async getAllocatedDriversInfoByJobId(jobId) {
    const response = await this.get(`${PATH}/${jobId}/drivers`);
    return (response);
  }

  static async requestJob(id) {
    const response = await super.post(`${PATH}/${id}/request`);
    return (response);
  }

  static async acceptJob(id) {
    const response = await super.post(`${PATH}/${id}/accept`);
    return (response);
  }

  static async cancelJobAsCarrier(id, reason) {
    const response = await super.post(`/carrier${PATH}/${id}/cancel`, reason);
    return (response);
  }

  static async completeJobAsCarrier(request) {
    const response = await super.post(`${PATH}/carrier/complete`, request);
    return (response);
  }

  static getDefaultJob() {
    return {
      companiesId: 0,
      status: 'New',
      startAddress: 0,
      endAddress: 0,
      name: '',
      rateEstimate: 0,
      rateTotal: 0,
      startGeoFence: '',
      endGeoFence: '',
      numberOfTrucks: 0,
      startTime: new Date(),
      endTime: new Date(),
      rateType: 'Hour',
      rate: 0,
      notes: '',
      createdBy: 0,
      createdOn: moment.utc().format(),
      modifiedBy: 0,
      modifiedOn: moment.utc().format(),
      isArchived: 0
    };
  }
}

export default JobService;
