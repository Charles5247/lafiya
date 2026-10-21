import test from 'node:test';
import assert from 'node:assert/strict';
import {csvCell,jsonValue} from '../src/lib/admin-data.js';
test('JSON columns stay native arrays on save',()=>{const gallery=jsonValue('["one.jpg","two.jpg"]');assert.ok(Array.isArray(gallery));assert.deepEqual(gallery,['one.jpg','two.jpg']);assert.equal(JSON.stringify({gallery}),'{"gallery":["one.jpg","two.jpg"]}')});
test('CSV neutralises spreadsheet formulas',()=>{for(const prefix of ['=','+','-','@'])assert.equal(csvCell(prefix+'cmd'),`"'${prefix}cmd"`)});
