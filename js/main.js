/* ============================================
   Just for Fun Gaming — Shared JavaScript
   ============================================ */

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
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

// ---- SIMPLE AUTH STATE (localStorage mock) ----
// In production this would be Supabase auth.
// For the demo we simulate login/logout.

const Auth = {
  key: 'jffg_user',

  get() {
    try { return JSON.parse(localStorage.getItem(this.key)); } catch { return null; }
  },

  set(user) {
    localStorage.setItem(this.key, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(this.key);
  },

  isLoggedIn() {
    return !!this.get();
  },

  isAdmin() {
    const u = this.get();
    return u && u.role === 'admin';
  }
};

// Update nav based on auth state
function updateNav() {
  const user = Auth.get();
  const navRight = document.getElementById('nav-right');
  if (!navRight) return;

  if (user) {
    navRight.innerHTML = `
      <span class="nav-user-name">
        ${user.firstName}
        <a href="reserve.html">Reserve a Table</a>
        ${user.role === 'admin' ? '<a href="admin.html">Admin</a>' : ''}
        <a href="#" id="logout-link">Log Out</a>
      </span>`;
    document.getElementById('logout-link')?.addEventListener('click', e => {
      e.preventDefault();
      Auth.clear();
      window.location.href = 'index.html';
    });
  } else {
    navRight.innerHTML = `
      <span class="nav-phone">203-970-4873</span>
      <a href="login.html" class="btn-nav">Join / Log In</a>`;
  }
}

// ---- FLASH MESSAGE ----
function showFlash(msg, type = 'success') {
  let el = document.getElementById('flash');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash';
    el.style.cssText = `
      position: fixed; top: 72px; left: 50%; transform: translateX(-50%);
      padding: 0.75rem 1.75rem; z-index: 9999; font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase;
      border: 1px solid; transition: opacity 0.4s;`;
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
  setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

// ---- MOCK DATA ----
const MockData = {
  members: [
    { id: 1, firstName: 'Marcus',  lastName: 'T.', email: 'marcus@example.com',  joined: 'May 21', games: ['40K'],       newsletter: true,  role: 'member' },
    { id: 2, firstName: 'Sarah',   lastName: 'K.', email: 'sarah@example.com',   joined: 'May 21', games: ['D&D'],       newsletter: true,  role: 'member' },
    { id: 3, firstName: 'Dan',     lastName: 'K.', email: 'dan@example.com',     joined: 'May 21', games: ['D&D'],       newsletter: true,  role: 'member' },
    { id: 4, firstName: 'Phil',    lastName: 'R.', email: 'phil@example.com',    joined: 'May 22', games: ['BattleTech'],newsletter: false, role: 'member' },
    { id: 5, firstName: 'Yuki',    lastName: 'M.', email: 'yuki@example.com',    joined: 'May 22', games: ['Pokémon'],   newsletter: true,  role: 'member' },
    { id: 6, firstName: 'Jamie',   lastName: 'O.', email: 'jamie@example.com',   joined: 'May 22', games: ['Board'],     newsletter: true,  role: 'member' },
    { id: 7, firstName: 'Toby',    lastName: 'S.', email: 'toby@jffg.com',       joined: 'May 21', games: ['40K','D&D'], newsletter: false, role: 'admin'  },
  ],

  tables: [
    { id: 1, icon: '⚔️', name: 'Table 1 — Standard Mat',   desc: 'Seats 2–4 · Good for 40K, BattleTech, card games',   capacity: 4 },
    { id: 2, icon: '🗺️', name: 'Table 2 — Large Hex Mat',  desc: 'Seats 2–6 · Great for large battles & campaigns',     capacity: 6 },
    { id: 3, icon: '🏰', name: 'Table 3 — Terrain Board',  desc: 'Seats 2–4 · 3D terrain pre-set, rotating scenarios',  capacity: 4 },
    { id: 4, icon: '🎲', name: 'Table 4 — RPG Corner',     desc: 'Seats up to 8 · Round table, ideal for D&D/Pathfinder',capacity: 8 },
    { id: 5, icon: '🃏', name: 'Table 5 — Card Table',     desc: 'Seats 2–4 · Perfect for Magic, Pokémon, Lorcana',     capacity: 4 },
  ],

  reservations: [
    { id: 1, memberId: 1, memberName: 'Marcus T.',      tableId: 1, date: '2026-05-22', time: '5:00 PM',  game: '40K',        players: 2, notes: '' },
    { id: 2, memberId: 2, memberName: 'Sarah & Dan K.', tableId: 4, date: '2026-05-22', time: '6:30 PM',  game: 'D&D',        players: 5, notes: 'First session — new players' },
    { id: 3, memberId: 4, memberName: 'Phil R.',        tableId: 2, date: '2026-05-22', time: '7:00 PM',  game: 'BattleTech', players: 2, notes: 'Needs hex terrain' },
    { id: 4, memberId: 5, memberName: 'Yuki M.',        tableId: 5, date: '2026-05-23', time: '3:00 PM',  game: 'Pokémon',    players: 2, notes: '' },
    { id: 5, memberId: 6, memberName: 'Evan B.',        tableId: 1, date: '2026-05-23', time: '4:00 PM',  game: 'Board Game', players: 4, notes: 'Bringing Twilight Imperium' },
    { id: 6, memberId: 2, memberName: 'Campaign Group', tableId: 4, date: '2026-05-27', time: '6:00 PM',  game: 'Pathfinder', players: 8, notes: 'Recurring campaign night' },
    { id: 7, memberId: 6, memberName: 'Evan B.',        tableId: 2, date: '2026-05-28', time: '6:00 PM',  game: '40K',        players: 2, notes: '' },
    { id: 8, memberId: 6, memberName: 'Evan B.',        tableId: 4, date: '2026-06-01', time: '4:30 PM',  game: 'D&D',        players: 5, notes: '' },
  ],

  getReservationsForDate(dateStr) {
    return this.reservations.filter(r => r.date === dateStr);
  },

  getTableAvailability(dateStr, time) {
    const booked = this.reservations
      .filter(r => r.date === dateStr && r.time === time)
      .map(r => r.tableId);
    return this.tables.map(t => ({ ...t, available: !booked.includes(t.id) }));
  },

  getUserReservations(memberId) {
    return this.reservations.filter(r => r.memberId === memberId);
  },

  addReservation(res) {
    const id = this.reservations.length + 1;
    this.reservations.push({ id, ...res });
    return id;
  }
};

// ---- GAME BADGE HELPER ----
function gameBadge(game) {
  const map = {
    '40K':        'gb-40k',
    'D&D':        'gb-dnd',
    'BattleTech': 'gb-btch',
    'Pathfinder': 'gb-path',
    'Pokémon':    'gb-card',
    'Magic':      'gb-card',
    'Lorcana':    'gb-card',
    'Board Game': 'gb-board',
  };
  const cls = map[game] || 'gb-board';
  return `<span class="gb ${cls}">${game}</span>`;
}

// ---- DATE HELPERS ----
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  initHamburger();
});
