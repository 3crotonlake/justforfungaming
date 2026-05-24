/* Just for Fun Gaming — main.js */

const SUPABASE_URL = 'https://ghdnxwhtoweblkzrljpp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TqISQhtWWcIlgyZIj3M-MA_Fv22X3jx';

// Initialize Supabase immediately — not lazily
let _sb = null;
function sb() {
  if (!_sb) {
    if (window.supabase) {
      _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
  return _sb;
}

let _profile = null;

async function getProfile() {
  if (_profile) return _profile;
  try {
    const client = sb();
    if (!client) return null;
    const { data: { session } } = await client.auth.getSession();
    if (!session) return null;
    const { data } = await client.from('members')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();
    _profile = data || null;
    return _profile;
  } catch(e) {
    return null;
  }
}

// ---- NAV ----
// Called on DOMContentLoaded — hides nav-right until session resolves
async function updateNav() {
  const navRight = document.getElementById('nav-right');
  if (!navRight) return;

  // Show placeholder while loading
  navRight.style.opacity = '0';

  const profile = await getProfile();

  if (profile) {
    navRight.innerHTML =
      '<span class="nav-user-name">' + profile.first_name +
      (profile.role === 'admin'
        ? '&nbsp;&nbsp;<a href="admin.html" style="color:var(--gold)">Admin</a>'
        : '&nbsp;&nbsp;<a href="reserve.html" style="color:var(--gold)">Reserve</a>') +
      '&nbsp;&nbsp;<a href="#" id="nav-logout" style="color:var(--cream-dim)">Log Out</a>' +
      '</span>';
    document.getElementById('nav-logout').onclick = async e => {
      e.preventDefault();
      _profile = null;
      await sb().auth.signOut();
      window.location.href = 'index.html';
    };
  } else {
    navRight.innerHTML =
      '<span class="nav-phone">203-970-4873</span>' +
      '<a href="login.html" class="btn-nav">Log In</a>' +
      '&nbsp;&nbsp;<a href="login.html" onclick="sessionStorage.setItem(\'tab\',\'signup\')" style="font-family:\'Barlow Condensed\',sans-serif;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--cream-dim)">Join Free</a>';
  }

  navRight.style.opacity = '1';
  navRight.style.transition = 'opacity 0.3s';
}

// ---- NAV ACTIVE STATE ----
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();

// ---- MOBILE HAMBURGER ----
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
  });
}

// ---- SIGN UP ----
async function signUp({ firstName, lastName, email, password, mobile, games, newsletter }) {
  const { data: authData, error: authError } = await sb().auth.signUp({
    email, password,
    options: { data: { first_name: firstName, last_name: lastName } }
  });
  if (authError) throw authError;
  const { error: profileError } = await sb().from('members').insert({
    auth_id: authData.user.id,
    first_name: firstName, last_name: lastName,
    email, mobile: mobile || null,
    games: games || [], newsletter, role: 'member'
  });
  if (profileError) throw profileError;
  return authData.user;
}

// ---- LOG IN ----
async function logIn({ email, password }) {
  const { data, error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// ---- FLASH ----
function showFlash(msg, type = 'success') {
  let el = document.getElementById('flash');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash';
    el.style.cssText = 'position:fixed;top:72px;left:50%;transform:translateX(-50%);padding:0.75rem 1.75rem;z-index:9999;font-family:"Barlow Condensed",sans-serif;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;border:1px solid;transition:opacity 0.4s;white-space:nowrap;border-radius:2px;';
    document.body.appendChild(el);
  }
  el.style.background = type === 'success' ? '#1a2f1a' : '#2f1a1a';
  el.style.color = type === 'success' ? '#7DD47D' : '#E87070';
  el.style.borderColor = type === 'success' ? 'rgba(92,184,92,0.3)' : 'rgba(139,32,32,0.4)';
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3500);
}

// ---- TABLE DATA ----
const MockData = {
  tables: [
    { id: 1, icon: '⚔️', name: 'Table 1 — Standard Mat',  desc: 'Seats 2–4 · Good for 40K, BattleTech, card games', capacity: 4 },
    { id: 2, icon: '🗺️', name: 'Table 2 — Large Hex Mat', desc: 'Seats 2–6 · Great for large battles & campaigns',   capacity: 6 },
    { id: 3, icon: '🏰', name: 'Table 3 — Terrain Board', desc: 'Seats 2–4 · 3D terrain, rotating scenarios',        capacity: 4 },
    { id: 4, icon: '🎲', name: 'Table 4 — RPG Corner',    desc: 'Seats up to 8 · Ideal for D&D/Pathfinder',          capacity: 8 },
    { id: 5, icon: '🃏', name: 'Table 5 — Card Table',    desc: 'Seats 2–4 · Perfect for Magic, Pokémon, Lorcana',   capacity: 4 },
  ]
};

// ---- RESERVATIONS ----
async function getUserReservations(memberId) {
  const { data } = await sb().from('reservations')
    .select('*').eq('member_id', memberId).eq('status', 'confirmed')
    .gte('date', todayStr()).order('date', { ascending: true });
  return data || [];
}

async function addReservation(res) {
  const { data, error } = await sb().from('reservations').insert(res).select().single();
  if (error) throw error;
  return data;
}

async function cancelReservation(id) {
  const { error } = await sb().from('reservations').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

// ---- ADMIN ----
async function getAllMembers() {
  const { data } = await sb().from('members').select('*').order('created_at', { ascending: false });
  return data || [];
}

async function getAllReservations() {
  const { data } = await sb().from('reservations')
    .select('*').eq('status', 'confirmed')
    .gte('date', todayStr()).order('date', { ascending: true });
  return data || [];
}

async function updateMemberRole(memberId, role) {
  const { error } = await sb().from('members').update({ role }).eq('id', memberId);
  if (error) throw error;
}

async function deleteMember(memberId) {
  const { error } = await sb().from('members').delete().eq('id', memberId);
  if (error) throw error;
}

// ---- HELPERS ----
function gameBadge(game) {
  const map = {
    'Warhammer 40,000': 'gb-40k', '40K': 'gb-40k',
    'D&D / Pathfinder': 'gb-dnd', 'D&D': 'gb-dnd', 'Pathfinder': 'gb-path',
    'BattleTech': 'gb-btch',
    'Pokémon': 'gb-card', 'Magic: The Gathering': 'gb-card', 'Lorcana': 'gb-card',
    'Board Game': 'gb-board',
  };
  return '<span class="gb ' + (map[game] || 'gb-board') + '">' + game + '</span>';
}

function formatShort(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  initHamburger();
});
