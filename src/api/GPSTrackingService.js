// consider using this type of file (independent from AgentService)
// in order to keep al files separated
import AgentService from './AgentService';

const PATH = '/gpstrackings';

class GPSTrackingService extends AgentService {

  static async createGPSTracking(gpsTracking) {
    const response = await super.post(PATH, gpsTracking);
    return (response);
  }

  // TODO
  static async getGPSTrackingByLoadId(loadId) {
    const url = `/loads/${loadId}${PATH}`;
    const response = await super.get(url);
    return (response);
  }

  static async getDistanceByLoadId(loadId) {
    const url = `/distance/load/${loadId}/maps`;
    const response = await super.get(url);
    return (response);
  }
}

export default GPSTrackingService;
