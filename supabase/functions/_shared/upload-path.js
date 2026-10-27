const encoder = new TextEncoder();
async function signature(value) {
  const secret = Deno.env.get('UPLOAD_SIGNING_SECRET');
  if (!secret) throw new Error('UPLOAD_SIGNING_SECRET is required');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function issueUploadPath(filename) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120);
  const value = `${Date.now()}/${crypto.randomUUID()}/${safe}`;
  return `pending/${value}/${await signature(value)}`;
}
export async function isIssuedUploadPath(path) {
  const match = /^pending\/(\d{13})\/([a-f0-9-]{36})\/([a-zA-Z0-9._-]{1,120})\/([a-f0-9]{64})$/.exec(path);
  if (!match) return false;
  const timestamp = Number(match[1]);
  if (timestamp > Date.now() || Date.now() - timestamp > 2 * 60 * 60 * 1000) return false;
  const expected = await signature(`${match[1]}/${match[2]}/${match[3]}`);
  return expected === match[4];
}


