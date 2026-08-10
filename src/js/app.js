import '../css/styles.css';
import { getSession, onAuthStateChange } from './services/auth.js';
import { getMyProfile } from './modules/dashboard.js';

const app = document.getElementById('app');
const toast = document.getElementById('toast');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function boot() {
  const { data } = await getSession();

  if (data.session) {
    const profile = await getMyProfile();
    renderApp(data.session.user, profile.data);
  } else {
    renderLanding();
  }
}

function renderLanding() {
  app.innerHTML = `
    <main style="max-width:900px;margin:80px auto;padding:24px;text-align:center">
      <h1>AutoSubs</h1>
      <p>Premium YouTube Creator Platform</p>
      <p style="color:#94a3b8">
        Struktur frontend sudah siap. Modul Supabase sudah dipisahkan agar
        Auth, Topup, Bot, Spin, Promosi, dan Admin dapat dikembangkan tanpa
        membuat satu file JavaScript terlalu besar.
      </p>
    </main>
  `;
}

function renderApp(user, profile) {
  app.innerHTML = `
    <main style="max-width:900px;margin:40px auto;padding:24px">
      <h1>AutoSubs Pro</h1>
      <p>Login: ${user.email}</p>
      <p>Role: ${profile?.role ?? 'user'}</p>
      <p>Token: ${profile?.tokens ?? 0}</p>
      <p>Saldo: Rp ${Number(profile?.saldo ?? 0).toLocaleString('id-ID')}</p>
    </main>
  `;
}

onAuthStateChange((_event, session) => {
  if (session) boot();
  else renderLanding();
});

boot().catch(err => {
  console.error(err);
  showToast('Gagal memuat AutoSubs. Periksa konfigurasi Supabase.');
});
