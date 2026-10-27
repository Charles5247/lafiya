import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Meta } from '../components/Meta';
import { PropertyCard } from '../components/PropertyCard';
import { useRows, money } from '../lib/data';
import { ui } from '../strings';
import { supabase } from '../lib/supabase';
import { Grid3X3, List, ChevronLeft, ChevronRight, Search, ArrowRight } from '../lib/icons';

const ITEMS_PER_PAGE = 9;

export function Listings() {
  const { data: allProperties, loading } = useRows('properties');
  const { data: categories } = useRows('property_categories');
  const { data: cities } = useRows('cities');

  const [params, setSearchParams] = useSearchParams();
  const [serverPage, setServerPage] = useState([]);
  const [serverCount, setServerCount] = useState(0);
  const [serverLoading, setServerLoading] = useState(Boolean(supabase));

  // View state: grid or list, stored in localStorage
  const [view, setView] = useState('grid');
  useEffect(() => { setView(localStorage.getItem('property-view') || 'grid'); }, []);

  const handleViewChange = (newView) => {
    setView(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem('property-view', newView);
    }
  };

  // URL parameters
  const selectedCategory = params.get('category') || '';
  const selectedCity = params.get('city') || '';
  const selectedListing = params.get('listing') || '';
  const minPriceParam = params.get('minPrice') || '';
  const maxPriceParam = params.get('maxPrice') || '';
  const sortParam = params.get('sort') || '';
  const currentPage = Math.max(1, parseInt(params.get('page') || '1', 10));

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const category = selectedCategory ? categories.find(c => c.slug === selectedCategory) : null;
    const city = selectedCity ? cities.find(c => c.slug === selectedCity) : null;
    if ((selectedCategory && !category && !categories.length) || (selectedCity && !city && !cities.length)) return;
    if ((selectedCategory && !category) || (selectedCity && !city)) {
      setServerPage([]);
      setServerCount(0);
      setServerLoading(false);
      return;
    }
    setServerLoading(true);
    let query = supabase.from('properties').select('*', { count: 'exact' }).eq('status', 'Active');
    if (category) query = query.eq('category_id', category.id);
    if (city) query = query.eq('city_id', city.id);
    if (selectedListing) query = query.eq('listing', selectedListing);
    if (minPriceParam) query = query.gte('price', Number(minPriceParam));
    if (maxPriceParam) query = query.lte('price', Number(maxPriceParam));
    if (sortParam === 'priceAsc' || sortParam === 'priceDesc') query = query.order('price', { ascending: sortParam === 'priceAsc' });
    else if (sortParam === 'newest') query = query.order('listed_at', { ascending: false });
    else query = query.order('is_featured', { ascending: false }).order('listed_at', { ascending: false });
    query.range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1).then(({data,count,error}) => {
      if (!alive) return;
      setServerPage(error ? [] : data || []);
      setServerCount(error ? 0 : count || 0);
      setServerLoading(false);
    });
    return () => { alive = false; };
  }, [selectedCategory, selectedCity, selectedListing, minPriceParam, maxPriceParam, sortParam, currentPage, categories.length, cities.length]);

  // Local state for debounced price slider
  const [sliderPrice, setSliderPrice] = useState(() => {
    return maxPriceParam ? Number(maxPriceParam) : 5000000000;
  });

  // Keep sliderPrice in sync when URL changes externally
  useEffect(() => {
    if (maxPriceParam) {
      setSliderPrice(Number(maxPriceParam));
    } else {
      setSliderPrice(5000000000);
    }
  }, [maxPriceParam]);

  // Debounce slider updates to URL by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParam = params.get('maxPrice');
      if (sliderPrice < 5000000000) {
        if (currentParam !== String(sliderPrice)) {
          updateParam('maxPrice', String(sliderPrice));
        }
      } else if (currentParam) {
        updateParam('maxPrice', null);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [sliderPrice]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.delete('page'); // Reset to page 1 on filter change
    }
    setSearchParams(next);
  }

  function handleReset() {
    setSearchParams(new URLSearchParams());
    setSliderPrice(5000000000);
  }

  // Filter properties in memory
  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      if (p.status !== 'Active') return false;

      if (selectedCategory) {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat && p.category_id !== cat.id) return false;
      }

      if (selectedCity) {
        const city = cities.find((c) => c.slug === selectedCity);
        if (city && p.city_id !== city.id) return false;
      }

      if (selectedListing && p.listing !== selectedListing) {
        return false;
      }

      if (minPriceParam && Number(p.price) < Number(minPriceParam)) {
        return false;
      }

      if (maxPriceParam && Number(p.price) > Number(maxPriceParam)) {
        return false;
      }

      return true;
    });
  }, [allProperties, selectedCategory, selectedCity, selectedListing, minPriceParam, maxPriceParam, categories, cities]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sortParam === 'priceAsc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortParam === 'priceDesc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortParam === 'newest') {
      list.sort((a, b) => new Date(b.listed_at || 0) - new Date(a.listed_at || 0));
    } else {
      // Default: featured first, then listed_at descending
      list.sort((a, b) => {
        if (a.is_featured === b.is_featured) {
          return new Date(b.listed_at || 0) - new Date(a.listed_at || 0);
        }
        return a.is_featured ? -1 : 1;
      });
    }
    return list;
  }, [filteredProperties, sortParam]);

  // Pagination
  const totalItems = supabase ? serverCount : sortedProperties.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedProperties = supabase ? serverPage : sortedProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Shell>
      <Meta
        title="Commercial & Industrial Real Estate Listings"
        description="Search active warehouses for lease and sale, commercial office spaces, residential properties, and industrial land across Northern Nigeria."
      />

      {/* Hero band */}
      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">
            <Link to="/">Home</Link> / <span>Properties</span>
          </div>
          <h1>{ui.listHero.title}</h1>
          <p className="v1-page-hero-p">
            Showing {totalItems} verified properties across Northern Nigeria.
          </p>
        </div>
      </section>

      {/* Listings Body */}
      <div className="v1-listings-body">
        <div className="v1-container">
          {/* Filter Bar */}
          <div className="v1-filter-bar">
            <div className="v1-filter-field">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => updateParam('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="v1-filter-field">
              <label>City</label>
              <select
                value={selectedCity}
                onChange={(e) => updateParam('city', e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((ci) => (
                  <option key={ci.id} value={ci.slug}>
                    {ci.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="v1-filter-field">
              <label>Listing Type</label>
              <select
                value={selectedListing}
                onChange={(e) => updateParam('listing', e.target.value)}
              >
                <option value="">All Listings</option>
                <option value="For Lease">For Lease</option>
                <option value="For Sale">For Sale</option>
                <option value="Short-let">Short-let</option>
              </select>
            </div>

            <div className="v1-filter-field v1-filter-field--wide">
              <label>
                Max Price: {sliderPrice >= 5000000000 ? 'Any' : money(sliderPrice)}
              </label>
              <input
                type="range"
                min="10000000"
                max="5000000000"
                step="10000000"
                value={sliderPrice}
                onChange={(e) => setSliderPrice(Number(e.target.value))}
                aria-label="Filter by maximum price"
              />
            </div>

            <div className="v1-filter-field v1-filter-btn">
              <button
                className="v1-btn v1-btn-outline"
                style={{ width: '100%' }}
                onClick={handleReset}
              >
                {ui.actions.resetFilters}
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="v1-toolbar">
            <div className="v1-toolbar-count">
              <strong>{totalItems}</strong> properties available
            </div>

            <div className="v1-toolbar-right">
              <div className="v1-sort">
                <span>Sort by:</span>
                <select
                  value={sortParam}
                  onChange={(e) => updateParam('sort', e.target.value)}
                >
                  <option value="">Featured</option>
                  <option value="newest">Newest Listed</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>

              <div className="v1-view-toggle">
                <button
                  className={view === 'grid' ? 'is-active' : ''}
                  onClick={() => handleViewChange('grid')}
                  aria-label="Switch to grid view"
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  className={view === 'list' ? 'is-active' : ''}
                  onClick={() => handleViewChange('list')}
                  aria-label="Switch to list view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Property Cards or List */}
          {serverLoading && supabase ? <p>{ui.status.loading}</p> : totalItems > 0 ? (
            view === 'grid' ? (
              <div className="v1-pgrid">
                {paginatedProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    p={p}
                    categories={categories}
                    cities={cities}
                    view="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="v1-plist">
                {paginatedProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    p={p}
                    categories={categories}
                    cities={cities}
                    view="list"
                  />
                ))}
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '999px',
                  background: 'var(--cream-dp)',
                  color: 'var(--muted)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: '24px' }}>{ui.status.empty}</h3>
              <p style={{ color: 'var(--muted)', maxWidth: '400px', margin: '0 auto 24px' }}>
                Try adjusting your price range, location or property category to see more results.
              </p>
              <button className="v1-btn v1-btn-primary" onClick={handleReset}>
                {ui.actions.resetFilters}
              </button>
            </div>
          )}

          {/* Pagination with Ellipsis */}
          {totalPages > 1 && (
            <nav className="v1-pagination" aria-label="Pagination">
              <button
                className="v1-page-btn"
                disabled={currentPage === 1}
                onClick={() => updateParam('page', String(currentPage - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page > array[index - 1] + 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="v1-page-ellipsis">…</span>}
                      <button
                        className={`v1-page-btn ${currentPage === page ? 'is-active' : ''}`}
                        onClick={() => updateParam('page', String(page))}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                className="v1-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => updateParam('page', String(currentPage + 1))}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* CTA Band */}
      <section className="v1-ctaband">
        <div className="v1-container">
          <div className="v1-ctaband-inner">
            <div>
              <span className="v1-ctaband-eyebrow">CAN’T FIND WHAT YOU’RE LOOKING FOR?</span>
              <h2 className="v1-ctaband-h">We source off-market properties on request.</h2>
              <p className="v1-ctaband-p">
                Tell us your specification, budget, and timeline. Our consultants will walk and verify candidate properties for you.
              </p>
            </div>
            <div className="v1-ctaband-actions">
              <Link className="v1-btn v1-btn-lg v1-btn-gold" to="/contact">
                Submit an enquiry <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}

