// import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/maps';

class MapService extends AgentService {
  static async getDistanceForFleet(loadId) {
    const response = await super.get(`/distance/load/${loadId}/fleet${PATH}`);
    return (response);
  }
}

export default MapService;
