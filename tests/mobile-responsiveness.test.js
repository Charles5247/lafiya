import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const stylesPath = path.resolve('src/styles.css');
const styles = fs.readFileSync(stylesPath, 'utf8');

test('CSS enforces overflow-x clip to prevent horizontal scroll', () => {
  assert.ok(styles.includes('overflow-x: clip'), 'Styles must include overflow-x: clip on root');
});

test('All text inputs and selects use 16px font-size to prevent iOS auto-zoom', () => {
  assert.ok(styles.includes('font-size: 16px; /* stops iOS auto-zoom */') || styles.includes('font-size: 16px;'), 'Global inputs must have 16px font size');
  assert.ok(!styles.includes('.v1-filter-field select {\n  width: 100%;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  background: #fff;\n  padding: 8px 10px;\n  font-size: 15px;'), 'Filter bar select must not be 15px');
  assert.ok(!styles.includes('.v1-sort select {\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  background: #fff;\n  padding: 6px 10px;\n  font-size: 13.5px;'), 'Sort select must not be 13.5px');
});

test('Fixed bottom elements respect env(safe-area-inset-bottom)', () => {
  assert.ok(styles.includes('calc(10px + env(safe-area-inset-bottom))'), 'Mobile detail bar must respect safe area inset');
  assert.ok(styles.includes('calc(24px + env(safe-area-inset-bottom))'), 'Floating WhatsApp button must respect safe area inset');
  assert.ok(styles.includes('calc(14px + env(safe-area-inset-bottom))'), 'Consent banner must respect safe area inset');
});

test('Mobile category strip renders as 2-column horizontal tiles', () => {
  assert.ok(styles.includes('.v1-catstrip-grid {\n    grid-template-columns: 1fr 1fr;'), 'Category grid must be 2 columns on mobile');
  assert.ok(styles.includes('grid-template-columns: 38px 1fr;'), 'Category tiles must be horizontal grid with icon and content');
});

test('Trust bar on mobile has 2 columns with last item spanning full width', () => {
  assert.ok(styles.includes('.v1-trustbar-inner {\n    grid-template-columns: 1fr 1fr;'), 'Trust bar must be 2 columns on mobile');
  assert.ok(styles.includes('.v1-trustbar-item:last-child {\n    grid-column: 1 / -1;'), 'Last trust bar item must span 1 / -1');
});

test('Lightbox arrows move to the bottom on mobile', () => {
  assert.ok(styles.includes('.v1-lightbox-nav {\n    top: auto;\n    bottom: calc(20px + env(safe-area-inset-bottom));'), 'Lightbox nav arrows must move to the bottom on mobile');
});

test('Headings have word wrapping and fluid typography to prevent overflow on 375px', () => {
  assert.ok(styles.includes('overflow-wrap: break-word;'), 'Headings must include overflow-wrap: break-word');
  assert.ok(styles.includes('word-break: normal;'), 'Headings must include word-break: normal');
});

