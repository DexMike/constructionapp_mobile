import AgentService from './AgentService';

const PATH = '/jobmaterials';

class JobMaterialsService extends AgentService {
  static async getJobMaterials() {
    const response = await super.get(PATH);
    return (response);
  }

  static async getJobMaterialsById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async getJobMaterialsByJobId(jobId) {
    const response = await this.get(`/jobs/${jobId}${PATH}`);
    // /jobs/jobId/jobmaterials/
    return (response);
  }

  static async createJobMaterials(jobMaterial) {
    const response = await super.post(PATH, jobMaterial);
    return (response);
  }

  static async updateJobMaterials(jobMaterial) {
    const response = await this.put(PATH, jobMaterial);
    return (response);
  }

  static async deleteJobMaterialsById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default JobMaterialsService;
