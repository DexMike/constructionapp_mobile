// http://stackoverflow.com/a/26227662/1527470
const singleton = Symbol();
const configProperties = Symbol();

class ConfigProperties {
  constructor(enforcer) {
    if (enforcer !== configProperties) {
      throw new Error("Cannot construct singleton");
    }

    this.dev = {
      API_ENDPOINT: "https://api.dev.mytrelar.com",
      // This is for Jake's machine for testing ...
      // API_ENDPOINT: 'http://192.168.1.128:8080',
      // API_ENDPOINT: 'http://192.168.86.36:8080',
      AWS_REGION: "us-east-1",
      AWS_USER_POOL_ID: "us-east-1_sANFRiklZ",
      AWS_IDENTITY_POOL_ID: "us-east-1:13d6d463-b9d7-4ee7-9761-603b5e3b4d30",
      AWS_USER_POOL_WEB_CLIENT_ID: "23p3jcs40hc1l3gm0620ulec0v",
      AWS_UPLOADS_ENDPOINT: "http://uploads.dev.mytrelar.com",
      AWS_UPLOADS_BUCKET: "uploads.dev.mytrelar.com",
      MAPBOX_API:
        "pk.eyJ1IjoicmF1bHRyZWxhciIsImEiOiJjanV1MnVkM2wwZWY1NDNrZjZ5dXJkbTR4In0.rMU0bd9xlsFxupjk7vlWhA",
      APP_ENV: "Dev"
    };

    this.qa = {
      API_ENDPOINT: "https://api.qa.mytrelar.com",
      AWS_REGION: "us-east-1",
      AWS_USER_POOL_ID: "us-east-1_pmGN5YKPV",
      AWS_IDENTITY_POOL_ID: "us-east-1:ab4ea67f-bfea-43e2-8210-8eece029a5c7",
      AWS_USER_POOL_WEB_CLIENT_ID: "6sogkvk6vesf06ofcqc868rt7f",
      AWS_UPLOADS_ENDPOINT: "https://uploads.qa.mytrelar.com",
      AWS_UPLOADS_BUCKET: "uploads.qa.mytrelar.com",
      MAPBOX_API:
        "pk.eyJ1IjoicmF1bHRyZWxhciIsImEiOiJjanV1MnVkM2wwZWY1NDNrZjZ5dXJkbTR4In0.rMU0bd9xlsFxupjk7vlWhA",
      APP_ENV: "New QA"
    };

    this.cat = {
      API_ENDPOINT: "https://api.cat.mytrelar.com",
      AWS_REGION: "us-east-1",
      AWS_USER_POOL_ID: "us-east-1_klczD3P71",
      AWS_IDENTITY_POOL_ID: "us-east-1:438cf1ca-6b3c-4717-b773-6c7a6aad68ff",
      AWS_USER_POOL_WEB_CLIENT_ID: "7cgrvdq48bt613kgvqnu8bhcqg",
      AWS_UPLOADS_ENDPOINT: "https://uploads.cat.mytrelar.com",
      AWS_UPLOADS_BUCKET: "uploads.cat.mytrelar.com",
      MAPBOX_API:
        "pk.eyJ1IjoicmF1bHRyZWxhciIsImEiOiJjanV1MnVkM2wwZWY1NDNrZjZ5dXJkbTR4In0.rMU0bd9xlsFxupjk7vlWhA",
      APP_ENV: "CAT"
    };

    this.staging = {
      API_ENDPOINT: "https://api.staging.mytrelar.com",
      AWS_REGION: "us-east-1",
      AWS_USER_POOL_ID: "us-east-1_GkxSiARkF",
      AWS_IDENTITY_POOL_ID: "us-east-1:2076fc41-91e6-4796-b306-ac52c6b24486",
      AWS_USER_POOL_WEB_CLIENT_ID: "3sahkf5trdejfrrfujb0rdt1t9",
      AWS_UPLOADS_ENDPOINT: "https://uploads.staging.mytrelar.com",
      AWS_UPLOADS_BUCKET: "uploads.staging.mytrelar.com",
      MAPBOX_API:
        "pk.eyJ1IjoidGRldm9wcyIsImEiOiJjanU0NWpuaHUwcXhjNGRvNjNiNXNsZmxsIn0.XyDtOYpG1BOARsW28CM5xg",
      APP_ENV: "Staging"
    };

    this.demo = {
      API_ENDPOINT: "https://api.demo.mytrelar.com",
      AWS_REGION: "us-east-1",
      AWS_USER_POOL_ID: "us-east-1_6SSdaWx1e",
      AWS_IDENTITY_POOL_ID: "us-east-1:2776f581-794f-47cb-afa5-2098f0e7707d",
      AWS_USER_POOL_WEB_CLIENT_ID: "5i9rrms0uvsuikndobsdp7l96e",
      AWS_UPLOADS_ENDPOINT: "https://uploads.demo.mytrelar.com",
      AWS_UPLOADS_BUCKET: "uploads.demo.mytrelar.com",
      MAPBOX_API:
        "pk.eyJ1IjoicmF1bHRyZWxhciIsImEiOiJjanV1MnVkM2wwZWY1NDNrZjZ5dXJkbTR4In0.rMU0bd9xlsFxupjk7vlWhA",
      APP_ENV: "Demo"
    };

    this.prod = {
      API_ENDPOINT: "https://api.mytrelar.com",
      AWS_REGION: "us-east-1",
      AWS_USER_POOL_ID: "us-east-1_K9gWgb955",
      AWS_IDENTITY_POOL_ID: "us-east-1:4c25b22c-c79d-4d0c-9dfe-d76172741a33",
      AWS_USER_POOL_WEB_CLIENT_ID: "7cqqgiu2booqasov3a5gc83lg8",
      AWS_UPLOADS_ENDPOINT: "https://uploads.mytrelar.com",
      AWS_UPLOADS_BUCKET: "uploads.mytrelar.com",
      MAPBOX_API:
        "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA",
      APP_ENV: "Prod"
    };

    // init config
    this.environment = this.prod;

    this._type = "ConfigProperties";
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new ConfigProperties(configProperties);
    }

    return this[singleton];
  }

  getEnv() {
    // console.log(this.environment);
    return this.environment;
  }

  setEnv(environment) {
    switch (environment) {
      case "dev":
        this.environment = this.dev;
        break;
      case "staging":
        this.environment = this.staging;
        break;
      case "demo":
        this.environment = this.demo;
        break;
      case "qa":
        this.environment = this.qa;
        break;
      case "cat":
        this.environment = this.cat;
        break;
      default:
        // production
        this.environment = this.prod;
    }
    console.log(this.environment);
  }

  singletonMethod() {
    return "singletonMethod";
  }

  static staticMethod() {
    return "staticMethod";
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }
}

export default ConfigProperties;

// ...

// index.js
// import ConfigProperties from './ConfigProperties';

// Instantiate
// console.log(new SingletonEnforcer); // Cannot construct singleton

// Instance
// const config = ConfigProperties.instance;
//
// // Prototype Method
// console.log(config.type, config.singletonMethod());
//
// // Getter/Setter
// instance3.type = 'type updated';
// console.log(instance3.type);
//
// // Static method
// console.log(SingletonEnforcer.staticMethod());

// export default {
//   dev: {
//     API_ENDPOINT: 'https://dev.api.mytrelar.com',
//     AWS_REGION: 'us-east-1',
//     AWS_USER_POOL_ID:'us-east-1_ztq1xhttu',
//     AWS_IDENTITY_POOL_ID: 'us-east-1:602b5b90-1686-47cd-aaa9-39cf385699bd',
//     AWS_USER_POOL_WEB_CLIENT_ID: '52tgalb82hnrv338ambff0korj',
//     AWS_UPLOADS_ENDPOINT: 'https://d2x9cff48m5sea.cloudfront.net',
//     AWS_UPLOADS_BUCKET: 'dev.uploads.mytrelar.com',
//     MAPBOX_API: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
//   },
//   demo: {
//     API_ENDPOINT: 'https://demo.api.mytrelar.com',
//     AWS_REGION: 'us-east-1',
//     AWS_USER_POOL_ID:'us-east-1_32MZPld6o',
//     AWS_IDENTITY_POOL_ID: 'us-east-1:f96db308-49c5-4fc0-95b1-c3ff9513faa3',
//     AWS_USER_POOL_WEB_CLIENT_ID: '79mdq0db6k9sblveoeffe20cnh',
//     AWS_UPLOADS_ENDPOINT: 'https://demo.uploads.mytrelar.com',
//     AWS_UPLOADS_BUCKET: 'demo.uploads.mytrelar.com',
//     GOOGLE_MAPS_API: 'AIzaSyDUwWVXa6msmVdA-oGjnvhFXtvTzkvw2Jg',
//     MAPBOX_API: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
//   }
// };
