import '../css/styles.css';
import { getSession, onAuthStateChange } from './services/auth.js';
import { handleLogin, handleRegister, handleLogout } from './modules/auth.js';
import { getMyProfile } from './modules/dashboard.js';
import { getTopupHistory } from './modules/topup.js';
import { createBotOrder } from './modules/bot.js';
import { getAdminTopups } from './modules/admin.js';

const root = document.getElementById('app');
let authMode = 'login';
let currentUser = null;
let currentProfile = null;
let toastTimer = null;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function toast(message, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = message;
  el.className = `toast show ${type}`;
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function showAuth(mode = 'login') {
  authMode = mode;
  renderAuth();
}

function renderLanding() {
  root.innerHTML = `
    <div class="shell landing-shell">
      <header class="topbar">
        <div class="brand"><span class="brand-mark">▶</span><span>AutoSubs</span><small>PRO</small></div>
        <button class="btn btn-secondary" data-action="auth-login">Masuk</button>
      </header>
      <main class="hero">
        <div class="hero-badge">AI CREATOR PLATFORM</div>
        <h1>Ubah video panjang menjadi konten yang siap diposting.</h1>
        <p>Kelola akun, token, layanan kreator, proyek, dan tools YouTube dari satu dashboard.</p>
        <div class="hero-actions">
          <button class="btn" data-action="auth-signup">Mulai Gratis</button>
          <button class="btn btn-secondary" data-action="auth-login">Login</button>
        </div>
        <div class="feature-grid">
          ${['AI Clip Ideas','Auto Captions','Hook & Title Generator','Token System'].map((x,i)=>`<div class="feature-card"><span>${i+1}</span><strong>${x}</strong><small>Siap diintegrasikan ke backend.</small></div>`).join('')}
        </div>
      </main>
    </div>`;
}

function renderAuth() {
  root.innerHTML = `
    <div class="shell center-shell">
      <div class="auth-card">
        <button class="text-button back" data-action="landing">← Kembali</button>
        <div class="brand auth-brand"><span class="brand-mark">▶</span><span>AutoSubs</span></div>
        <h2>${authMode === 'login' ? 'Selamat datang kembali' : 'Buat akun AutoSubs'}</h2>
        <p>${authMode === 'login' ? 'Masuk untuk membuka dashboard.' : 'Daftar untuk mendapatkan akses ke platform.'}</p>
        <form id="auth-form" class="stack-form">
          <label>Email<input id="auth-email" type="email" required placeholder="nama@email.com" autocomplete="email"></label>
          <label>Password<input id="auth-password" type="password" required minlength="6" placeholder="Minimal 6 karakter" autocomplete="current-password"></label>
          <button class="btn" type="submit">${authMode === 'login' ? 'Masuk' : 'Daftar'}</button>
        </form>
        <button class="text-button switch-auth" data-action="auth-switch">${authMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}</button>
        <small class="hint">Autentikasi menggunakan Supabase Auth.</small>
      </div>
    </div>`;
}

function navButton(id, label, icon='•') {
  return `<button class="nav-item" data-nav="${id}"><span>${icon}</span>${label}</button>`;
}

function renderApp(view='dashboard') {
  const p = currentProfile || {};
  const isAdmin = p.role === 'admin';
  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand sidebar-brand"><span class="brand-mark">▶</span><span>AutoSubs</span></div>
        <nav class="nav">
          ${navButton('dashboard','Dashboard','⌂')}
          ${navButton('clips','Create Clips','✦')}
          ${navButton('projects','Projects','▣')}
          ${navButton('history','History','◷')}
          ${navButton('tools','Free Tools','⚙')}
          ${navButton('topup','Top-up Tokens','◆')}
          ${navButton('settings','Settings','◌')}
          ${isAdmin ? navButton('admin','Admin','🛡') : ''}
        </nav>
        <button class="nav-item logout" data-action="logout"><span>↪</span>Logout</button>
      </aside>
      <main class="main-area">
        <header class="appbar">
          <div><strong>AutoSubs Pro</strong><small>${escapeHtml(p.email || currentUser?.email || '')}</small></div>
          <div class="metrics"><span>⚡ ${isAdmin ? '∞' : Number(p.tokens || 0).toLocaleString('id-ID')} Tokens</span><span>Role: ${escapeHtml(p.role || 'user')}</span></div>
        </header>
        <section class="content" id="content"></section>
      </main>
    </div>`;
  openView(view);
}

function metric(label, value) {
  return `<div class="metric-card"><small>${label}</small><strong>${value}</strong></div>`;
}

function openView(view) {
  const content = document.getElementById('content');
  if (!content) return;
  document.querySelectorAll('.nav-item[data-nav]').forEach(x => x.classList.toggle('active', x.dataset.nav === view));
  const p = currentProfile || {};
  if (view === 'dashboard') {
    content.innerHTML = `<div class="page-head"><div><small>DASHBOARD</small><h1>Halo, ${escapeHtml((p.email || '').split('@')[0] || 'Creator')} 👋</h1><p>Pusat kontrol AutoSubs kamu.</p></div></div>
      <div class="metric-grid">${metric('Available Tokens', p.role === 'admin' ? '∞' : Number(p.tokens || 0).toLocaleString('id-ID'))}${metric('Saldo', `Rp ${Number(p.saldo || 0).toLocaleString('id-ID')}`)}${metric('Trial', p.role === 'admin' ? 'Unlimited' : Number(p.trial || 0))}${metric('Plan', p.plan || 'Free')}</div>
      <div class="card-grid"><div class="panel"><h3>Create Viral Clips</h3><p>Analisis video dan temukan momen potensial.</p><button class="btn" data-nav-jump="clips">Mulai Analisis</button></div><div class="panel"><h3>Token Center</h3><p>Lihat saldo dan riwayat top-up.</p><button class="btn btn-secondary" data-nav-jump="topup">Kelola Token</button></div><div class="panel"><h3>Tools</h3><p>Gunakan tools gratis untuk channel.</p><button class="btn btn-secondary" data-nav-jump="tools">Buka Tools</button></div></div>`;
  } else if (view === 'clips') {
    content.innerHTML = `<div class="page-head"><div><small>CREATE</small><h1>Create Viral Clips</h1><p>Masukkan URL video untuk simulasi analisis yang stabil.</p></div></div>
      <div class="panel"><label>Video URL<input id="video-url" class="input" placeholder="https://youtube.com/..." type="url"></label><div id="analysis-status" class="status-box">Siap menganalisis.</div><button class="btn" id="analyze-btn">Analyze Video</button></div>
      <div id="analysis-result"></div>`;
  } else if (view === 'projects') {
    const projects = JSON.parse(localStorage.getItem('autosubs_projects') || '[]');
    content.innerHTML = `<div class="page-head"><div><small>WORKSPACE</small><h1>Projects</h1><p>Project tersimpan lokal sampai backend storage diaktifkan.</p></div></div><div class="panel">${projects.length ? projects.map((x,i)=>`<div class="list-row"><div><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.url)}</small></div><span>${new Date(x.createdAt).toLocaleDateString('id-ID')}</span></div>`).join('') : '<div class="empty">Belum ada project.</div>'}</div>`;
  } else if (view === 'history') {
    const history = JSON.parse(localStorage.getItem('autosubs_history') || '[]');
    content.innerHTML = `<div class="page-head"><div><small>ACTIVITY</small><h1>Generation History</h1><p>Riwayat analisis dari browser ini.</p></div></div><div class="panel">${history.length ? history.map(x=>`<div class="list-row"><div><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.url)}</small></div><span>${escapeHtml(x.status)}</span></div>`).join('') : '<div class="empty">Belum ada riwayat.</div>'}</div>`;
  } else if (view === 'tools') {
    content.innerHTML = `<div class="page-head"><div><small>FREE TOOLS</small><h1>Free YouTube Tools</h1><p>Tools ringan yang bisa langsung dipakai.</p></div></div><div class="panel"><h3>Subscribe Link Generator</h3><input id="channel-url" class="input" placeholder="https://youtube.com/@channel"><button class="btn" id="generate-link">Generate</button><div id="generated-link" class="result-box hidden"></div></div>`;
  } else if (view === 'topup') {
    content.innerHTML = `<div class="page-head"><div><small>TOKEN CENTER</small><h1>Top-up Tokens</h1><p>Paket hanya mencatat order sampai payment gateway terverifikasi.</p></div></div><div class="card-grid">${[['Starter',100,10000],['Creator',500,45000],['Pro',1500,120000],['Business',5000,350000]].map(([n,t,price])=>`<div class="panel package"><small>${n}</small><strong>${t.toLocaleString('id-ID')}</strong><span>Token</span><b>Rp ${price.toLocaleString('id-ID')}</b><button class="btn" data-topup="${t}" data-amount="${price}">Buat Order</button></div>`).join('')}</div><div class="panel"><h3>Riwayat Order</h3><div id="topup-history"><div class="empty">Memuat...</div></div></div>`;
    loadTopups();
  } else if (view === 'settings') {
    content.innerHTML = `<div class="page-head"><div><small>ACCOUNT</small><h1>Settings</h1><p>Pengaturan profil dasar.</p></div></div><div class="panel"><div class="list-row"><div><strong>Email</strong><small>${escapeHtml(p.email || currentUser?.email || '-')}</small></div></div><div class="list-row"><div><strong>Role</strong><small>${escapeHtml(p.role || 'user')}</small></div></div><div class="list-row"><div><strong>Plan</strong><small>${escapeHtml(p.plan || 'Free')}</small></div></div></div>`;
  } else if (view === 'admin') {
    if (p.role !== 'admin') return openView('dashboard');
    content.innerHTML = `<div class="page-head"><div><small>SECURE AREA</small><h1>Admin Panel</h1><p>Data order yang dapat dibaca melalui Supabase.</p></div></div><div class="panel"><div id="admin-data">Memuat...</div></div>`;
    loadAdmin();
  }
}

async function loadTopups() {
  const el = document.getElementById('topup-history');
  if (!el) return;
  const { data, error } = await getTopupHistory();
  if (error) return void (el.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`);
  el.innerHTML = data?.length ? data.map(x=>`<div class="list-row"><div><strong>${escapeHtml(x.package_name || 'Token Order')}</strong><small>${escapeHtml(x.status || 'pending')}</small></div><span>${Number(x.tokens || 0).toLocaleString('id-ID')} token</span></div>`).join('') : '<div class="empty">Belum ada order.</div>';
}

async function loadAdmin() {
  const el = document.getElementById('admin-data');
  if (!el) return;
  const { data, error } = await getAdminTopups();
  if (error) return void (el.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`);
  el.innerHTML = `<div class="list-table"><div class="table-head"><span>Order</span><span>Status</span><span>Token</span></div>${(data || []).map(x=>`<div class="table-row"><span>${escapeHtml(x.package_name || x.id || 'Order')}</span><span>${escapeHtml(x.status || 'pending')}</span><span>${Number(x.tokens || 0).toLocaleString('id-ID')}</span></div>`).join('') || '<div class="empty">Belum ada data.</div>'}</div>`;
}

async function loadSession(session) {
  currentUser = session?.user || null;
  if (!currentUser) return renderLanding();
  const profileResult = await getMyProfile();
  if (profileResult.error) {
    toast(`Login berhasil, tetapi profile belum tersedia: ${profileResult.error.message}`, 'error');
    renderApp('dashboard');
    return;
  }
  currentProfile = profileResult.data || {};
  renderApp('dashboard');
}

async function onAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value;
  const button = e.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = authMode === 'login' ? await handleLogin(email, password) : await handleRegister(email, password);
    if (result.error) throw result.error;
    if (result.data?.session) {
      await loadSession(result.data.session);
      toast('Berhasil masuk.');
    } else {
      toast('Akun dibuat. Cek email untuk konfirmasi.');
      showAuth('login');
    }
  } catch (err) {
    toast(err.message || 'Autentikasi gagal.', 'error');
  } finally {
    button.disabled = false;
  }
}

async function analyze() {
  const input = document.getElementById('video-url');
  const status = document.getElementById('analysis-status');
  const result = document.getElementById('analysis-result');
  const url = input?.value.trim();
  if (!url) return toast('Masukkan URL video.', 'error');
  try { new URL(url); } catch { return toast('URL tidak valid.', 'error'); }
  status.textContent = 'AI sedang menganalisis video...';
  result.innerHTML = '';
  await new Promise(r => setTimeout(r, 900));
  const score = 82 + Math.floor(Math.random() * 15);
  const title = 'Project ' + new Date().toLocaleTimeString('id-ID');
  const project = { title, url, score, createdAt: Date.now() };
  const projects = JSON.parse(localStorage.getItem('autosubs_projects') || '[]');
  projects.unshift(project); localStorage.setItem('autosubs_projects', JSON.stringify(projects.slice(0,30)));
  const history = JSON.parse(localStorage.getItem('autosubs_history') || '[]');
  history.unshift({ title, url, status:'completed', createdAt:Date.now() }); localStorage.setItem('autosubs_history', JSON.stringify(history.slice(0,50)));
  status.textContent = 'Analisis selesai.';
  result.innerHTML = `<div class="analysis-grid"><div class="panel"><small>VIRAL POTENTIAL</small><strong class="score">${score}/100</strong><p>Hook ${score+4} · Curiosity ${score+2} · Shareability ${score-1}</p></div>${[94,91,88].map((s,i)=>`<div class="panel"><small>CLIP #${i+1}</small><strong>${s}/100</strong><p>${['Strong opening statement','Surprising statement','Educational takeaway'][i]}.</p><button class="btn btn-secondary" data-action="demo">Generate Clip</button></div>`).join('')}</div><div class="panel"><h3>Suggested Titles</h3><div class="chips"><span>The Truth Nobody Talks About</span><span>3 Things You Need To Know</span><span>Wait Until You Hear This</span></div></div>`;
  toast('Analisis selesai dan project disimpan.');
}

async function handleTopup(button) {
  if (!currentUser) return;
  const tokens = Number(button.dataset.topup);
  const amount = Number(button.dataset.amount);
  try {
    const result = await supabaseInsertTopup({ tokens, amount, package_name: `${tokens} Token` });
    if (result.error) throw result.error;
    toast('Order top-up berhasil dibuat dengan status pending.');
    await loadTopups();
  } catch (err) {
    toast(err.message || 'Gagal membuat order.', 'error');
  }
}

async function supabaseInsertTopup({tokens, amount, package_name}) {
  const { supabase } = await import('./services/supabase.js');
  return supabase.from('topup_orders').insert({ user_id: currentUser.id, tokens, amount, package_name, status: 'pending' }).select().single();
}

async function boot() {
  try {
    const { data } = await getSession();
    if (data.session) await loadSession(data.session); else renderLanding();
  } catch (err) {
    console.error(err);
    renderLanding();
    toast('AutoSubs berjalan, tetapi Supabase belum terhubung.', 'error');
  }
}

document.addEventListener('click', async (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  const nav = e.target.closest('[data-nav]')?.dataset.nav;
  const jump = e.target.closest('[data-nav-jump]')?.dataset.navJump;
  if (action === 'landing') renderLanding();
  if (action === 'auth-login') showAuth('login');
  if (action === 'auth-signup') showAuth('signup');
  if (action === 'auth-switch') showAuth(authMode === 'login' ? 'signup' : 'login');
  if (action === 'logout') { await handleLogout(); currentUser = null; currentProfile = null; renderLanding(); toast('Logout berhasil.'); }
  if (action === 'demo') toast('Editor video backend akan dihubungkan pada tahap berikutnya.');
  if (nav) openView(nav);
  if (jump) openView(jump);
  if (e.target.closest('#analyze-btn')) analyze();
  if (e.target.closest('#generate-link')) {
    const value = document.getElementById('channel-url')?.value.trim();
    if (!value) return toast('Masukkan URL channel.', 'error');
    try { const u = new URL(value); u.searchParams.set('sub_confirmation','1'); const box=document.getElementById('generated-link'); box.textContent=u.toString(); box.classList.remove('hidden'); } catch { toast('URL tidak valid.','error'); }
  }
  const topup = e.target.closest('[data-topup]');
  if (topup) handleTopup(topup);
});

document.addEventListener('submit', e => { if (e.target.id === 'auth-form') onAuthSubmit(e); });

onAuthStateChange(async (_event, session) => {
  if (session && !currentUser) await loadSession(session);
  if (!session) { currentUser = null; currentProfile = null; renderLanding(); }
});

boot();
