import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ui } from '../strings';
import { csvCell, jsonValue } from '../lib/admin-data';
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
            <a className="v1-btn v1-btn-primary" href="/">Return to Site</a>
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
    JSON.stringify(r).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="v1-admin-page">
      <div className="v1-admin-layout">
        {/* Sidebar */}
        <aside className={`v1-admin-sidebar ${mobileMenuOpen ? 'is-open' : ''}`}>
          <h2>{ui.admin.title}</h2>

          <button
            className={currentTable === 'dashboard' ? 'is-active' : ''}
            onClick={() => {
              setCurrentTable('dashboard');
              setDraft(null);
              setMobileMenuOpen(false);
            }}
          >
            <span>{ui.admin.dashboard}</span>
          </button>

          <div style={{ height: '8px' }} />

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 12px', color: 'rgba(251,247,241,0.5)' }}>
            Content Tables
          </div>

          {visibleTables.map((tbl) => (
            <button
              key={tbl}
              className={currentTable === tbl ? 'is-active' : ''}
              onClick={() => {
                setCurrentTable(tbl);
                setDraft(null);
                setSearchQuery('');
                setMobileMenuOpen(false);
              }}
            >
              <span>{tbl.replace(/_/g, ' ')}</span>
              {ADMIN_ONLY_TABLES.has(tbl) && (
                <span style={{ fontSize: '10px', background: 'var(--clay-dk)', padding: '2px 6px', borderRadius: '4px' }}>
                  admin
                </span>
              )}
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '12px', color: 'rgba(251,247,241,0.7)', padding: '0 12px 10px' }}>
              Logged in as: <br />
              <strong>{session.user.email}</strong> ({profile.role})
            </div>
            <button onClick={() => supabase.auth.signOut()}>
              <span>{ui.admin.signOut}</span> <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="v1-admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', margin: 0, textTransform: 'capitalize' }}>
              {currentTable.replace(/_/g, ' ')}
            </h1>
            <button
              className="v1-btn v1-btn-sm v1-btn-outline v1-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />} Tables
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
                  placeholder="Search records in this table…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="v1-btn v1-btn-primary" onClick={() => setDraft({})}>
                  + New Record
                </button>
                <button className="v1-btn v1-btn-outline" onClick={handleExportCsv}>
                  Export CSV
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
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0 }}>
                      {draft.id ? `Edit Record #${draft.id}` : 'Create New Record'}
                    </h3>
                    <button type="button" className="v1-btn v1-btn-sm v1-btn-outline" onClick={() => setDraft(null)}>
                      Close Editor
                    </button>
                  </div>

                  {Object.keys(draft.id ? draft : rows[0] || { title: '', name: '' })
                    .filter((col) => !READONLY_COLUMNS.has(col))
                    .map((col) => (
                      <div key={col}>
                        <label>{col.replace(/_/g, ' ')}</label>
                        {typeof draft[col] === 'boolean' ? (
                          <select
                            value={String(draft[col])}
                            onChange={(e) => setDraft({ ...draft, [col]: e.target.value === 'true' })}
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : JSON_COLUMNS.has(col) || String(draft[col] ?? '').length > 80 ? (
                          <textarea
                            value={
                              typeof draft[col] === 'object'
                                ? JSON.stringify(draft[col], null, 2)
                                : draft[col] ?? ''
                            }
                            onChange={(e) => setDraft({ ...draft, [col]: e.target.value })}
                          />
                        ) : col === 'role' && currentTable === 'profiles' ? (
                          <select
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
                            type="text"
                            value={draft[col] ?? ''}
                            onChange={(e) => setDraft({ ...draft, [col]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="submit" className="v1-btn v1-btn-primary">
                      {ui.admin.save}
                    </button>
                    <button type="button" className="v1-btn v1-btn-outline" onClick={() => setDraft(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Records Table */}
              <div className="v1-admin-table-wrap">
                <table className="v1-admin-table">
                  <thead>
                    <tr>
                      {Object.keys(filteredRows[0] || {}).slice(0, 7).map((col) => (
                        <th key={col}>{col.replace(/_/g, ' ')}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => (
                      <tr key={r.id}>
                        {Object.keys(r).slice(0, 7).map((col) => (
                          <td key={col}>
                            {typeof r[col] === 'object'
                              ? JSON.stringify(r[col])
                              : String(r[col] ?? '')}
                          </td>
                        ))}
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
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
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                          No records found.
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
