import { writeFile, mkdir } from 'node:fs/promises';
import { seedData } from '../src/lib/seed-data.js';

const origin = (process.env.VITE_SITE_URL || 'https://mailafiyahomes.ng').replace(/\/$/, '');
const routes = [
  '/',
  '/properties',
  '/services',
  '/about',
  '/list-your-property',
  '/contact',
];

// Add active property routes
let propertySlugs = seedData.properties.map((p) => p.slug);

if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  try {
    const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/properties?select=slug&status=eq.Active`, {
      headers: {
        apikey: process.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error('Supabase sitemap query failed: ' + res.status);
    const live = await res.json();
    propertySlugs = live.map((p) => p.slug);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
    throw error;
  }
}

for (const slug of propertySlugs) {
  routes.push(`/properties/${slug}`);
}

await mkdir('dist', { recursive: true });

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((path) => `  <url>
    <loc>${origin}${path}</loc>
    <changefreq>weekly</changefreq>
  </url>`).join('\n')}
</urlset>`;

await writeFile('dist/sitemap.xml', sitemapXml);
console.log(`Generated dist/sitemap.xml with ${routes.length} URLs`);
