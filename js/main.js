/* ============================================
   Just for Fun Gaming — Shared JavaScript
   Supabase-connected version
   ============================================ */

// ---- SUPABASE CONFIG ----
const SUPABASE_URL = 'https://ghdnxwhtoweblkzrljpp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TqISQhtWWcIlgyZIj3M-MA_Fv22X3jx';

// Load Supabase client from CDN (loaded in each page's <head>)
let _supabase = null;
function getSupabase() {
  if (!_supabase && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// ---- NAV ACTIVE STATE ----
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ---- MOBILE HAMBURGER ----
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

// ---- AUTH STATE ----
// We keep a local cache of the current user profile
let _currentUser = null;

async function getCurrentUser() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  // Fetch their member profile
  const { data: profile } = await sb.from('members')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  _currentUser = profile || null;
  return _currentUser;
}

async function updateNav() {
  const user = await getCurrentUser();
  const navRight = document.getElementById('nav-right');
  if (!navRight) return;

  if (user) {
    navRight.innerHTML = `
      <span class="nav-user-name">
        ${user.first_name}
        <a href="reserve.html">Reserve a Table</a>
        ${user.role === 'admin' ? '<a href="admin.html">Admin</a>' : ''}
        <a href="#" id="logout-link">Log Out</a>
      </span>`;
    document.getElementById('logout-link')?.addEventListener('click', async e => {
      e.preventDefault();
      await getSupabase().auth.signOut();
      window.location.href = 'index.html';
    });
  } else {
    navRight.innerHTML = `
      <span class="nav-phone">203-970-4873</span>
      <a href="login.html" class="btn-nav">Join / Log In</a>`;
  }
}

// ---- SIGN UP ----
async function signUp({ firstName, lastName, email, password, mobile, games, newsletter }) {
  const sb = getSupabase();

  // 1. Create auth user
  const { data: authData, error: authError } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName }
    }
  });

  if (authError) throw authError;

  // 2. Insert member profile
  const { error: profileError } = await sb.from('members').insert({
    auth_id: authData.user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    mobile: mobile || null,
    games: games || [],
    newsletter,
    role: 'member'
  });

  if (profileError) throw profileError;

  return authData.user;
}

// ---- LOG IN ----
async function logIn({ email, password }) {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// ---- LOG OUT ----
async function logOut() {
  await getSupabase().auth.signOut();
  window.location.href = 'index.html';
}

// ---- FLASH MESSAGE ----
function showFlash(msg, type = 'success') {
  let el = document.getElementById('flash');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash';
    el.style.cssText = `
      position: fixed; top: 72px; left: 50%; transform: translateX(-50%);
      padding: 0.75rem 1.75rem; z-index: 9999;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase;
      border: 1px solid; transition: opacity 0.4s; white-space: nowrap;`;
    document.body.appendChild(el);
  }
  if (type === 'success') {
    el.style.background = '#1a2f1a';
    el.style.color = '#7DD47D';
    el.style.borderColor = 'rgba(92,184,92,0.3)';
  } else {
    el.style.background = '#2f1a1a';
    el.style.color = '#E87070';
    el.style.borderColor = 'rgba(139,32,32,0.4)';
  }
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3500);
}

// ---- MOCK DATA (fallback for demo / admin display) ----
const MockData = {
  tables: [
    { id: 1, icon: '⚔️', name: 'Table 1 — Standard Mat',   desc: 'Seats 2–4 · Good for 40K, BattleTech, card games',    capacity: 4 },
    { id: 2, icon: '🗺️', name: 'Table 2 — Large Hex Mat',  desc: 'Seats 2–6 · Great for large battles & campaigns',      capacity: 6 },
    { id: 3, icon: '🏰', name: 'Table 3 — Terrain Board',  desc: 'Seats 2–4 · 3D terrain pre-set, rotating scenarios',   capacity: 4 },
    { id: 4, icon: '🎲', name: 'Table 4 — RPG Corner',     desc: 'Seats up to 8 · Round table, ideal for D&D/Pathfinder', capacity: 8 },
    { id: 5, icon: '🃏', name: 'Table 5 — Card Table',     desc: 'Seats 2–4 · Perfect for Magic, Pokémon, Lorcana',      capacity: 4 },
  ]
};

// ---- RESERVATIONS ----
async function getReservationsForDate(dateStr) {
  const sb = getSupabase();
  const { data } = await sb.from('reservations')
    .select('*')
    .eq('date', dateStr)
    .eq('status', 'confirmed');
  return data || [];
}

async function getUserReservations(memberId) {
  const sb = getSupabase();
  const { data } = await sb.from('reservations')
    .select('*')
    .eq('member_id', memberId)
    .eq('status', 'confirmed')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });
  return data || [];
}

async function addReservation(res) {
  const sb = getSupabase();
  const { data, error } = await sb.from('reservations').insert(res).select().single();
  if (error) throw error;
  return data;
}

async function cancelReservation(id) {
  const sb = getSupabase();
  const { error } = await sb.from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}

// ---- ADMIN: get all members ----
async function getAllMembers() {
  const sb = getSupabase();
  const { data } = await sb.from('members').select('*').order('created_at', { ascending: false });
  return data || [];
}

// ---- ADMIN: get all reservations ----
async function getAllReservations() {
  const sb = getSupabase();
  const { data } = await sb.from('reservations')
    .select('*')
    .eq('status', 'confirmed')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });
  return data || [];
}

// ---- GAME BADGE HELPER ----
function gameBadge(game) {
  const map = {
    'Warhammer 40,000': 'gb-40k', '40K': 'gb-40k',
    'D&D / Pathfinder': 'gb-dnd', 'D&D': 'gb-dnd', 'Pathfinder': 'gb-path',
    'BattleTech': 'gb-btch',
    'Pokémon': 'gb-card', 'Magic: The Gathering': 'gb-card', 'Lorcana': 'gb-card',
    'Board Game': 'gb-board',
  };
  const cls = map[game] || 'gb-board';
  return `<span class="gb ${cls}">${game}</span>`;
}

// ---- DATE HELPERS ----
function formatShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  initHamburger();
});
