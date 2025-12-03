import { encrypt, decrypt } from "./utils/encryption";

export async function fetchWithEncryption(url, options = {}) {
  const { body, headers, ...rest } = options;

  let newBody = body;
  if (body) {
    // Encriptar el body
    const enc = await encrypt(typeof body === "string" ? body : JSON.stringify(body));
    newBody = JSON.stringify({ payload: enc });
  }

  const res = await fetch(url, {
    ...rest,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: newBody,
  });

  const json = await res.json();

  if (json.payload) {
    return JSON.parse(await decrypt(json.payload)); // Retorna ya descifrado
  }

  return json;
}
