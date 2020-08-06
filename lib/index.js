const qs = require("querystring");
const axios = require("axios");
const NodeCache = require("node-cache");

var request = require("request-promise");
var userPathGenerator = require("./helpers/pathHelper");

let instance = null;

const api = require("./items");
var config1 = require("./config");
const baseConfig = {
  authPath: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  apiUrl: "https://graph.microsoft.com/v1.0/",
  stdTTLToken: 3000,
  stdTTLCreds: 43200,
  checkperiod: 1200,
};
const initConection = Symbol("initConection");
const parseKey = Symbol("parseKey");
const credsCache = Symbol("credsCache");
const config = Symbol("config");
const addToken = Symbol("addToken");
const generateUserPath = Symbol("generateUserPath");

const baseUrl = "https://graph.microsoft.com/v1.0/me/drive/items/";

class OneDrive {
  constructor(options) {
    this[config] = { ...baseConfig, options };

    this[credsCache] = new NodeCache({ stdTTL: this[config].stdTTLCreds, checkperiod: this[config].checkperiod });
  }
  static getInstance(options) {
    instance = instance || new OneDrive(options);
    return instance;
  }

  [parseKey] = (pool) => {
    return {
      creds: () => `creds-${pool}`,
      token: () => `token-${pool}`,
    };
  };

  async [initConection](creds, pool) {
    const body = {
      ...creds,
      grant_type: "refresh_token",
    };

    const fetchParams = {
      method: "POST",
      url: this[config].authPath,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(body),
    };
    const { data } = await axios(fetchParams);
    this[credsCache].set(this[parseKey](pool).token(), data.access_token, this[config].stdTTLToken);

    return data.access_token;
  }

  checkCreds = (pool) => {
    return this[credsCache].get(this[parseKey](pool).creds());
  };

  addConection = async (pool, creds) => {
    try {
      this[credsCache].set(this[parseKey](pool).creds(), creds);
      await this[initConection](creds, pool);

      return true;
    } catch (error) {
      console.log(error);
    }
  };

  [addToken] = async (pool) => {
    const creds = this[credsCache].get(this[parseKey](pool).creds());

    if (!creds) throw new Error("Not found creds for your pool, please make `addConection` method and try again");
    const accessToken = await this[initConection](creds);

    return accessToken;
  };
  checkToken = async (pool) => {
    let accessToken = this[credsCache].get(this[parseKey](pool).token());
    if (!accessToken) {
      accessToken = await this[addToken](pool);
    }

    return accessToken;
  };

  reqWithErrorCatch = async (params, cb) => {
    try {
      const accessToken = await this.checkToken(params.pool);

      return cb({ accessToken, ...params });
    } catch (error) {
      console.log("I catch Error!: ", error);
    }
  };

  items = {
    listChildren: async (params) => {
      params.query = params.query ? `?${params.query}` : "";

      params.itemId = params.itemId === undefined ? "root" : params.itemId;
      const uri = this[generateUserPath](params);
      return await this.reqWithErrorCatch({ uri, pool: params.pool }, api.listChildren);
    },
    createFolder: async (params) => {
      api.createFolder({ accessToken, ...args });
    },
    uploadSimple: async (args) => api.uploadSimple({ accessToken, ...args }),
    uploadSession: async (args) => api.uploadSession({ accessToken, ...args }),
    update: async (args) => api.update({ accessToken, ...args }),
    getMetadata: async (args) => api.getMetadata({ accessToken, ...args }),
    download: async (args) => api.download({ accessToken, ...args }),
    delete: async (args) => api.delete({ accessToken, ...args }),
    car: "laaaa",
  };

  [generateUserPath]({ shared, user, itemId, query }) {
    if (shared && !user) {
      throw new Error("params.shared is set but params.user is missing");
    }
    const userPath = shared ? `users/${user}/` : "me/";

    return `${this[config].apiUrl}${userPath}drive/items/${itemId}/children${query}`;
  }
}

global.appConfig = config1;

const MO = OneDrive.getInstance();
simpleFunc = async () => {
  const creds = JSON.parse(credsData.creds);

  await MO.addConection("myPool", creds);

  const res = await MO.items.listChildren({ pool: "myPool", parentId: "root" });
  console.log(res);
};

simpleFunc();

// api.listChildren({
//   accessToken: `EwBoA8l6BAAUO9chh8cJscQLmU+LSWpbnr0vmwwAAWOcpzZs5hTMdZCAhilxuQOc2PjtFK8/8SklajRPuQ+SYO6So4g8K83nScVRO0WQnPkm+XsbUKKVyxHHnPikmsGg3WCcLBVEFCMVG7DWNSN8c0vrSNE0MU0J6Ya3T82BNQXLnEPEdb1bKM3QtWmY8XS28J6gY4l0aGRuFjbyYlQWO5tKgWhsmuzgBHqJPTn9o54r8oN/eZZ9MXRUraMdnirRzIT5FYEDBhvX3K6sXPh47z56Bsnp9SunEW+fyDCrvjPPh+XrEukLj7FXiju6BRsdX1lCJMBnJlVyJBaLM4zhkeCBcpaE1jt/YjuavV1BgZtk/EB02t+oBsx8bOjV1BIDZgAACLMXGXZIkp71OAJScZtcrOQhk+woquOm1oAytpGqNTEUkyBcekT1i/rAPR3BRORAevQem8AHzgdNR5kYWi4DPTr2FTcKm9aVVtB64yJ3TjW4XMesBlh69XOkX/sSBr3crG9Ugp9Ull6CAQq3vvCVNg2/gSEmxqo0n6uSxrGwWtedO+3kyw/ERLZiUi/Ruc7BnFMv53yTxwDYA6M6z3PIkz2WsD6eyzPa2WA2fYhwbxBsYfBsip66reupCZwq5AODgJ0KVPyuhG9i4LdLCFrTcOdx7rMT5UnpoTmYPK90/E+yW97sDNwrCIOEIwT6T8fVw2IZojts+TrVRIuQr4hfYPp2ANmdMBZxbd9gOZvVowNIN1Q94XHodJHp9qm+mELaP7gwCVsOcDw10N6s6jADr24whcqu/VU8ELxlVgiEOFytc6b5KdBD+ENt6fHQkpoBSmZCto/9g+oo+ZzcnNk1y4+UX63e1euZ8GcLubIg/7StWmHTWBuOghgotq33in+TXFozz1joiIrgfWEggVbskgCJGEULy74ODK198kqiC4ETFdTjijh7B6IAnPSEM8v8DUn+y8V0sK+KMkIWu7zs1Tj05Yuol7D8qSu3rmnmFYfryEwOLtf8P0a+uSZn9v6MCUNZKeCh01EajzCAuQITmnQVycZxnJtIWc1QDwHh58YD2awX2+XJjiaZi+G4Jm/qhbksMMcoRSs17uoUQinRfHJQ0QaBm+Rsb5r1muw/oefqGrAZYrvxmKghtVP2LvgzogWHcwI=`,
//   itemId: 'root',
// }).then((childrens) => {
//   // list all children of dkatavics root directory
//   //
//   console.log(childrens);
//   // returns body of https://dev.onedrive.com/items/list.htm#response
// })

module.exports = {
  items: api,
};
