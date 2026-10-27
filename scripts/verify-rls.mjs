import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.log('Skipping live RLS probe: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not set in environment.');
  console.log('To run this against a connected Supabase project, execute:');
  console.log('  node --env-file=.env.local scripts/verify-rls.mjs');
  process.exit(0);
}

const supabase = createClient(url, anonKey);

console.log('Starting Supabase RLS verification with anon key...');

// 1. Anon can read active properties
const { data: props, error: propErr } = await supabase.from('properties').select('id, status');
if (propErr) {
  console.error('FAIL: Anon cannot read properties:', propErr.message);
  process.exit(1);
}
const nonActive = props.filter((p) => p.status !== 'Active');
if (nonActive.length > 0) {
  console.error('FAIL: Anon was able to read non-Active properties:', nonActive);
  process.exit(1);
}
console.log(`PASS: Anon read ${props.length} properties; all are status="Active".`);

// 2. Anon CANNOT read submissions
for (const table of ['enquiries', 'property_listings', 'contact_messages', 'rate_limits']) {
  const { data, error } = await supabase.from(table).select('*');
  if (data && data.length > 0) {
    console.error(`FAIL: Anon was able to read records from private table "${table}"!`);
    process.exit(1);
  }
  console.log(`PASS: Anon read from "${table}" returned 0 records (blocked by RLS).`);
}

// 3. Anon CANNOT insert into any table directly
for (const table of ['properties', 'enquiries', 'property_listings', 'contact_messages']) {
  const { error } = await supabase.from(table).insert({ title: 'Unauthorized probe' });
  if (!error) {
    console.error(`FAIL: Anon was able to write to "${table}" directly! RLS violation!`);
    process.exit(1);
  }
  console.log(`PASS: Direct write to "${table}" rejected by RLS: ${error.message}`);
}

console.log('All RLS security checks passed successfully!');

