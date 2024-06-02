const fs = require("fs");

const parseUrl = (str) => {
  const url = new URL(str).toString();
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

const parseJson = (val) => {
  try {
    return JSON.parse(val);
  } catch (err) {
    return val;
  }
}

const encode = encodeURIComponent;

class Client {
  #nextRefresh;
  #url;

  #getUrl() {
    if (!this.#nextRefresh || Date.now() < this.#nextRefresh) return this.#url;


    this.#url = parseUrl(process.env.REPLIT_DB_URL || fs.readFileSync.call(null, "/tmp/replitdb", "utf8"));
    this.#nextRefresh = Date.now() + 1000 * 60 * 60;

    return this.#url;
  }

  /**
   * Initiates Class.
   * @param {String} [url] Custom database URL
   * @param {String} [auth] Optional auth for custom servers.
   */
  constructor(url, auth) {
    if (url) {
      this.#url = parseUrl(url);
    } else {
      this.#nextRefresh = 1;
    }

    this.fetch = async (path, { body, method } = {}) => {
      const headers = new Headers();
      if (body) headers.set("Content-Type", "application/x-www-form-urlencoded");
      if (auth) headers.set("authorization", auth);

      const options = { headers };

      if (method) options.method = method;
      else if (body) options.method = 'POST';
      else if (path) options.method = 'GET';

      if (body) options.body = body;

      const url = this.#getUrl() + path;
      const res = await fetch(url, options);

      if (!res.ok) return;
      if (options.method === 'GET') return res.text();
    }

    this.cache = {};
  }

  /**
   * Retrieves a value from the cache or the database.
   * @param {String|Number} key - The key to retrieve.
   * @param {Object} [config] - Configuration options.
   * @param {Boolean} [config.raw=false] - If true, returns the raw string value instead of parsing it.
   * @returns {*} - The value of the key.
   */
  async get(key, config = {}) {
    const { raw = false } = config;

    let value = this.cache[key];
    if (typeof value === 'undefined') {
      value = await this.fetch(`/${encode(key)}`);
      this.cache[key] = value;
    }

    return raw ? value : parseJson(value);
  }

  /**
   * Sets a single entry through a key-value pair.
   * @param {String|Number} key - The key to set.
   * @param {*} value - The value to set for the key.
   */
  async set(key, value) {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw Error('Invalid arguments passed to set method. Key must be a string or number.');
    }

    value = JSON.stringify(value);
    this.cache[key] = value;

    await this.fetch('/', { body: `${encode(key)}=${encode(value)}` });
  }


  /**
   * Sets multiple entries through an object.
   * @param {Object} entries - An object containing key/value pairs to set.
   */
  async setMany(entries) {
    if (typeof entries !== 'object' || entries === null) {
      throw new Error('Invalid argument passed to setMany method. Expected an object.');
    }

    let query = '';
    for (const key in entries) {
      const value = JSON.stringify(entries[key]);
      query += `${encode(key)}=${encode(value)}&`;
      this.cache[key] = value;
    }

    const body = query.slice(0, -1); // removes the trailing &

    await this.fetch('/', { body });
  }

  /**
   * Deletes a key
   * @param {String|Number} key Key
   */
  async delete(key) {
    delete this.cache[key];
    await this.fetch(`/${encode(key)}`, { method: 'DELETE' });
  }

  /**
   * List keys starting with a prefix or list all keys.
   * @param {Object} [config] - Configuration options.
   * @param {String} [config.prefix=''] Filter keys starting with prefix.
   */
  async list(config = {}) {
    const { prefix = '' } = config;

    const text = await this.fetch(`?encode=true&prefix=${encode(prefix)}`);
    if (text.length === 0) return [];

    return text.split('\n').map(decodeURIComponent);
  }

  /**
   * Clears the database.
   */
  async empty() {
    this.cache = {};

    const keys = await this.list();
    await this.deleteMany(keys);
  }

  /**
   * Get all key/value pairs and return as an object.
   */
  async getAll() {
    const output = {};
    const keys = await this.list();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      output[key] = await this.get(key);
    }

    return output;
  }

  /**
   * Delete many entries by keys.
   * @param {Array<String|Number>} keys List of keys to delete.
   */
  async deleteMany(keys) {
    const promises = keys.map(key => this.delete(key));
    await Promise.all(promises);
  }
}

module.exports = { Client };