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

// Use structurally valid payloads so a missing-column or NOT NULL error cannot masquerade as RLS.
const marker = `rls-probe-${Date.now()}`;
const attempts = {
  enquiries: {name:'RLS Probe',phone:'+234 803 555 0142',email:'probe@example.test',inquiry_type:'Request info',message:'Testing that anonymous inserts are denied.',source:'property-detail'},
  property_listings: {owner_name:'RLS Probe',phone:'+234 803 555 0142',email:'probe@example.test',property_type:'Warehouse',intent:'Rent',city:'Kano',approximate_size:'100 sqm',address:'Test address',notes:'Testing that anonymous inserts are denied.',uploads:[]},
  contact_messages: {name:'RLS Probe',phone:'+234 803 555 0142',email:'probe@example.test',enquiry_type:'General enquiry',message:'Testing that anonymous inserts are denied.'},
};
const [{data:category},{data:city},{data:agent}] = await Promise.all([
  supabase.from('property_categories').select('id').limit(1).maybeSingle(),
  supabase.from('cities').select('id').limit(1).maybeSingle(),
  supabase.from('agents').select('id').limit(1).maybeSingle(),
]);
if (category && city && agent) attempts.properties = {title:marker,slug:marker,short_title:marker,category_id:category.id,sub_category:'Lease',listing:'For Lease',price:1,city_id:city.id,area:'Test',state:'Kano State',size:'100 sqm',main_image:'',description:'RLS verification record',agent_id:agent.id,status:'Draft',gallery:[],badges:[],features:[]};
for (const [table,payload] of Object.entries(attempts)) {
  const { error } = await supabase.from(table).insert(payload);
  if (!error) {
    console.error(`FAIL: Anon inserted into "${table}". This test must run against a disposable project; remove the probe row immediately.`);
    process.exit(1);
  }
  if (error.code !== '42501') {
    console.error(`INCONCLUSIVE: "${table}" rejected the insert with ${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.log(`PASS: Direct insert into "${table}" rejected by RLS.`);
}

console.log('All RLS security checks passed successfully!');

