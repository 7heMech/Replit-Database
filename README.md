[![npm version](https://badge.fury.io/js/replit-storage.svg)](https://badge.fury.io/js/replit-storage)

[![Run on Repl.it](https://repl.it/badge/github/7heMech/Replit-Storage)](https://repl.it/github/7heMech/Replit-Storage)

# Replit Storage
Replit Storage is a simple way to use the Replit Database in your repl.

## Get started
```js
const { Client } = require("replit-storage");
const client = new Client();

const key = 'exampleKey';
const value = 'exampleValue';
await client.set(key, value); // Sets `exampleKey` to `exampleValue`
// OR
await client.setMany({
  key1: 'value1',
  key2: 'value2'
}); // Sets multiple key-value pairs (with better performance)
await client.get('key'); // str
```

## Docs
### `class Client(String url?)`
The parameter url is an optional custom DB URL.

**Functions**

These are the methods which a client instance provides.


> `get(String key, Object config?)`

Gets a value.

```js
client.get("key", { raw: false });
```


> `set(String|Number key, any value)`

Sets a single entry through a key-value pair.


> `setMany(Object entries)`

Sets multiple key-value pairs through an object.


> `delete(String key)`

Deletes a key.


> `list(Object config?)`

Lists all of the keys, or all of the keys starting with `prefix` if specifed.

```js
client.list({ prefix: "" });
```


> `empty()`

Clears the database.


> `getAll()`

Get all key/value pairs and return as an object.


> `deleteMany(Array keys)`

Deletes multiple keys.


## Tests
```sh
npm i
npm run test
```