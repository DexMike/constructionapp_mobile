import AgentService from './AgentService';

const PATH = '/login/logs';

class LoginLogService extends AgentService {
  static async createLoginLog(log) {
    const response = await super.post(PATH, log);
    return (response);
  }
}

export default LoginLogService;