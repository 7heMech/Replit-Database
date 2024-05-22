declare class Client<T extends Record<string | number, any> = Record<string | number, any>> {
  /**
   * Initiates Class.
   * @param {String} [url] Custom database URL
   * @param {String} [audience] Optional auth for custom servers.
   */
	constructor(url?: string, audience?: string);

	/**
	 * Retrieves a value from the cache or the database.
	 * @param {String|Number} key - The key to retrieve.
	 * @param {Object} [config] - Configuration options.
	 * @param {Boolean} [config.raw=false] - If true, returns the raw string value instead of parsing it.
	 * @returns {*} - The value of the key.
	 */
	public get<K extends keyof T>(key: K, config?: {
		raw: boolean
	}): Promise<T[K] | string>;

	/**
	 * Sets entries through an object or a key-value pair.
	 * @param {String|Number|Object} keyOrEntries - The key to set or an object containing key/value pairs to set.
	 * @param {*} [value] - The value to set if the first parameter is a key.
	 */
	public set<K extends keyof T>(
		keyOrEntries: K | Partial<T>, 
		value?: T[K]
	): Promise<void>;

	/**
	 * Deletes a key
	 * @param {String|Number} key Key
	 */
	public delete(key: keyof T): Promise<void>;

	/**
	 * List keys starting with a prefix or list all keys.
	 * @param {Object} [config] - Configuration options.
	 * @param {String} [config.prefix=''] Filter keys starting with prefix.
	 */
	public list(config?: {
		prefix: string
	}): Promise<(keyof T)[]>;

	/**
	 * Clears the database.
	 */
	public empty(): Promise<void>;

	/**
	 * Get all key/value pairs and return as an object.
	 */
	public getAll(): Promise<T>;

	/**
	 * Delete many entries by keys.
	 * @param {Array<String|Number>} keys List of keys to delete.
	 */
	public deleteMany(keys: Array<keyof T>): Promise<void>;
}

export { Client };