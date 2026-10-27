import { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabase.js';
import { seedData } from './seed-data.js';

export function money(n) {
  if (n === null || n === undefined || n === '') return '';
  const num = typeof n === 'number' ? n : Number(n);
  if (Number.isNaN(num)) return String(n);
  return '₦' + num.toLocaleString('en-NG');
}

export function useRows(table, filterKey = '') {
  const fallback = seedData[table] || [];
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!supabase) {
      setData(fallback);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        let q = supabase.from(table).select('*');
        if (table === 'hero_slides') {
          q = q.eq('active', true).order('sort_order', { ascending: true });
        } else if (table === 'properties') {
          q = q.eq('status', 'Active').order('listed_at', { ascending: false });
        } else if (['promises', 'values', 'partners', 'property_categories', 'cities', 'agents', 'services', 'testimonials_google', 'case_studies'].includes(table)) {
          q = q.order('sort_order', { ascending: true });
        }

        const res = await q;
        if (!alive) return;
        if (res.error) {
          setError(res.error);
          setData(fallback);
        } else if (res.data && res.data.length > 0) {
          setData(res.data);
        } else {
          setData(fallback);
        }
      } catch (err) {
        if (alive) {
          setError(err);
          setData(fallback);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [table, filterKey]);

  return { data, loading, error };
}

export function useOne(table) {
  const fallback = seedData[table]?.[0] || null;
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!supabase) {
      setData(fallback);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const { data: resData, error: resError } = await supabase.from(table).select('*').limit(1).maybeSingle();
        if (!alive) return;
        if (resError) {
          setError(resError);
          setData(fallback);
        } else if (resData) {
          setData(resData);
        } else {
          setData(fallback);
        }
      } catch (err) {
        if (alive) {
          setError(err);
          setData(fallback);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [table]);

  return { data, loading, error };
}

export async function getActiveProperties() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('status', 'Active').order('listed_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch {
      // Fallback below
    }
  }
  return seedData.properties;
}

export async function getPropertyBySlug(slug) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('slug', slug).eq('status', 'Active').maybeSingle();
      if (!error && data) return data;
    } catch {
      // Fallback below
    }
  }
  return seedData.properties.find((p) => p.slug === slug) || null;
}

export function track(event, props = {}) {
  if (typeof window !== 'undefined' && localStorage.getItem('analytics-consent') === 'yes' && window.gtag) {
    window.gtag('event', event, props);
  }
}
