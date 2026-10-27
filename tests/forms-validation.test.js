import test from 'node:test';
import assert from 'node:assert/strict';
import { enquirySchema, contactSchema, ownerSchema } from '../src/lib/forms.js';

test('Enquiry validation accepts valid input', () => {
  const valid = {
    name: 'Alhaji Musa',
    phone: '+234 803 555 0142',
    email: 'musa@example.com',
    inquiry_type: 'Request viewing',
    message: 'We are interested in leasing the 4,200 sqm warehouse.',
    property_id: 1,
    source: 'property-detail',
  };
  const res = enquirySchema.safeParse(valid);
  assert.ok(res.success);
});

test('Enquiry validation rejects short names or invalid phone numbers', () => {
  const invalid = {
    name: 'A',
    phone: '123',
    email: 'not-an-email',
    inquiry_type: 'Request viewing',
    message: 'short',
    source: 'property-detail',
  };
  const res = enquirySchema.safeParse(invalid);
  assert.equal(res.success, false);
  const errors = res.error.flatten().fieldErrors;
  assert.ok(errors.name);
  assert.ok(errors.phone);
  assert.ok(errors.email);
  assert.ok(errors.message);
});

test('Silent honeypot field is accepted by schemas', () => {
  const withHoneypot = {
    name: 'Bot Name',
    phone: '+234 803 555 0142',
    email: 'bot@example.com',
    message: 'Spam message that is long enough to pass validation.',
    inquiry_type: 'Request info',
    source: 'property-detail',
    website: 'https://spam-site.com',
  };
  const res = enquirySchema.safeParse(withHoneypot);
  assert.ok(res.success);
  assert.equal(res.data.website, 'https://spam-site.com');
});

test('Owner listing validates upload limit (max 6 photos)', () => {
  const overLimit = {
    owner_name: 'Landlord Sani',
    phone: '+234 803 555 0142',
    email: 'sani@example.com',
    property_type: 'Warehouse',
    intent: 'Rent',
    city: 'Kano',
    approximate_size: '2,500 sqm',
    address: 'Bompai Industrial Layout',
    notes: 'Clean title, available immediately for lease.',
    uploads: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'],
  };
  const res = ownerSchema.safeParse(overLimit);
  assert.equal(res.success, false);
  assert.ok(res.error.flatten().fieldErrors.uploads);
});

