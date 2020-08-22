import AgentService from './AgentService';

const PATH = '/jobs/dashboard';

class JobDashboardService extends AgentService {
  static async getJobsDashboardMobile(filters) {
    const response = await super.post(`${PATH}/mobile`, filters);
    return (response);
  }
}

export default JobDashboardService;
