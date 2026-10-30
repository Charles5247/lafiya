import test from 'node:test';
import assert from 'node:assert/strict';
import { drivePreviewUrl } from '../src/lib/video.js';

test('CEO Drive interview opens as an on-site preview', () => {
  assert.equal(
    drivePreviewUrl('https://drive.google.com/file/d/1tYeomZVlTK2irv9rCU1Q7oQQgS75_1I3/view'),
    'https://drive.google.com/file/d/1tYeomZVlTK2irv9rCU1Q7oQQgS75_1I3/preview',
  );
  assert.equal(drivePreviewUrl('javascript:alert(1)'), null);
});
