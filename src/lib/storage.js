// Drop-in replacement for the `window.storage` API that only exists inside
// Claude's artifact runtime. Backed by localStorage, with the same
// get/set/delete call signatures and return shapes, so component call sites
// (window.storage.get / window.storage.set) don't need to change at all.

const NAMESPACE = "self-archaeology:";

function namespacedKey(key) {
  return `${NAMESPACE}${key}`;
}

async function get(key) {
  const raw = window.localStorage.getItem(namespacedKey(key));
  if (raw === null) {
    throw new Error(`storage: no value for key "${key}"`);
  }
  return { key, value: raw };
}

async function set(key, value) {
  window.localStorage.setItem(namespacedKey(key), value);
  return { key, value };
}

async function del(key) {
  window.localStorage.removeItem(namespacedKey(key));
  return { key };
}

export const storage = { get, set, delete: del };

if (typeof window !== "undefined") {
  window.storage = storage;
}
