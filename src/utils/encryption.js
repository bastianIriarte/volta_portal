// src/utils/encryption.js
const keyStr = "hb=$pGWi)V3me3b8#F1_J5qyExv9+zx5"; // 32 bytes
const ivStr  = "K1tFDd0hFDk&(&qk";                // 16 bytes

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyStr),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(plainText) {
  const key = await getKey();
  const iv  = new TextEncoder().encode(ivStr);
  const encoded = new TextEncoder().encode(plainText);

  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, encoded);
  return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // base64
}

export async function decrypt(cipherText) {
  const key = await getKey();
  const iv  = new TextEncoder().encode(ivStr);
  const bytes = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, bytes);
  return new TextDecoder().decode(decrypted);
}
