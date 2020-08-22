import ConfigProperties from '../ConfigProperties';
import AuthService from '../utils/AuthService';
import RNFetchBlob from 'react-native-fetch-blob';

class AgentService {
  static async getHeaders(path, accessToken, idToken) {
    try {
      if(AuthService.isNonAuthPath(path)) {
        return {
          'Content-Type': 'application/json',
        };
      }
      if (accessToken && idToken) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Id-Token': idToken
        };
      }
      const currentSession = await AuthService.refreshSession();
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentSession.accessToken.jwtToken}`,
        'Id-Token': currentSession.idToken.jwtToken
      };
    } catch {
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  static async multipartUpload(uploadingFiles) {
    try {
      const configObject = ConfigProperties.instance.getEnv();
      const headers = await this.getHeaders('/upload');
      headers['Content-Type'] = 'multipart/form-data';
      const response = await RNFetchBlob
        .fetch('POST',`${configObject.API_ENDPOINT}/upload`, headers, uploadingFiles)
        .uploadProgress((written, total) => {
          console.log("Upload", Math.floor(written/total * 100))
        });
      if (response.status === 401) {
        return;
      }
    } catch (err) {
      console.log(error);
    }
  }

  static async multipartUploadOnBoarding(uploadingFiles, accessToken, idToken) {
    try {
      const configObject = ConfigProperties.instance.getEnv();
      const headers = await this.getHeaders('/upload', accessToken, idToken);
      headers['Content-Type'] = 'multipart/form-data';
      const response = await RNFetchBlob
        .fetch('POST',`${configObject.API_ENDPOINT}/upload`, headers, uploadingFiles)
        .uploadProgress((written, total) => {
          console.log("Upload", Math.floor(written/total * 100))
        });
      if (response.status === 401) {
        return;
      }
    } catch (err) {
      console.log(error);
    }
  }

  static async getOnBoarding(path, accessToken, idToken) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_ENDPOINT = configObject.API_ENDPOINT;
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders(path, accessToken, idToken);
    const init = {
      method: 'GET',
      headers
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async get(path) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_ENDPOINT = configObject.API_ENDPOINT;
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders(path);
    const init = {
      method: 'GET',
      headers
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async postOnBoarding(path, entity, accessToken, idToken) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_ENDPOINT = configObject.API_ENDPOINT;
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders(path, accessToken, idToken);
    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async post(path, entity) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_ENDPOINT = configObject.API_ENDPOINT;
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders(path);
    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async putOnBoarding(path, entity, accessToken, idToken) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_ENDPOINT = configObject.API_ENDPOINT;
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders(path, accessToken, idToken);
    const init = {
      method: 'PUT',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async put(path, entity) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_ENDPOINT = configObject.API_ENDPOINT;
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders(path);
    const init = {
      method: 'PUT',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async delete(path, id) {
    const configObject = ConfigProperties.instance.getEnv();
    const API_ENDPOINT = configObject.API_ENDPOINT;
    const input = `${API_ENDPOINT}${path}/${id}`;
    const headers = await this.getHeaders(path);
    const init = {
      method: 'DELETE',
      headers
    };
    const response = await fetch(input, init);
    return response.json();
  }
}

export default AgentService;

