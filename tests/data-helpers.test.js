import test from 'node:test';
import assert from 'node:assert/strict';
import { money } from '../src/lib/data.js';
import { seedData } from '../src/lib/seed-data.js';

test('Money helper formats full Naira figures correctly', () => {
  assert.equal(money(85000000), '₦85,000,000');
  assert.equal(money(780000000), '₦780,000,000');
  assert.equal(money(4200000000), '₦4,200,000,000');
  assert.equal(money(0), '₦0');
  assert.equal(money(null), '');
});

test('Seed data includes exactly 12 active properties', () => {
  const active = seedData.properties.filter((p) => p.status === 'Active');
  assert.equal(active.length, 12);
});

test('Only one property is marked as hot deal in seed data', () => {
  const hotDeals = seedData.properties.filter((p) => p.is_hot_deal);
  assert.equal(hotDeals.length, 1);
  assert.equal(hotDeals[0].slug, 'bompai-industrial-warehouse');
});

test('Warehouse is the first category in seed categories', () => {
  assert.equal(seedData.property_categories[0].name, 'Warehouse');
  assert.equal(seedData.property_categories[0].slug, 'warehouse');
});

