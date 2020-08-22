import AgentService from './AgentService';

const PATH = '/appmeta';

class AppMetaService extends AgentService {
  static async getAppMeta() {
    const response = await super.get(`${PATH}`);
    return response;
  }
}

export default AppMetaService;
