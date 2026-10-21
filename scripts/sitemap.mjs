import {writeFile,mkdir} from 'node:fs/promises';
const origin=(process.env.VITE_SITE_URL||'https://mailafiyahomes.ng').replace(/\/$/,'');
const routes=['/','/properties','/services','/about','/list-your-property','/contact'];
if(process.env.VITE_SUPABASE_URL&&process.env.VITE_SUPABASE_ANON_KEY){const response=await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/properties?select=slug&status=eq.Active`,{headers:{apikey:process.env.VITE_SUPABASE_ANON_KEY,Authorization:`Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`}});if(response.ok)for(const p of await response.json())routes.push(`/properties/${p.slug}`)}
await mkdir('dist',{recursive:true});await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(x=>`<url><loc>${origin+x}</loc></url>`).join('')}</urlset>`);
