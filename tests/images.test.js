import test from "node:test";
import assert from "node:assert/strict";
import { primeSignedUrls, getSignedUrl } from "../js/images.js";

function dbFor(userId, calls) {
  return { config: { url: "https://photos.test", bucket: "private" },
    getSession: async () => ({ user: { id: userId } }),
    client: { storage: { from: () => ({ createSignedUrls: async (paths) => {
      calls.push(paths);
      await new Promise(resolve => setTimeout(resolve, 2));
      return { data: paths.map(path => ({ path, signedUrl: `https://photos.test/${userId}/${path}?signature=valid` })), error: null };
    } }) } } };
}

test("signs the gallery in one batch and reuses links across page instances, scoped to the user", async () => {
  const values = new Map();
  globalThis.sessionStorage = { getItem: key => values.get(key), setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) };
  try {
    const calls = []; const db = dbFor("staff-a", calls);
    await primeSignedUrls(db, ["one.webp", "two.webp", "one.webp"]);
    assert.deepEqual(calls, [["one.webp", "two.webp"]]);
    const urls = await Promise.all([getSignedUrl(db, "one.webp"), getSignedUrl(db, "one.webp")]);
    assert.equal(urls[0], urls[1]); assert.equal(calls.length, 1);
    await getSignedUrl(dbFor("staff-a", calls), "one.webp");
    assert.equal(calls.length, 1, "refresh should reuse a valid signed link");
    assert.match(await getSignedUrl(dbFor("staff-b", calls), "one.webp"), /staff-b/);
    assert.equal(calls.length, 2, "another user must receive their own link");
    await getSignedUrl(db, "one.webp", true);
    assert.equal(calls.length, 3, "failed/expired links can be renewed");
  } finally { delete globalThis.sessionStorage; }
});

test("simultaneous requests for an uncached photo share one signing call", async () => {
  const calls = []; const db = dbFor("staff-c", calls);
  await Promise.all([getSignedUrl(db, "new.webp"), getSignedUrl(db, "new.webp")]);
  assert.equal(calls.length, 1);
});

test("a delayed previous selection cannot replace the currently selected photo", async () => {
  const { setSignedImage } = await import("../js/images.js");
  const calls=[];const db=dbFor("staff-race",calls);
  db.client.storage.from=()=>({createSignedUrls:async paths=>{
    await new Promise(resolve=>setTimeout(resolve,paths[0]==="old.webp"?20:1));
    return {data:paths.map(path=>({path,signedUrl:`https://photos.test/${path}`})),error:null};
  }});
  const image={src:"",dataset:{}};
  await Promise.all([setSignedImage(db,image,"old.webp"),setSignedImage(db,image,"current.webp")]);
  assert.equal(image.dataset.storagePath,"current.webp");
  assert.equal(image.src,"https://photos.test/current.webp");
});
