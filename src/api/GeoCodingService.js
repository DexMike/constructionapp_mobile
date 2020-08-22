import ConfigProperties from "../ConfigProperties";

const configObject = ConfigProperties.instance.getEnv();

class GeoCodingService {
  static async getGeoCode(addressString, entity) {
    const input = `https://api.mapbox.com/geocoding/v5/mapbox.places/${addressString}.json?access_token=${configObject.MAPBOX_API}`;
    const init = {
      method: 'GET',
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async getDistance(long1, lat1, long2, lat2) {
    const input = `https://api.mapbox.com/directions/v5/mapbox/driving/${long1},${lat1};${long2},${lat2}?geometries=geojson&access_token=${configObject.MAPBOX_API}`;
    const init = {
      method: 'GET'
    };
    const response = await fetch(input, init);
    return response.json();
  }
}

export default GeoCodingService;
