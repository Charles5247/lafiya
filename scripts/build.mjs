import { spawnSync } from 'node:child_process';
import { rename, writeFile } from 'node:fs/promises';

const run = (script, args) => {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
};

if (process.env.VITE_DEPLOY_TARGET === 'admin') {
  run('./node_modules/vite/bin/vite.js', ['build', '--config', 'vite.admin.config.js']);
  await rename('dist/admin.html', 'dist/index.html');
  await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
} else {
  run('./node_modules/vite-react-ssg/bin/vite-react-ssg.js', ['build']);
  run('scripts/sitemap.mjs', []);
}
