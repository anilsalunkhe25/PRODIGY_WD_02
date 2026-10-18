import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown, ArrowUp, ArrowUpDown, Bell, BriefcaseBusiness, Building2, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download, Ellipsis,
  LayoutDashboard, LogOut, Mail, MapPin, Menu, Plus, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Users, X,
} from 'lucide-react';
import { apiRequest, clearToken, getSavedUser, getToken, saveUser, setToken } from './api.js';

const initialForm = {
  name: '', email: '', department: 'Design', role: '', phone: '', location: '',
  status: 'Active', joiningDate: new Date().toISOString().slice(0, 10),
};
const departments = ['Design', 'Engineering', 'Marketing', 'People', 'Product', 'Sales', 'Finance', 'Operations'];
const statusOptions = ['Active', 'On leave', 'Inactive'];

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function colorFor(name = '') {
  const colors = ['lavender', 'peach', 'mint', 'blue', 'rose', 'yellow'];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(result.token);
      saveUser(result.user);
      onLogin(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-brand"><span className="brand-mark"><Users size={18} /></span><span>people<span className="brand-dot">.</span></span></div>
      <section className="login-card">
        <div className="login-symbol"><ShieldCheck size={23} /></div>
        <p className="eyebrow">ADMIN WORKSPACE</p>
        <h1>Good to have you<br />back.</h1>
        <p className="login-copy">Sign in to manage your people, all in one place.</p>
        <form onSubmit={submit} className="login-form">
          <label htmlFor="login-email">Work email</label>
          <div className="input-wrap"><Mail size={17} /><input id="login-email" type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <label htmlFor="login-password">Password</label>
          <input className="password-input" id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button login-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ChevronRight size={17} /></button>
        </form>
        <p className="login-note"><ShieldCheck size={14} /> Your workspace is protected with secure sign-in.</p>
      </section>
      <p className="login-footer">A little more human, a little more organized.</p>
    </main>
  );
}

function EmployeeModal({ employee, onClose, onSave, saving }) {
  const [form, setForm] = useState(employee ? {
    name: employee.name,
    email: employee.email,
    department: employee.department,
    role: employee.role,
    phone: employee.phone,
    location: employee.location,
    status: employee.status,
    joiningDate: new Date(employee.joiningDate).toISOString().slice(0, 10),
  } : initialForm);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await onSave({ ...form, joiningDate: new Date(`${form.joiningDate}T12:00:00`).toISOString() });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="employee-modal" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
        <div className="modal-heading">
          <div><p className="eyebrow">{employee ? 'EDIT DETAILS' : 'NEW TEAMMATE'}</p><h2 id="employee-modal-title">{employee ? 'A little update.' : 'Make room for someone great.'}</h2><p>Good people deserve good records. Fill in the details below.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        </div>
        <form className="employee-form" onSubmit={submit}>
          <div className="field-grid">
            <label>Full name<input autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Jamie Chen" minLength="2" maxLength="100" required /></label>
            <label>Work email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="jamie@company.com" maxLength="254" required /></label>
            <label>Job title<input value={form.role} onChange={(event) => update('role', event.target.value)} placeholder="e.g. Product Designer" minLength="2" maxLength="80" required /></label>
            <label>Department<select value={form.department} onChange={(event) => update('department', event.target.value)} required>{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
            <label>Phone number<input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+1 (555) 000-0000" minLength="7" maxLength="25" pattern="[+()0-9.\-\s]+" required /></label>
            <label>Location<input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="e.g. Brooklyn, NY" minLength="2" maxLength="80" required /></label>
            <label>Start date<input type="date" value={form.joiningDate} onChange={(event) => update('joiningDate', event.target.value)} max={new Date().toISOString().slice(0, 10)} required /></label>
            <label>Status<select value={form.status} onChange={(event) => update('status', event.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : employee ? 'Save changes' : 'Add teammate'}<Check size={16} /></button></div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [modalEmployee, setModalEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuId, setMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const perPage = 8;

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setEmployees([]);
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setEmployees(await apiRequest('/employees'));
    } catch (error) {
      if (getToken()) setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      setUser(getSavedUser() || { name: 'Administrator', email: '' });
      loadEmployees();
    } else {
      setLoading(false);
    }
  }, [loadEmployees]);

  useEffect(() => {
    window.addEventListener('people:session-expired', logout);
    return () => window.removeEventListener('people:session-expired', logout);
  }, [logout]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees
      .filter((employee) => department === 'All departments' || employee.department === department)
      .filter((employee) => statusFilter === 'All statuses' || employee.status === statusFilter)
      .filter((employee) => !query || [employee.name, employee.email, employee.role, employee.department].some((value) => value.toLowerCase().includes(query)))
      .sort((a, b) => {
        const left = a[sort.key] || '';
        const right = b[sort.key] || '';
        const comparison = sort.key === 'joiningDate'
          ? new Date(left).getTime() - new Date(right).getTime()
          : String(left).localeCompare(String(right));
        return comparison * (sort.direction === 'asc' ? 1 : -1);
      });
  }, [employees, search, department, statusFilter, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / perPage));
  const visibleEmployees = filteredEmployees.slice((page - 1) * perPage, page * perPage);
  const activeCount = employees.filter((employee) => employee.status === 'Active').length;
  const departmentCount = new Set(employees.map((employee) => employee.department)).size;
  const recentCount = employees.filter((employee) => {
    const joined = new Date(employee.joiningDate);
    const daysAgo = (Date.now() - joined.getTime()) / 86400000;
    return daysAgo >= 0 && daysAgo <= 30;
  }).length;
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function toggleSort(key) {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: 'asc' });
  }

  async function saveEmployee(form) {
    setSaving(true);
    try {
      const isEditing = Boolean(modalEmployee);
      const saved = await apiRequest(isEditing ? `/employees/${modalEmployee._id}` : '/employees', {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(form),
      });
      setEmployees((current) => isEditing
        ? current.map((employee) => employee._id === saved._id ? saved : employee)
        : [saved, ...current]);
      setModalOpen(false);
      setModalEmployee(null);
      setToast({ message: isEditing ? 'Employee details updated.' : 'New teammate added. Welcome aboard!', type: 'success' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Remove ${employee.name} from your team? This cannot be undone.`)) return;
    try {
      await apiRequest(`/employees/${employee._id}`, { method: 'DELETE' });
      setEmployees((current) => current.filter((item) => item._id !== employee._id));
      setMenuId(null);
      setToast({ message: `${employee.name} has been removed.`, type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    }
  }

  function exportEmployees() {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Phone', 'Location', 'Start date', 'Status'];
    const rows = filteredEmployees.map((employee) => [
      employee.name, employee.email, employee.role, employee.department, employee.phone,
      employee.location, formatDate(employee.joiningDate), employee.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'people-employees.csv';
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Your employee list is ready to download.', type: 'success' });
  }

  if (!user) return <Login onLogin={(signedInUser) => { setUser(signedInUser); loadEmployees(); }} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#home" aria-label="People home"><span className="brand-mark"><Users size={18} /></span><span>people<span className="brand-dot">.</span></span></a>
        <div className="workspace-switcher"><span className="workspace-logo">s</span><span><strong>Studio North</strong><small>Workspace</small></span><ChevronDown size={15} /></div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav">
          <a href="#overview"><LayoutDashboard size={17} />Overview</a>
          <a className="selected" href="#team"><Users size={17} />Our people<span className="nav-count">{employees.length}</span></a>
          <a href="#departments"><Building2 size={17} />Departments</a>
          <a href="#time-off"><CalendarDays size={17} />Time off<span className="nav-pip" /></a>
        </nav>
        <p className="nav-label tools-label">YOUR SPACE</p>
        <nav className="main-nav">
          <a href="#settings"><Settings2 size={17} />Settings</a>
          <a href="#help"><CircleHelp size={17} />Help &amp; support</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><div className="note-icon"><Sparkles size={16} /></div><strong>People first, always.</strong><p>A thoughtful team makes everything better.</p><a href="#learn">A note from our team <ChevronRight size={13} /></a></div>
          <button className="profile-card" onClick={logout}><span className="profile-avatar">{initials(user.name || 'Admin')}</span><span className="profile-copy"><strong>{user.name || 'Administrator'}</strong><small>Workspace admin</small></span><LogOut size={16} /></button>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <main className="main-content">
        <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div className="breadcrumb">Workspace <ChevronRight size={14} /> <span>Our people</span></div><div className="topbar-actions"><button className="icon-button help-button" aria-label="Help"><CircleHelp size={18} /></button><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><span className="topbar-divider" /><span className="top-avatar">{initials(user.name || 'Admin')}</span></div></header>
        <div className="page-content">
          <section className="welcome-row"><div><p className="eyebrow">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()} <span className="eyebrow-spark">✳</span></p><h1>Good {timeOfDay}, {user.name?.split(' ')[0] || 'there'}<span className="wave">✳</span></h1><p className="welcome-copy">A good team is a work in progress. Here’s yours.</p></div><div className="welcome-actions"><button className="secondary-button export-button" onClick={exportEmployees}><Download size={16} />Export list</button><button className="primary-button" onClick={() => { setModalEmployee(null); setModalOpen(true); }}><Plus size={17} />Add teammate</button></div></section>
          <section className="stats-grid" aria-label="Team overview">
            <article className="stat-card"><div className="stat-top"><span>Total people</span><span className="stat-icon purple"><Users size={17} /></span></div><div className="stat-number">{employees.length}<span className="stat-unit">people</span></div><div className="stat-foot"><span className="stat-indicator purple-indicator"><ArrowUp size={13} /></span>{recentCount} joined this month</div></article>
            <article className="stat-card"><div className="stat-top"><span>Active members</span><span className="stat-icon green"><Check size={17} /></span></div><div className="stat-number">{activeCount}<span className="stat-unit">people</span></div><div className="stat-foot"><span className="active-dot" />Part of the everyday</div></article>
            <article className="stat-card"><div className="stat-top"><span>Departments</span><span className="stat-icon yellow"><BriefcaseBusiness size={17} /></span></div><div className="stat-number">{departmentCount}<span className="stat-unit">{departmentCount === 1 ? 'team' : 'teams'}</span></div><div className="stat-foot"><span className="mini-pills"><i /><i /><i /></span>Different minds, one team</div></article>
            <article className="stat-card mood-card"><div className="stat-top"><span>Team pulse</span><span className="stat-icon peach"><Sparkles size={17} /></span></div><div className="pulse-line"><span>Looking good</span><span className="pulse-face">☺</span></div><div className="pulse-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="stat-foot">A little sunshine in the forecast</div></article>
          </section>
          <section className="directory-card" id="team">
            <div className="directory-heading"><div><div className="heading-title"><h2>The people behind it all</h2><span className="people-count">{filteredEmployees.length}</span></div><p>Every good thing starts with good people.</p></div><button className="table-filter-button" onClick={exportEmployees}><SlidersHorizontal size={16} /><span>Export</span></button></div>
            <div className="table-toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search people" placeholder="Find someone by name, role or email..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><kbd>⌘ K</kbd></div><div className="filter-group"><label className="select-filter"><Building2 size={15} /><select aria-label="Filter by department" value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }}><option>All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label><label className="select-filter status-filter"><span className="filter-dot" /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option>All statuses</option>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label></div></div>
            <div className="table-wrap"><table><thead><tr><th><button onClick={() => toggleSort('name')}>TEAMMATE{sort.key === 'name' ? sort.direction === 'asc' ? <ArrowDown size={13} /> : <ArrowUp size={13} /> : <ArrowUpDown size={13} />}</button></th><th><button onClick={() => toggleSort('role')}>ROLE &amp; DEPARTMENT{sort.key === 'role' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} />}</button></th><th><button onClick={() => toggleSort('location')}>LOCATION{sort.key === 'location' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} />}</button></th><th><button onClick={() => toggleSort('joiningDate')}>START DATE{sort.key === 'joiningDate' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} />}</button></th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{loading ? <tr><td colSpan="6" className="table-message"><span className="loader" />Gathering the team…</td></tr> : loadError ? <tr><td colSpan="6" className="table-message error-state"><span>{loadError}</span><button className="text-button" onClick={loadEmployees}>Try again</button></td></tr> : visibleEmployees.length ? visibleEmployees.map((employee) => <tr key={employee._id}><td><div className="person-cell"><span className={`person-avatar ${colorFor(employee.name)}`}>{initials(employee.name)}</span><span className="person-details"><strong>{employee.name}</strong><span>{employee.email}</span></span></div></td><td><div className="role-details"><strong>{employee.role}</strong><span>{employee.department}</span></div></td><td><span className="location-cell"><MapPin size={14} />{employee.location}</span></td><td><span className="date-cell">{formatDate(employee.joiningDate)}</span></td><td><span className={`status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}><i />{employee.status}</span></td><td className="actions-cell"><button className="icon-button row-menu-button" onClick={() => setMenuId(menuId === employee._id ? null : employee._id)} aria-label={`Actions for ${employee.name}`}><Ellipsis size={19} /></button>{menuId === employee._id && <div className="row-menu"><button onClick={() => { setModalEmployee(employee); setModalOpen(true); setMenuId(null); }}>Edit details</button><button className="danger-action" onClick={() => deleteEmployee(employee)}>Remove teammate</button></div>}</td></tr>) : <tr><td colSpan="6" className="table-message empty-state"><span className="empty-illustration"><Users size={21} /></span><strong>{employees.length ? 'No people found' : 'Your team’s story starts here.'}</strong><span>{employees.length ? 'Try a different search or filter.' : 'Add your first teammate and make this space yours.'}</span>{!employees.length && <button className="text-button" onClick={() => { setModalEmployee(null); setModalOpen(true); }}><Plus size={15} /> Add your first teammate</button>}</td></tr>}</tbody></table></div>
            <div className="table-footer"><span>Showing <strong>{filteredEmployees.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filteredEmployees.length)}</strong> of <strong>{filteredEmployees.length}</strong> teammates</span><div className="pagination"><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button><span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span><button aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button></div></div>
          </section>
          <footer className="page-footer"><span>Made with care for the people who make it all happen <span className="footer-heart">♥</span></span><span><Clock3 size={13} /> All caught up</span></footer>
        </div>
      </main>
      {modalOpen && <EmployeeModal employee={modalEmployee} onClose={() => { setModalOpen(false); setModalEmployee(null); }} onSave={saveEmployee} saving={saving} />}
      {toast && <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`} role={toast.type === 'error' ? 'alert' : 'status'}><span className="toast-check">{toast.type === 'error' ? <X size={14} /> : <Check size={14} />}</span>{toast.message}<button onClick={() => setToast(null)} aria-label="Dismiss message"><X size={15} /></button></div>}
    </div>
  );
}

export default App;
