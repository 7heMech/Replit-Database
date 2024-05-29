import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { Client } from "./index.js";

let client;

describe("Client Test Suite", () => {
  beforeAll(async () => {
    client = new Client();
    await client.empty();
  });

  afterAll(async () => {
    await client.empty();
  });

  it("should set and get a value", async () => {
    await client.set("key1", "value1");
    const value = await client.get("key1");
    expect(value).toBe("value1");
  });

  it("should get a raw value", async () => {
    await client.set("rawkey", "rawvalue");
    const value = await client.get("rawkey", { raw: true });
    expect(value).toBe('"rawvalue"');
  });

  it("should set many values", async () => {
    await client.setMany({ key2: "value2", key3: "value3" });
    const value2 = await client.get("key2");
    const value3 = await client.get("key3");
    expect(value2).toBe("value2");
    expect(value3).toBe("value3");
  });

  it("should delete a key", async () => {
    await client.set("key4", "value4");
    await client.delete("key4");
    const value = await client.get("key4");
    await expect(value).toBeUndefined();
  });

  it("should list keys with and without prefix", async () => {
    await client.setMany({ pre_key1: "val1", pre_key2: "val2", key5: "val5" });
    const allKeys = await client.list();
    const prefixKeys = await client.list({ prefix: "pre" });
    expect(allKeys).toEqual(expect.arrayContaining(["pre_key1", "pre_key2", "key5"]));
    expect(prefixKeys).toEqual(expect.arrayContaining(["pre_key1", "pre_key2"]));
  });

  it("should empty the database", async () => {
    await client.set("key6", "value6");
    await client.empty();
    const allKeys = await client.list();
    expect(allKeys.length).toBe(0);
  });

  it("should get all key-value pairs", async () => {
    await client.setMany({ key7: "value7", key8: "value8" });
    const allPairs = await client.getAll();
    expect(allPairs).toEqual({ key7: "value7", key8: "value8" });
  });

  it("should delete many keys", async () => {
    await client.setMany({ key9: "value9", key10: "value10" });
    await client.deleteMany(["key9", "key10"]);
    const allKeys = await client.list();
    expect(allKeys).not.toEqual(expect.arrayContaining(["key9", "key10"]));
  });
});