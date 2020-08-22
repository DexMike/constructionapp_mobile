import AgentService from './AgentService';

const PATH = '/jobs/';

class JobDetailsService extends AgentService {

  static async getJobDetailsMobile(jobId) {
    const response = await super.get(`${PATH}${jobId}/details/mobile`);
    return (response);
  }
}

export default JobDetailsService;
