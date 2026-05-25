/* Just for Fun Gaming — main.js */

const SUPABASE_URL = 'https://ghdnxwhtoweblkzrljpp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZG54d2h0b3dlYmxrenJsanBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjMzMjEsImV4cCI6MjA5NTEzOTMyMX0.WPiQgbmKe5JWD3m_hGoP7YeAeFiUtTksVJWEVakc_2g';

let _sb = null;

async function getSb() {
  if (_sb) return _sb;
  for (let i = 0; i < 50; i++) {
    if (window.supabase) {
      _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          storage: window.localStorage,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
      // Wait for session to be restored from localStorage
      await new Promise(r => setTimeout(r, 200));
      return _sb;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return null;
}

let _profile = null;

async function getProfile() {
  if (_profile) return _profile;
  
  // Check localStorage first (fastest, survives page navigation)
  const cached = localStorage.getItem('jffg_profile');
  if (cached) {
    try {
      _profile = JSON.parse(cached);
      return _profile;
    } catch(e) {}
  }

  // Fall back to Supabase session
  try {
    const client = await getSb();
    if (!client) return null;
    const { data: { session } } = await client.auth.getSession();
    if (!session) return null;
    const { data } = await client.from('members')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();
    _profile = data || null;
    if (_profile) localStorage.setItem('jffg_profile', JSON.stringify(_profile));
    return _profile;
  } catch(e) { return null; }
}

async function updateNav() {
  try {
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;
    navRight.innerHTML = '<span class="nav-phone">203-970-4873</span><a href="login.html" class="btn-nav">Log In</a>&nbsp;&nbsp;<a href="login.html" style="font-family:\'Barlow Condensed\',sans-serif;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--cream-dim);text-decoration:none;">Join Free</a>';
    const profile = await getProfile();
    if (!profile) return;
    navRight.innerHTML =
      '<span class="nav-user-name" style="font-family:\'Barlow Condensed\',sans-serif;letter-spacing:0.1em;">' +
      '<span style="color:var(--gold)">' + profile.first_name.toUpperCase() + '</span>' +
      (profile.role === 'admin' ? '&nbsp;&nbsp;<a href="admin.html" style="color:var(--cream-dim);text-decoration:none;font-size:0.75rem;">ADMIN</a>' : '&nbsp;&nbsp;<a href="reserve.html" style="color:var(--cream-dim);text-decoration:none;font-size:0.75rem;">RESERVE</a>') +
      '&nbsp;&nbsp;<a href="#" id="nav-logout" style="color:var(--red-bright);text-decoration:none;font-size:0.75rem;">LOG OUT</a></span>';
    const btn = document.getElementById('nav-logout');
    if (btn) btn.onclick = async e => {
      e.preventDefault();
      _profile = null;
      localStorage.removeItem('jffg_profile');
      const client = await getSb();
      await client.auth.signOut();
      window.location.href = 'index.html';
    };
  } catch(e) { console.log('nav error:', e.message); }
}

(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
  });
}

async function signUp({ firstName, lastName, email, password, mobile, games, newsletter }) {
  const client = await getSb();
  const { data: authData, error: authError } = await client.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName } } });
  if (authError) throw authError;
  const { error: profileError } = await client.from('members').insert({ auth_id: authData.user.id, first_name: firstName, last_name: lastName, email, mobile: mobile || null, games: games || [], newsletter, role: 'member' });
  if (profileError) throw profileError;
  return authData.user;
}

async function logIn({ email, password }) {
  const client = await getSb();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

function showFlash(msg, type = 'success') {
  let el = document.getElementById('flash');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash';
    el.style.cssText = 'position:fixed;top:72px;left:50%;transform:translateX(-50%);padding:0.75rem 1.75rem;z-index:9999;font-family:"Barlow Condensed",sans-serif;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;border:1px solid;transition:opacity 0.4s;white-space:nowrap;';
    document.body.appendChild(el);
  }
  el.style.background = type === 'success' ? '#1a2f1a' : '#2f1a1a';
  el.style.color = type === 'success' ? '#7DD47D' : '#E87070';
  el.style.borderColor = type === 'success' ? 'rgba(92,184,92,0.3)' : 'rgba(139,32,32,0.4)';
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3500);
}

const MockData = {
  tables: [
    { id: 1, icon: '⚔️', name: 'Table 1 — Standard Mat', desc: 'Seats 2–4 · Good for 40K, BattleTech, card games', capacity: 4 },
    { id: 2, icon: '🗺️', name: 'Table 2 — Large Hex Mat', desc: 'Seats 2–6 · Great for large battles & campaigns', capacity: 6 },
    { id: 3, icon: '🏰', name: 'Table 3 — Terrain Board', desc: 'Seats 2–4 · 3D terrain, rotating scenarios', capacity: 4 },
    { id: 4, icon: '🎲', name: 'Table 4 — RPG Corner', desc: 'Seats up to 8 · Ideal for D&D/Pathfinder', capacity: 8 },
    { id: 5, icon: '🃏', name: 'Table 5 — Card Table', desc: 'Seats 2–4 · Perfect for Magic, Pokémon, Lorcana', capacity: 4 },
  ]
};

async function getUserReservations(memberId) {
  const client = await getSb();
  const { data: d1 } = await client.from('reservations').select('*').eq('member_id', memberId).eq('status', 'confirmed').gte('date', todayStr()).order('date', { ascending: true });
  if (d1 && d1.length > 0) return d1;
  const profile = await getProfile();
  if (profile) {
    const name = profile.first_name + ' ' + profile.last_name;
    const { data: d2 } = await client.from('reservations').select('*').eq('status', 'confirmed').eq('member_name', name).gte('date', todayStr()).order('date', { ascending: true });
    return d2 || [];
  }
  return [];
}

async function addReservation(res) {
  const client = await getSb();
  const { data, error } = await client.from('reservations').insert(res).select().single();
  if (error) throw error;
  return data;
}

async function cancelReservation(id) {
  const client = await getSb();
  const { error } = await client.from('reservations').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

async function getAllMembers() {
  const client = await getSb();
  const { data } = await client.from('members').select('*').order('created_at', { ascending: false });
  return data || [];
}

async function getAllReservations() {
  const client = await getSb();
  const { data } = await client.from('reservations').select('*').eq('status', 'confirmed').gte('date', todayStr()).order('date', { ascending: true });
  return data || [];
}

async function updateMemberRole(memberId, role) {
  const client = await getSb();
  const { error } = await client.from('members').update({ role }).eq('id', memberId);
  if (error) throw error;
}

async function deleteMember(memberId) {
  const client = await getSb();
  const { error } = await client.from('members').delete().eq('id', memberId);
  if (error) throw error;
}

function gameBadge(game) {
  const map = { 'Warhammer 40,000': 'gb-40k', '40K': 'gb-40k', 'D&D / Pathfinder': 'gb-dnd', 'D&D': 'gb-dnd', 'Pathfinder': 'gb-path', 'BattleTech': 'gb-btch', 'Pokémon': 'gb-card', 'Magic: The Gathering': 'gb-card', 'Lorcana': 'gb-card', 'Board Game': 'gb-board' };
  return '<span class="gb ' + (map[game] || 'gb-board') + '">' + game + '</span>';
}

function formatShort(dateStr) { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function todayStr() { return new Date().toISOString().split('T')[0]; }

document.addEventListener('DOMContentLoaded', () => { updateNav(); initHamburger(); });
