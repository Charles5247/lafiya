import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ui } from '../strings';
import { csvCell, jsonValue } from '../lib/admin-data';
import { adminTemplates } from '../lib/admin-templates';
import { Image } from '../lib/media';
import {
  Menu,
  X,
  Search,
  Upload,
  LogOut,
  Check,
  ShieldAlert,
  ArrowRight,
  User,
  Users,
  Settings,
  Grid3X3,
  FileCheck,
} from '../lib/icons';

const ALL_TABLES = [
  'site_settings',
  'metrics',
  'hero_slides',
  'property_categories',
  'cities',
  'agents',
  'properties',
  'services',
  'case_studies',
  'testimonials_google',
  'partners',
  'values',
  'promises',
  'about_page',
  'services_page',
  'enquiries',
  'property_listings',
  'contact_messages',
  'media',
  'profiles',
];

const ADMIN_ONLY_TABLES = new Set(['site_settings', 'metrics', 'profiles']);
const JSON_COLUMNS = new Set(['gallery', 'features', 'badges', 'uploads', 'process_steps', 'service_lines']);
const READONLY_COLUMNS = new Set(['id', 'created_at', 'updated_at', 'submitted_at']);

export default function Admin() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentTable, setCurrentTable] = useState('dashboard');
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [relations, setRelations] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [counts, setCounts] = useState({
    enquiries: 0,
    listings: 0,
    messages: 0,
    activeProperties: 0,
    draftProperties: 0,
  });

  // Media upload state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaUploading, setMediaUploading] = useState(false);
  const [propertyImageFile, setPropertyImageFile] = useState(null);
  const [propertyImageAlt, setPropertyImageAlt] = useState('');
  const [propertyImageUploading, setPropertyImageUploading] = useState(false);

  // Supabase Auth listener
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch profile when session changes
  useEffect(() => {
    if (!session?.user?.id || !supabase) {
      setProfile(null);
      return;
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setProfile(data);
        } else {
          // Default profile if not found
          setProfile({ id: session.user.id, email: session.user.email, role: 'user' });
        }
      });
  }, [session?.user?.id]);

  // Load dashboard counts or table data
  useEffect(() => {
    if (!profile || !['admin', 'editor'].includes(profile.role) || !supabase) return;

    if (currentTable === 'dashboard') {
      loadDashboardCounts();
    } else {
      fetchTableRows();
    }
  }, [currentTable, profile?.role]);

  useEffect(() => {
    if (!profile || !supabase) return;
    Promise.all(['property_categories', 'cities', 'agents', 'profiles', 'properties'].map(async table => {
      const { data } = await supabase.from(table).select('*').limit(500);
      return [table, data || []];
    })).then(entries => setRelations(Object.fromEntries(entries)));
  }, [profile?.role]);

  async function loadDashboardCounts() {
    try {
      const [enq, list, msg, act, dft] = await Promise.all([
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'New'),
        supabase.from('property_listings').select('*', { count: 'exact', head: true }).eq('status', 'New'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'New'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'Draft'),
      ]);

      setCounts({
        enquiries: enq.count || 0,
        listings: list.count || 0,
        messages: msg.count || 0,
        activeProperties: act.count || 0,
        draftProperties: dft.count || 0,
      });
    } catch (err) {
      console.error('Failed to load counts', err);
    }
  }

  async function fetchTableRows() {
    setErrorMsg('');
    try {
      let q = supabase.from(currentTable).select('*').limit(500);
      if (['enquiries', 'property_listings', 'contact_messages'].includes(currentTable)) {
        q = q.order('submitted_at', { ascending: false });
      } else if (['properties'].includes(currentTable)) {
        q = q.order('listed_at', { ascending: false });
      }
      const { data, error } = await q;
      if (error) throw error;
      setRows(data || []);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (newPassword.length < 12) {
        throw new Error('Password must be at least 12 characters.');
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false },
      });
      if (error) throw error;
      setInfoMsg('Password updated successfully.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleSaveRecord(e) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    try {
      const payload = { ...draft };

      // Process columns
      for (const col of Object.keys(payload)) {
        if (READONLY_COLUMNS.has(col)) {
          delete payload[col];
        } else if (JSON_COLUMNS.has(col)) {
          payload[col] = jsonValue(payload[col]);
        } else if (payload[col] === '') {
          payload[col] = null;
        }
      }

      // Auto-slug for properties if empty
      if (currentTable === 'properties' && !payload.slug && payload.title) {
        payload.slug = payload.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      if (currentTable === 'properties' && payload.main_image) {
        payload.gallery = [...new Set([payload.main_image, ...(payload.gallery || [])])];
      }

      let res;
      if (draft.id) {
        res = await supabase.from(currentTable).update(payload).eq('id', draft.id);
      } else {
        res = await supabase.from(currentTable).insert(payload);
      }

      if (res.error) throw res.error;

      setDraft(null);
      setInfoMsg('Record saved successfully.');
      fetchTableRows();
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function handleDeleteRecord(row) {
    if (!window.confirm(`Are you sure you want to delete this record (ID: ${row.id})?`)) return;
    setErrorMsg('');
    try {
      const { error } = await supabase.from(currentTable).delete().eq('id', row.id);
      if (error) throw error;
      setInfoMsg('Record deleted.');
      fetchTableRows();
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  // Convert owner listing to property via RPC
  async function handleConvertListing(row) {
    setErrorMsg('');
    try {
      const { data, error } = await supabase.rpc('convert_listing_to_property', { p_id: row.id });
      if (error) throw error;
      setInfoMsg(`Listing converted to Draft property #${data}!`);
      fetchTableRows();
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  async function openOwnerUpload(path) {
    const tab = window.open('', '_blank');
    const { data, error } = await supabase.storage.from('owner-uploads').createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
      tab?.close();
      setErrorMsg(error?.message || 'Could not open photo.');
      return;
    }
    if (tab) tab.location.href = data.signedUrl;
  }

  // Media upload with required alt text
  async function handleUploadMedia(e) {
    e.preventDefault();
    if (!mediaFile) {
      setErrorMsg('Please select an image file to upload.');
      return;
    }
    if (!mediaAlt.trim()) {
      setErrorMsg('Alt text is required for every media upload.');
      return;
    }

    setMediaUploading(true);
    setErrorMsg('');
    try {
      const ext = mediaFile.name.split('.').pop();
      const safeName = `${crypto.randomUUID()}.${ext}`;
      const uploadRes = await supabase.storage.from('site-media').upload(safeName, mediaFile, {
        contentType: mediaFile.type,
      });

      if (uploadRes.error) throw uploadRes.error;

      const { data } = supabase.storage.from('site-media').getPublicUrl(safeName);

      const insertRes = await supabase.from('media').insert({
        url: data.publicUrl,
        alt_text: mediaAlt.trim(),
        filename: mediaFile.name,
      });

      if (insertRes.error) throw insertRes.error;

      setMediaFile(null);
      setMediaAlt('');
      setInfoMsg('Image uploaded and registered to media library.');
      fetchTableRows();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setMediaUploading(false);
    }
  }

  async function handlePropertyImageUpload(e) {
    const fileInput = e.currentTarget.closest('.v1-admin-image-upload').querySelector('input[type="file"]');
    if (!propertyImageFile || !draft || currentTable !== 'properties') return;
    const allowedTypes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
    if (!allowedTypes[propertyImageFile.type] || propertyImageFile.size > 5 * 1024 * 1024) {
      setErrorMsg(ui.admin.propertyImageInvalid);
      return;
    }
    if (!propertyImageAlt.trim()) {
      setErrorMsg(ui.admin.propertyImageAltRequired);
      return;
    }
    setPropertyImageUploading(true);
    setErrorMsg('');
    const extension = allowedTypes[propertyImageFile.type];
    const path = `properties/${draft.id || 'drafts'}/${crypto.randomUUID()}.${extension}`;
    try {
      const { error: uploadError } = await supabase.storage.from('site-media').upload(path, propertyImageFile, { contentType: propertyImageFile.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('site-media').getPublicUrl(path);
      const { error: mediaError } = await supabase.from('media').insert({ url: data.publicUrl, alt_text: propertyImageAlt.trim(), filename: propertyImageFile.name });
      if (mediaError) {
        await supabase.storage.from('site-media').remove([path]);
        throw mediaError;
      }
      const gallery = Array.isArray(draft.gallery) ? draft.gallery : jsonValue(draft.gallery || '[]');
      setDraft({ ...draft, main_image: draft.main_image || data.publicUrl, gallery: [...new Set([draft.main_image, ...gallery, data.publicUrl].filter(Boolean))] });
      setPropertyImageFile(null);
      setPropertyImageAlt('');
      fileInput.value = '';
      setInfoMsg(ui.admin.propertyImageAdded);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setPropertyImageUploading(false);
    }
  }

  // Export CSV with formula injection prevention
  function handleExportCsv() {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.map(csvCell).join(','),
      ...rows.map((r) => headers.map((k) => csvCell(r[k])).join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentTable}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Offline / Supabase unconfigured state
  if (!supabase) {
    return (
      <div className="v1-admin-page">
        <div className="v1-admin-login-box" style={{ textAlign: 'center' }}>
          <h2>{ui.admin.title}</h2>
          <p style={{ color: 'var(--muted)', marginTop: '12px' }}>
            Supabase is not configured yet. Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code>.
          </p>
          <div style={{ marginTop: '20px' }}>
            <a className="v1-btn v1-btn-primary" href={import.meta.env.VITE_SITE_URL || 'https://mailafiya-homes.vercel.app'}>Return to Site</a>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="v1-admin-page">
        <div className="v1-admin-login-box">
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--char)' }}>
            {ui.admin.login}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '24px' }}>
            Sign in with your staff credentials to manage listings and submissions.
          </p>

          <form onSubmit={handleSignIn}>
            <div className="v1-form-field">
              <label>{ui.admin.email}</label>
              <input
                type="email"
                className="v1-input"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="v1-form-field">
              <label>{ui.admin.password}</label>
              <input
                type="password"
                className="v1-input"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            {errorMsg && (
              <p style={{ color: '#b22222', fontSize: '13px', marginBottom: '14px' }}>
                {errorMsg}
              </p>
            )}

            <button type="submit" className="v1-btn v1-btn-primary" style={{ width: '100%' }}>
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Role check: must be admin or editor
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    return (
      <div className="v1-admin-page">
        <div className="v1-admin-login-box" style={{ textAlign: 'center' }}>
          <ShieldAlert size={44} color="#b22222" style={{ margin: '0 auto 12px' }} />
          <h3>Access Denied</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '12px 0 24px' }}>
            Your account ({session.user.email}) has role <strong>"{profile?.role || 'user'}"</strong>.
            Staff or administrator access is required.
          </p>
          <button className="v1-btn v1-btn-outline" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Force password change on first login
  if (session.user.user_metadata?.must_change_password) {
    return (
      <div className="v1-admin-page">
        <div className="v1-admin-login-box">
          <h2>{ui.admin.changePassword}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '20px' }}>
            For security, please set a new personal password (minimum 12 characters).
          </p>
          <form onSubmit={handleUpdatePassword}>
            <div className="v1-form-field">
              <label>{ui.admin.newPassword}</label>
              <input
                type="password"
                className="v1-input"
                minLength={12}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {errorMsg && <p style={{ color: '#b22222', fontSize: '13px' }}>{errorMsg}</p>}
            {infoMsg && <p style={{ color: '#18842c', fontSize: '13px' }}>{infoMsg}</p>}

            <button type="submit" className="v1-btn v1-btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Update Password & Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter tables by permission
  const visibleTables = ALL_TABLES.filter(
    (tbl) => profile.role === 'admin' || !ADMIN_ONLY_TABLES.has(tbl)
  );

  // Filter rows by search query
  const filteredRows = rows.filter((r) =>
    (!statusFilter || r.status === statusFilter) && JSON.stringify(r).toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a,b) => sortColumn ? String(a[sortColumn] ?? '').localeCompare(String(b[sortColumn] ?? ''), undefined, {numeric:true}) : 0);

  const tableLabel = (table) => ui.admin.tableLabels[table] || table.replace(/_/g, ' ');
  const editorColumns = draft
    ? Object.keys(draft).filter((col) => !READONLY_COLUMNS.has(col) && (currentTable !== 'properties' || !['main_image', 'gallery'].includes(col)))
    : [];
  const propertyGallery = currentTable === 'properties' && draft
    ? (Array.isArray(draft.gallery) ? draft.gallery : jsonValue(draft.gallery || '[]'))
    : [];
  const propertyImages = draft && currentTable === 'properties'
    ? [...new Set([draft.main_image, ...propertyGallery].filter(Boolean))]
    : [];
  const propertyGroups = currentTable === 'properties' ? ui.admin.propertyGroups.map((group) => ({
    ...group,
    columns: group.columns.filter((col) => editorColumns.includes(col)),
  })).filter((group) => group.columns.length) : [];
  const groupedColumns = new Set(propertyGroups.flatMap((group) => group.columns));
  const editorGroups = draft ? [
    ...propertyGroups,
    ...((currentTable !== 'properties' || editorColumns.some((col) => !groupedColumns.has(col)))
      ? [{ label: currentTable === 'properties' ? ui.admin.otherDetails : tableLabel(currentTable), columns: editorColumns.filter((col) => !groupedColumns.has(col)) }]
      : []),
  ] : [];
  const tableColumns = currentTable === 'properties'
    ? ['title', 'status', 'price', 'area', 'listing']
    : currentTable === 'property_listings'
      ? ['owner_name', 'property_type', 'city', 'status', 'submitted_at']
      : ['name', 'title', 'email', 'subject', 'status', 'created_at', 'submitted_at'].filter((col) => rows[0] && col in rows[0]).slice(0, 5);
  if (rows[0] && tableColumns.length === 0) tableColumns.push(...Object.keys(rows[0]).filter((col) => col !== 'id').slice(0, 4));

  function displayValue(row, column) {
    const value = row[column];
    if (value == null || value === '') return '—';
    if (column === 'price') return new Intl.NumberFormat('en-NG', { style: 'currency', currency: row.currency || 'NGN', maximumFractionDigits: 0 }).format(Number(value));
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  function selectTable(table) {
    setCurrentTable(table);
    setDraft(null);
    setSearchQuery('');
    setStatusFilter('');
    setSortColumn('');
    setMobileMenuOpen(false);
  }

  return (
    <div className="v1-admin-page">
      <div className="v1-admin-layout">
        {mobileMenuOpen && <button className="v1-admin-backdrop" type="button" onClick={() => setMobileMenuOpen(false)} aria-label={ui.admin.closeMenu} />}
        <aside id="admin-navigation" className={`v1-admin-sidebar ${mobileMenuOpen ? 'is-open' : ''}`} aria-label={ui.admin.menu}>
          <div className="v1-admin-brand">
            <span className="v1-admin-monogram">MH</span>
            <span><strong>Mai'Lafiya</strong><small>{ui.admin.workspace}</small></span>
            <button className="v1-admin-close-menu" type="button" onClick={() => setMobileMenuOpen(false)} aria-label={ui.admin.closeMenu}><X size={20} /></button>
          </div>

          <nav className="v1-admin-nav">
            {ui.admin.navGroups.map((group) => {
              const tables = group.tables.filter((table) => table === 'dashboard' || visibleTables.includes(table));
              return <div className="v1-admin-nav-group" key={group.label}>
                <div className="v1-admin-nav-heading">{group.label}</div>
                {tables.map((table) => <button
                  key={table}
                  type="button"
                  className={currentTable === table ? 'is-active' : ''}
                  onClick={() => selectTable(table)}
                  aria-current={currentTable === table ? 'page' : undefined}
                >
                  <span>{tableLabel(table)}</span>
                  {table === 'enquiries' && counts.enquiries > 0 && <span className="v1-admin-nav-count">{counts.enquiries}</span>}
                  {table === 'property_listings' && counts.listings > 0 && <span className="v1-admin-nav-count">{counts.listings}</span>}
                  {table === 'contact_messages' && counts.messages > 0 && <span className="v1-admin-nav-count">{counts.messages}</span>}
                </button>)}
              </div>;
            })}
          </nav>

          <div className="v1-admin-account">
            <span className="v1-admin-avatar">{(session.user.email || 'S')[0].toUpperCase()}</span>
            <span className="v1-admin-account-name"><strong>{session.user.email}</strong><small>{profile.role}</small></span>
            <button type="button" onClick={() => supabase.auth.signOut()} aria-label={ui.admin.signOut}><LogOut size={18} /></button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="v1-admin-content">
          <div className="v1-admin-page-head">
            <div>
              <span className="v1-admin-kicker">{ui.admin.workspace}</span>
              <h1>{tableLabel(currentTable)}</h1>
              <p>{ui.admin.pageHelp}</p>
            </div>
            <button
              className="v1-btn v1-btn-sm v1-btn-outline v1-admin-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="admin-navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />} {ui.admin.menu}
            </button>
          </div>

          {errorMsg && (
            <div style={{ background: '#fdf2f2', border: '1px solid #f8b4b4', color: '#9b1c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div style={{ background: '#e7f6e8', border: '1px solid #a3e635', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              {infoMsg}
            </div>
          )}

          {/* DASHBOARD VIEW */}
          {currentTable === 'dashboard' ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--clay)' }}>{counts.enquiries}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>New Enquiries</div>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--clay)' }}>{counts.listings}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>New Owner Listings</div>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--clay)' }}>{counts.messages}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>New Contact Messages</div>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--green)' }}>{counts.activeProperties}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Active Published Properties</div>
                </div>

                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--muted)' }}>{counts.draftProperties}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Draft Properties</div>
                </div>
              </div>

              <h3>Quick Navigation</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="v1-btn v1-btn-primary" onClick={() => setCurrentTable('enquiries')}>
                  Open Enquiries Inbox
                </button>
                <button className="v1-btn v1-btn-primary" onClick={() => setCurrentTable('property_listings')}>
                  Open Owner Listings Inbox
                </button>
                <button className="v1-btn v1-btn-outline" onClick={() => setCurrentTable('properties')}>
                  Manage Properties
                </button>
                <button className="v1-btn v1-btn-outline" onClick={() => setCurrentTable('media')}>
                  Media Library
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="v1-admin-tools">
                <input
                  type="text"
                  placeholder={ui.admin.searchRecords}
                  aria-label={ui.admin.searchRecords}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {adminTemplates[currentTable] && <button className="v1-btn v1-btn-primary" onClick={() => setDraft({...adminTemplates[currentTable]})}>
                  + {ui.admin.create}
                </button>}
                {['enquiries', 'property_listings', 'contact_messages', 'properties'].includes(currentTable) && <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">{ui.admin.allStatuses}</option>{[...new Set(rows.map(r => r.status).filter(Boolean))].map(s => <option key={s}>{s}</option>)}</select>}
                <select aria-label="Sort records" value={sortColumn} onChange={e => setSortColumn(e.target.value)}><option value="">{ui.admin.defaultOrder}</option>{Object.keys(rows[0] || adminTemplates[currentTable] || {}).map(k => <option key={k} value={k}>{k.replace(/_/g,' ')}</option>)}</select>
                <button className="v1-btn v1-btn-outline" onClick={handleExportCsv}>
                  {ui.admin.export}
                </button>
              </div>

              {/* Media Upload Box (Only on Media table) */}
              {currentTable === 'media' && (
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', margin: '0 0 12px' }}>Upload Image to Media Library</h3>
                  <form onSubmit={handleUploadMedia} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMediaFile(e.target.files[0])}
                    />
                    <input
                      type="text"
                      placeholder="Required Alt Text (e.g. Bompai Warehouse Front)"
                      value={mediaAlt}
                      style={{ flex: 1, minWidth: '220px' }}
                      onChange={(e) => setMediaAlt(e.target.value)}
                      required
                    />
                    <button type="submit" className="v1-btn v1-btn-primary" disabled={mediaUploading}>
                      {mediaUploading ? 'Uploading…' : 'Upload Image'}
                    </button>
                  </form>
                </div>
              )}

              {/* Edit / Create Form */}
              {draft && (
                <form className="v1-admin-editor" onSubmit={handleSaveRecord}>
                  <div className="v1-admin-editor-head">
                    <div><span className="v1-admin-kicker">{tableLabel(currentTable)}</span><h2>
                      {draft.id ? (draft.title || draft.name || `Edit ${tableLabel(currentTable)}`) : `New ${tableLabel(currentTable)}`}
                    </h2></div>
                    <button type="button" className="v1-btn v1-btn-sm v1-btn-outline" onClick={() => setDraft(null)}>
                      {ui.admin.closeEditor}
                    </button>
                  </div>

                  {currentTable === 'properties' && <fieldset className="v1-admin-fieldset v1-admin-images">
                    <legend>{ui.admin.propertyImages}</legend>
                    <p>{ui.admin.propertyImagesHelp}</p>
                    <div className="v1-admin-image-grid">
                      {propertyImages.map((url, index) => <div className="v1-admin-image-card" key={`${url}-${index}`}>
                        <Image src={url} alt={`${draft.title || ui.admin.propertyImages} ${index + 1}`} />
                        <div className="v1-admin-image-card-actions">
                          {draft.main_image === url ? <strong>{ui.admin.mainPhoto}</strong> : <button type="button" onClick={() => setDraft({ ...draft, main_image: url, gallery: [url, ...propertyImages.filter((image) => image !== url)] })}>{ui.admin.setMainPhoto}</button>}
                          <button type="button" onClick={() => {
                            const next = propertyImages.filter((_, itemIndex) => itemIndex !== index);
                            setDraft({ ...draft, gallery: next, main_image: draft.main_image === url ? (next[0] || '') : draft.main_image });
                          }}>{ui.admin.removePhoto}</button>
                        </div>
                      </div>)}
                    </div>
                    <div className="v1-admin-image-upload">
                      <label>{ui.admin.choosePropertyImage}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setPropertyImageFile(e.target.files?.[0] || null)} /></label>
                      <label>{ui.admin.imageAltText}<input type="text" value={propertyImageAlt} onChange={(e) => setPropertyImageAlt(e.target.value)} placeholder={ui.admin.imageAltExample} /></label>
                      <button type="button" className="v1-btn v1-btn-outline" onClick={handlePropertyImageUpload} disabled={propertyImageUploading || !propertyImageFile}>{propertyImageUploading ? ui.admin.uploadingImage : ui.admin.addPhoto}</button>
                    </div>
                  </fieldset>}

                  {editorGroups.map((group) => <fieldset className="v1-admin-fieldset" key={group.label}>
                    <legend>{group.label}</legend>
                    <div className="v1-admin-field-grid">
                    {group.columns.map((col) => (
                      <div className={`v1-admin-field ${['description', 'features', 'gallery', 'process_steps', 'notes', 'story_body'].includes(col) ? 'is-wide' : ''}`} key={col}>
                        <label htmlFor={`admin-${col}`}>{ui.admin.fieldLabels[col] || col.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</label>
                        {currentTable === 'properties' && ['status', 'listing', 'sub_category'].includes(col) ? (
                          <select id={`admin-${col}`} value={draft[col] ?? ''} onChange={(e) => setDraft({ ...draft, [col]: e.target.value })}>
                            {(col === 'status' ? ui.admin.propertyStatuses : col === 'listing' ? ui.admin.listingKinds : ui.admin.subCategories).map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : typeof draft[col] === 'boolean' ? (
                          <select
                            id={`admin-${col}`}
                            value={String(draft[col])}
                            onChange={(e) => setDraft({ ...draft, [col]: e.target.value === 'true' })}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : JSON_COLUMNS.has(col) || String(draft[col] ?? '').length > 80 ? (
                          <textarea
                            id={`admin-${col}`}
                            value={
                              typeof draft[col] === 'object'
                                ? JSON.stringify(draft[col], null, 2)
                                : draft[col] ?? ''
                            }
                            onChange={(e) => setDraft({ ...draft, [col]: e.target.value })}
                          />
                        ) : ['category_id', 'city_id', 'agent_id', 'property_id', 'assigned_to'].includes(col) ? (
                          <select id={`admin-${col}`} value={draft[col] ?? ''} onChange={e => setDraft({...draft, [col]: e.target.value || null})}>
                            <option value="">Select…</option>
                            {(relations[{category_id:'property_categories',city_id:'cities',agent_id:'agents',property_id:'properties',assigned_to:'profiles'}[col]] || []).map(option => <option key={option.id} value={option.id}>{option.name || option.display_name || option.title || option.email}</option>)}
                          </select>
                        ) : col === 'role' && currentTable === 'profiles' ? (
                          <select
                            id={`admin-${col}`}
                            value={draft[col] || 'user'}
                            onChange={(e) => setDraft({ ...draft, [col]: e.target.value })}
                            disabled={draft.id === session.user.id}
                          >
                            <option value="user">user</option>
                            <option value="editor">editor</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <input
                            id={`admin-${col}`}
                            type={['price', 'size_sqm', 'bedrooms', 'bathrooms', 'dock_doors', 'floors', 'year_built', 'latitude', 'longitude', 'sort_order'].includes(col) ? 'number' : 'text'}
                            step={['latitude', 'longitude', 'size_sqm'].includes(col) ? 'any' : undefined}
                            value={draft[col] ?? ''}
                            onChange={(e) => setDraft({ ...draft, [col]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                    </div>
                  </fieldset>)}

                  <div className="v1-admin-editor-actions">
                    <button type="submit" className="v1-btn v1-btn-primary">
                      {ui.admin.save}
                    </button>
                    <button type="button" className="v1-btn v1-btn-outline" onClick={() => setDraft(null)}>
                      {ui.admin.cancel}
                    </button>
                  </div>
                </form>
              )}

              {/* Records Table */}
              <div className="v1-admin-table-wrap">
                <table className="v1-admin-table">
                  <thead>
                    <tr>
                      {tableColumns.map((col) => (
                        <th key={col}>{ui.admin.fieldLabels[col] || col.replace(/_/g, ' ')}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => (
                      <tr key={r.id}>
                        {tableColumns.map((col) => (
                          <td key={col} data-label={ui.admin.fieldLabels[col] || col.replace(/_/g, ' ')}>
                            {col === 'status' ? <span className={`v1-admin-status ${String(r[col] || '').toLowerCase().replace(/\s+/g, '-')}`}>{displayValue(r, col)}</span> : displayValue(r, col)}
                          </td>
                        ))}
                        <td data-label="Actions">
                          <div className="v1-admin-row-actions">
                            <button
                              className="v1-btn v1-btn-sm v1-btn-outline"
                              onClick={() => setDraft(r)}
                            >
                              Edit
                            </button>

                            {currentTable === 'property_listings' && !r.converted_to_property_id && (
                              <button
                                className="v1-btn v1-btn-sm v1-btn-gold"
                                onClick={() => handleConvertListing(r)}
                              >
                                Convert
                              </button>
                            )}

                            {currentTable !== 'profiles' && (
                              <button
                                className="v1-btn v1-btn-sm v1-btn-outline"
                                style={{ color: '#b22222', borderColor: '#f8b4b4' }}
                                onClick={() => handleDeleteRecord(r)}
                              >
                                Delete
                              </button>
                            )}
                            {currentTable === 'property_listings' && Array.isArray(r.uploads) && r.uploads.map((path, index) => <button key={index} className="v1-btn v1-btn-sm v1-btn-outline" onClick={() => openOwnerUpload(path)}>Photo {index + 1}</button>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={tableColumns.length + 1} style={{ textAlign: 'center', padding: '30px' }}>
                          {ui.admin.noRecords}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
