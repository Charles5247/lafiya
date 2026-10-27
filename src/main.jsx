import React from 'react';
import { ViteReactSSG } from 'vite-react-ssg';
import { getActiveProperties, getPropertyBySlug } from './lib/data';
import './styles.css';

export const createRoot = ViteReactSSG({
  routes: [
    {
      path: '/',
      lazy: async () => ({ Component: (await import('./pages/Home')).Home }),
    },
    {
      path: '/properties',
      lazy: async () => ({ Component: (await import('./pages/Listings')).Listings }),
    },
    {
      path: '/properties/:slug',
      lazy: async () => ({ Component: (await import('./pages/PropertyDetail')).PropertyDetail }),
      getStaticPaths: async () => {
        const properties = await getActiveProperties();
        return (properties || []).map((p) => `/properties/${p.slug}`);
      },
      loader: async ({ params }) => {
        const property = await getPropertyBySlug(params.slug);
        return property;
      },
    },
    {
      path: '/services',
      lazy: async () => ({ Component: (await import('./pages/Services')).Services }),
    },
    {
      path: '/about',
      lazy: async () => ({ Component: (await import('./pages/About')).About }),
    },
    {
      path: '/list-your-property',
      lazy: async () => ({ Component: (await import('./pages/ListYourProperty')).ListYourProperty }),
    },
    {
      path: '/contact',
      lazy: async () => ({ Component: (await import('./pages/Contact')).Contact }),
    },
    {
      path: '/admin/*',
      lazy: async () => ({ Component: (await import('./pages/Admin')).default }),
    },
  ],
});
