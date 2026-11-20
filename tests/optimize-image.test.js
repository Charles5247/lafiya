import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizePropertyImage } from '../src/lib/optimize-image.js';

test('property upload shrinks large photos and uses the matching WebP extension', async () => {
  const originalBitmap = globalThis.createImageBitmap;
  const originalDocument = globalThis.document;
  let dimensions;
  globalThis.createImageBitmap = async () => ({ width: 3200, height: 2400, close() {} });
  globalThis.document = { createElement: () => ({
    set width(value) { dimensions = { ...dimensions, width: value }; },
    set height(value) { dimensions = { ...dimensions, height: value }; },
    get width() { return dimensions.width; },
    get height() { return dimensions.height; },
    getContext: () => ({ drawImage() {} }),
    toBlob: (callback) => callback(new Blob(['small'], { type: 'image/webp' })),
  }) };
  try {
    const result = await optimizePropertyImage(new Blob([new Uint8Array(1000)], { type: 'image/jpeg' }));
    assert.deepEqual(dimensions, { width: 1600, height: 1200 });
    assert.equal(result.extension, 'webp');
    assert.equal(result.file.type, 'image/webp');
  } finally {
    globalThis.createImageBitmap = originalBitmap;
    globalThis.document = originalDocument;
  }
});
