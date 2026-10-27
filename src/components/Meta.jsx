import React from 'react';
import { Head } from 'vite-react-ssg';
import { ui } from '../strings';

export function Meta({ title, description, image, structured }) {
  const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://mailafiyahomes.ng').replace(/\/$/, '');
  const fullTitle = title ? `${title} | ${ui.brand}` : ui.brand;
  const desc = description || ui.hero.body;
  const ogImg = image && /^https?:\/\//.test(image) ? image : `${siteUrl}/assets/logo-mh.png`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImg} />
      {structured && (
        <script type="application/ld+json">
          {JSON.stringify(structured)}
        </script>
      )}
    </Head>
  );
}

