import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('RLS contracts in supabase-setup.sql deny visitor direct writes', () => {
  const sql = readFileSync('rebuild-package/supabase-setup.sql', 'utf8');

  // Check properties RLS
  assert.ok(sql.includes('ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY'));
  assert.ok(sql.includes('CREATE POLICY "public read active" ON public.properties FOR SELECT USING (status = \'Active\' OR public.is_staff())'));
  assert.ok(sql.includes('CREATE POLICY "staff write" ON public.properties FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff())'));

  // Check submissions RLS - no public insert
  assert.ok(sql.includes('ARRAY[\'enquiries\',\'property_listings\',\'contact_messages\']'));
  assert.ok(sql.includes('CREATE POLICY "staff read" ON public.%I FOR SELECT USING (public.is_staff())'));
  assert.ok(sql.includes('CREATE POLICY "staff update" ON public.%I FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff())'));

  // Check admin-only settings
  assert.ok(sql.includes('CREATE POLICY "admin write" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())'));

  // Check rate limits function revoked from public
  assert.ok(sql.includes('REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, int, int) FROM PUBLIC, anon, authenticated;'));
});

test('Schema ensures single hot deal constraint', () => {
  const schema = readFileSync('rebuild-package/schema.sql', 'utf8');
  assert.ok(schema.includes('CREATE UNIQUE INDEX one_hot_deal ON properties ((is_hot_deal)) WHERE is_hot_deal;'));
});
