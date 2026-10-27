import React from 'react';
import { ViteReactSSG } from 'vite-react-ssg';
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { PropertyDetail } from './pages/PropertyDetail';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { ListYourProperty } from './pages/ListYourProperty';
import { Contact } from './pages/Contact';
import Admin from './pages/Admin';
import { getActiveProperties, getPropertyBySlug } from './lib/data';
import './styles.css';

export const createRoot = ViteReactSSG({
  routes: [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/properties',
      element: <Listings />,
    },
    {
      path: '/properties/:slug',
      element: <PropertyDetail />,
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
      element: <Services />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/list-your-property',
      element: <ListYourProperty />,
    },
    {
      path: '/contact',
      element: <Contact />,
    },
    {
      path: '/admin/*',
      element: <Admin />,
    },
  ],
});
