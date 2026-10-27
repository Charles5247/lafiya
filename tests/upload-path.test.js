import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.Deno = { env: { get: key => key === 'UPLOAD_SIGNING_SECRET' ? 'test-secret-not-for-production' : undefined } };
const { issueUploadPath, isIssuedUploadPath } = await import('../supabase/functions/_shared/upload-path.js');
test('owner upload path must be issued, recent, and untampered', async () => {
  const path = await issueUploadPath('warehouse photo.jpg');
  assert.equal(await isIssuedUploadPath(path), true);
  assert.equal(await isIssuedUploadPath(path.replace('warehouse-photo.jpg', 'other.jpg')), false);
  assert.equal(await isIssuedUploadPath('pending/123/fake.jpg'), false);
});
