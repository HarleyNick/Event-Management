/* =====================================================================
   script.js: application logic, state and DOM updates for the Hackathon portal.
   Read it top to bottom:
     1. CONFIG   fixed settings (never change while the page runs)
     2. CLS      state class names, defined in styles.css section 4
     3. DOM      registry of every id / selector this file uses, defined in index.html
     4. DATA     icons, roles, menus, events, sessions, demo accounts
     5. STATE    the one object (STATE) that remembers everything that can change
     6. LOGIC    accounts, drawing functions, actions
     7. init()   attaches all listeners and starts the app
   This file never writes element.style.<property>. It toggles classes from CLS or sets CSS variables.
   ===================================================================== */

/* ============ 1. CONFIG ============ */
const CONFIG = Object.freeze({
  STORAGE_KEYS: Object.freeze({
    events: "portal-events-v3", // admin edits to events survive a refresh
    keynotes: "portal-keynotes-v1",
    accounts: "portal-accounts-v1",
    session: "portal-session-v1",
  }),
  DEFAULT_THEME: "dark",
  DEFAULT_EVENT_ID: "limpopo",
  TICK_MS: 1000, // how often the countdown redraws
  BANNER_SHRINK: 0.2, // the banner shrinks to 80% while it sticks to the top
  DEMO_PASSWORD: "demo1234",
  ADMIN_CODE: "LIMPOPO-ADMIN", // DEMO ONLY: Super Admin sign-up needs this code. LATER: organizers are created by the server, never by a code in the page.
  LOGO: "data:image/png;base64,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", // Limpopo Dev Ecosystem logo (transparent, white) so it reads on the crimson sidebar
});

/* ============ 2. CLS: state classes (see styles.css, section 4) ============ */
const CLS = Object.freeze({
  active: "is-active",
  hidden: "is-hidden",
  live: "is-live",
  done: "is-done",
  open: "is-open",
  custom: "is-custom",
  pinned: "is-pinned",
});

/* ============ 3. DOM: every lookup in one place ============ */
const byId = (id) => document.getElementById(id);
const bySelector = (sel) => document.querySelector(sel);
const DOM = {
  document,
  window,
  root: document.documentElement,
};
// Fixed shells that already exist in index.html (script.js fills them).
const STATIC_IDS = { app: "app", sidebar: "sidebar", banner: "banner", topnav: "topnav", bcast: "bcast", top: "top", page: "page", qaFloat: "qaFloat" };
// Elements created by the draw*() functions. Looked up when used, because they come and go.
const RENDERED_IDS = {
  timerow: "timerow", cd: "cd", bmsg: "bmsg", codeBox: "codeBox",
  authErr: "authErr", evErr: "evErr", keyErr: "keyErr", qaErr: "qaErr",
  keyForm: "keyForm", qaList: "qaList", qCount: "qCount", qaOpen: "qaOpen",
  imgUrl: "imgUrl", noteTxt: "noteTxt",
};
const RENDERED_SELECTORS = { qaClose: ".qa-x", authEmail: "#authForm [name=email]", authPassword: "#authForm [name=password]" };
const hook = (map, find) =>
  Object.entries(map).forEach(([key, value]) => Object.defineProperty(DOM, key, { get: () => find(value), enumerable: true }));
hook(STATIC_IDS, byId);
hook(RENDERED_IDS, byId);
hook(RENDERED_SELECTORS, bySelector);

/* ============ ICONS: small line drawings, so the menu works with icons alone ============ */
const IC = {
  live: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19a10 10 0 0 1 0-14"/>',
  mentors: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  teams:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  notices:
    '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
  judging: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
  admin: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  auth: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  pin: '<path d="M12 17v5M9 3h6l-1 7 3 3v2H7v-2l3-3z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  thumb:
    '<path d="M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.5l-1.4 7a2 2 0 0 1-2 1.5H7V10l4-8a2.4 2.4 0 0 1 4 3.9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  alert:
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
};
const svg = (n, s = 22) =>
  `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ============ DATA: roles, menus and who may see what ============ */
const ROLES = {
  guest: "Guest",
  attendee: "Attendee",
  mentor: "Mentor",
  team: "Team",
  judge: "Judge",
  superadmin: "Super Admin",
};
// Every menu item, in sidebar order. "badge" is the small tag shown when the menu is open.
const MENU = [
  { id: "live", label: "Live program & keynotes", hint: "Talks, workshops and questions" },
  { id: "mentors", label: "Mentor 1-on-1 hub", hint: "Get help from an expert" },
  { id: "teams", label: "Team directory", hint: "See all teams" },
  { id: "notices", label: "Notice board", hint: "Announcements for teams" },
  { id: "judging", label: "Judging portal", hint: "Score the projects" },
  { id: "admin", label: "Super Admin console", hint: "Banner, countdown, controls" },
  { id: "auth", label: "Log in & registration", hint: "Sign in or create an account" },
];
// ROLE-BASED ACCESS CONTROL: the menus each role may open. Everyone gets "auth".
const SIGNUP_ROLES = ["attendee", "mentor", "team", "judge", "superadmin"]; // roles a person can pick when registering
const ALLOWED = {
  guest: ["live", "auth"],
  attendee: ["live", "auth"],
  mentor: ["live", "mentors", "auth"],
  team: ["live", "mentors", "teams", "notices", "auth"],
  judge: ["live", "judging", "auth"],
  superadmin: ["live", "mentors", "teams", "notices", "judging", "admin", "auth"],
};
const can = (role, id) => ALLOWED[role].includes(id);

// Placeholder banner pictures (dark, crimson-led) until real photos are added.
const banner = () =>
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0a1c"/><stop offset="1" stop-color="#14153a"/></linearGradient></defs><rect width="1600" height="420" fill="url(#s)"/><g fill="#fff" fill-opacity=".07"><ellipse cx="620" cy="40" rx="110" ry="34"/><ellipse cx="540" cy="52" rx="70" ry="26"/><ellipse cx="1330" cy="50" rx="80" ry="26"/><ellipse cx="300" cy="70" rx="60" ry="20"/></g><path d="M0 420V330C200 250 380 250 560 330S900 300 1020 250 1300 300 1600 330V420Z" fill="#5a1233"/><path d="M0 420V360C150 280 330 290 470 350S720 380 820 340 1200 250 1400 310 1560 340 1600 350V420Z" fill="#2a0d24"/></svg>',
  );
const inHours = (h) => new Date(Date.now() + h * 3600000).toISOString();
// "image" = banner URL, "dueAt" = countdown target. The Super Admin can change both.
const DEFAULTS = [
  {
    id: "limpopo",
    name: "SYNAPSE 2026 // Limpopo Dev Hackathon",
    short: "Limpopo Dev Hackathon",
    date: "Nov 10-12, 2026",
    tag: "48-Hour Live Build & Pitch Championship",
    place: "Moscone Center West & Global Virtual Stream",
    open: true,
    dueAt: inHours(18),
    image: banner("#3a0a1c", "#14153a"),
    summary:
      "Premier 48-hour global multimodal artificial intelligence, agentic frameworks, and edge computing championship.",
    tracks: ["Generative AI", "Web3", "Hardware & Edge", "Climate Tech", "Social Impact"],
  },
  {
    id: "zk",
    name: "Zero Knowledge Summit",
    short: "Zero Knowledge Summit",
    date: "Dec 3-4, 2026",
    tag: "Two Days of Talks & Workshops",
    place: "Global Virtual Stream",
    open: true,
    dueAt: inHours(72),
    image: banner("#07272e", "#1a1442"),
    summary: "Two days of talks and workshops on privacy-preserving technology.",
    tracks: ["Proofs", "Privacy", "Layer 2"],
  },
  {
    id: "climate",
    name: "Climate Tech Sprint",
    short: "Climate Tech Sprint",
    date: "Jan 15-17, 2027",
    tag: "Weekend Build Sprint",
    place: "Global Virtual Stream",
    open: false,
    dueAt: inHours(240),
    image: banner("#0b2a1a", "#0d1f3a"),
    summary: "A weekend sprint to build tools for a greener future.",
    tracks: ["Energy", "Water", "Farming"],
  },
];
const TYPES = ["All", "Main Stage", "Workshop Lab", "Mentor Pit", "Lightning Talks"];
// Every session has a start and an end time (in milliseconds). It shows "Live now" between the two and
// disappears from the page once its end time has passed.
// DEMO: the times are set relative to when the page opens so you can watch a session end (the keynote
// ends 3 minutes after load). For real events use fixed times, e.g. new Date("2026-11-20T10:00").getTime().
const inMin = (m) => Date.now() + m * 60000;
const DEFAULT_SESSIONS = [
  {
    id: 1,
    topics: ["Generative AI"],
    type: "Main Stage",
    start: inMin(-40),
    end: inMin(3),
    title: "Keynote: Autonomous Agent Swarms with Multimodal Grounding",
    about:
      "Deep dive into next-generation reactive architectures where agentic loops fuse vision, audio, and code execution with verifiable consensus.",
    who: "Dr. Aris Thorne, Google DeepMind",
  },
  {
    id: 2,
    topics: ["Generative AI", "Hardware & Edge"],
    type: "Workshop Lab",
    start: inMin(4),
    end: inMin(94),
    title: "Hands-on Lab: Deploying Local SLMs on WebGPU & WASM",
    about:
      "Build and deploy a zero-latency in-browser embedding and generation pipeline with quantized weights running directly on user hardware.",
    who: "Priya Sharma, Hugging Face",
  },
  {
    id: 3,
    topics: ["Generative AI"],
    type: "Main Stage",
    start: inMin(110),
    end: inMin(170),
    title: "Constitutional Safety & Red-Teaming for Production Agents",
    about:
      "Practical security frameworks to prevent jailbreaks, prompt injection, and unauthorized API execution in autonomous agent workflows.",
    who: "Elena Rostova, Anthropic Core Systems",
  },
  {
    id: 4,
    topics: ["Web3"],
    type: "Lightning Talks",
    start: inMin(185),
    end: inMin(230),
    title: "Zero-Knowledge State Channels for Ultra-Fast Decentralized Gaming",
    about:
      "How to achieve sub-50ms verifiable off-chain game physics with succinct batch proofs settled periodically on layer-1.",
    who: "Marcus Vance, Solana Labs",
  },
  {
    id: 5,
    topics: ["Social Impact"],
    type: "Mentor Pit",
    start: inMin(245),
    end: inMin(320),
    title: "Venture Pitch Clinic: What Judges & Angel VCs Look For",
    about:
      "1-on-1 critique of 3-minute deck structure, traction milestones, defensible moat articulation, and live demo stagecraft.",
    who: "Kaito Tanaka, Cybernetic Ventures",
  },
];
// KEYNOTE STORE: the Super Admin's additions, deletions and edits are kept in the browser (storage name below).
// Built-in sessions can be edited or deleted too: that is saved as "mod" (changes) and "del" (hidden ids).
function loadKeynotes() {
  let kn = { add: [], del: [], mod: {} };
  try {
    const r = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.keynotes));
    if (r && typeof r === "object") kn = { add: r.add || [], del: r.del || [], mod: r.mod || {} };
  } catch (e) {
    /* storage blocked */
  }
  return kn;
}
function saveKN() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.keynotes, JSON.stringify(STATE.keynotes));
  } catch (e) {
    /* ignore */
  }
}
const allSessions = () => [
  ...DEFAULT_SESSIONS.filter((s) => !STATE.keynotes.del.includes(s.id)).map((s) => ({ ...s, ...(STATE.keynotes.mod[s.id] || {}) })),
  ...STATE.keynotes.add,
];
// Sessions still to come or happening now, for the chosen event, stage tab and topic pill.
const sessionsNow = () => {
  const n = Date.now(),
    tp = (STATE.topic || "").toLowerCase();
  return allSessions()
    .filter((s) => (!s.ev || s.ev === STATE.eventId) && s.end > n)
    .filter((s) => !tp || (s.topics || []).some((t) => t.toLowerCase() === tp))
    .map((s) => ({ ...s, live: s.badge === "off" ? false : s.badge === "live" ? true : s.start <= n }));
};
const sessionsSig = () => sessionsNow().map((s) => s.id + (s.live ? "L" : "")).join();
const timeLabel = (s) => {
  const f = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return f(s.start) + " - " + f(s.end);
};
const MENTORS = [
  ["Priya Sharma", "Machine learning"],
  ["Kaito Tanaka", "Pitching and funding"],
  ["Elena Rostova", "Security"],
];
const TEAMS = [
  ["NeuralPulse", 4],
  ["BioSynapse", 3],
  ["ZeroProof", 5],
  ["GreenGrid", 4],
];
const NOTICES = [
  ["Lunch is at 1 PM", "Find the food tables near the main hall."],
  ["Repository rule", "Your GitHub repo must be public and include a LICENSE file."],
];

/* ============ STATE: everything that can change while the page runs ============ */
const STATE = {
  events: load(),
  keynotes: loadKeynotes(), // admin-made keynote additions, edits and deletions
  accounts: [], // filled by initAccounts()
  sessSig: "", // remembers what is on screen, so the page only redraws when a session starts or ends
  bnRange: 1, // scroll distance over which the banner shrinks
  bnRaf: 0, // pending requestAnimationFrame id for the banner scroll effect
  eventId: CONFIG.DEFAULT_EVENT_ID,
  role: "guest",
  loggedIn: false,
  user: null,
  page: "live",
  theme: CONFIG.DEFAULT_THEME,
  pinned: false,
  bcastOff: false,
  qaOpen: false,
  filter: "All",
  topic: "",
  editKey: null,
  delArm: null,
  keyNote: "",
  notice: "",
  evNote: "",
  authMode: "login",
  reserved: [],
  booked: [],
  scores: {},
  voted: [],
  questions: [
    {
      id: 1,
      name: "Kai Vance",
      team: "NeuralPulse",
      time: "10:14 AM",
      pinned: true,
      votes: 42,
      text: "How do you handle latency jitter when streaming tool-call arguments concurrently across a distributed swarm of sub-agents?",
    },
    {
      id: 2,
      name: "Mei Lin",
      team: "BioSynapse",
      time: "10:22 AM",
      pinned: false,
      votes: 29,
      text: "Can we use speculative decoding directly against multi-modal video streams, or is the KV-cache invalidation too prohibitive?",
    },
    {
      id: 3,
      name: "Alex Thorne",
      team: "ZeroProof",
      time: "10:35 AM",
      pinned: false,
      votes: 18,
      text: "What is the benchmark overhead for runtime safety filtering when generating streaming code tokens at 80 tokens/sec?",
    },
  ],
};

function load() {
  try {
    const r = localStorage.getItem(CONFIG.STORAGE_KEYS.events);
    if (r) return JSON.parse(r);
  } catch (e) {
    /* storage blocked */
  }
  return DEFAULTS;
}
function save() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.events, JSON.stringify(STATE.events));
  } catch (e) {
    /* ignore */
  }
}

const ev = () => STATE.events.find((e) => e.id === STATE.eventId);
const esc = (t) =>
  String(t).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  ); // stops typed text running as code
function update(patch) {
  Object.assign(ev(), patch);
  save();
}
const visible = () => MENU.filter((m) => can(STATE.role, m.id));
// The top bar holds every tab except "Log in & registration" (that lives in the sidebar).
const navItems = () => visible().filter((m) => m.id !== "auth");

/* ============ ACCOUNTS (DEMO): sign-up and login happen inside the browser ============
   A person's role comes from the account they registered with. It cannot be changed afterwards.
   LATER: replace this block with calls to a real backend. A real site must never keep passwords in the browser. */
const DEMO = [
  // ready-made accounts so you can try each role
  { email: "attendee@demo.test", name: "Ayanda", role: "attendee" },
  { email: "mentor@demo.test", name: "Priya", role: "mentor" },
  { email: "team@demo.test", name: "Team NeuralPulse", role: "team" },
  { email: "judge@demo.test", name: "Kaito", role: "judge" },
  { email: "admin@demo.test", name: "Thandi", role: "superadmin" },
];
// Turns a password into a scrambled fingerprint, so the plain password is never stored.
async function fingerprint(email, pass) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(email.toLowerCase() + ":" + pass),
  );
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const isDemo = (a) => DEMO.some((d) => d.email === a.email);
function saveAccounts() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.accounts, JSON.stringify(STATE.accounts.filter((a) => !isDemo(a))));
  } catch (e) {
    /* storage blocked */
  }
}
// Signing in fixes the role to the one on the account.
function signIn(u) {
  STATE.user = u;
  STATE.role = u.role;
  STATE.loggedIn = true;
  STATE.page = "live";
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.session, u.email);
  } catch (e) {
    /* ignore */
  }
}
function signOut() {
  STATE.user = null;
  STATE.role = "guest";
  STATE.loggedIn = false;
  STATE.page = "live";
  try {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.session);
  } catch (e) {
    /* ignore */
  }
}
async function initAccounts() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.accounts)) || [];
  } catch (e) {
    /* ignore */
  }
  const demo = await Promise.all(
    DEMO.map(async (d) => ({ ...d, key: await fingerprint(d.email, CONFIG.DEMO_PASSWORD) })),
  );
  STATE.accounts = [...demo, ...saved];
  try {
    const u = STATE.accounts.find((a) => a.email === localStorage.getItem(CONFIG.STORAGE_KEYS.session));
    if (u) signIn(u);
  } catch (e) {
    /* ignore */
  } // keep people signed in after a refresh
}
// Log in or register. The role always comes from the account, never from a choice made after signing in.
async function handleAuth(f) {
  const email = f.get("email").trim().toLowerCase(),
    pass = f.get("password"),
    name = (f.get("name") || "").trim(),
    err = DOM.authErr,
    reg = STATE.authMode === "register";
  if (!email || !pass || (reg && !name)) {
    err.textContent = "Please fill in every box.";
    return;
  }
  if (reg && pass.length < 6) {
    err.textContent = "Please use at least 6 characters for your password.";
    return;
  }
  const key = await fingerprint(email, pass),
    found = STATE.accounts.find((a) => a.email === email);
  if (reg) {
    if (found) {
      err.textContent = "That email already has an account. Please log in instead.";
      return;
    }
    const role = SIGNUP_ROLES.includes(f.get("role")) ? f.get("role") : "attendee";
    if (role === "superadmin" && (f.get("code") || "").trim() !== CONFIG.ADMIN_CODE) {
      err.textContent = "That Super Admin access code is not right.";
      return;
    }
    const u = { email, name, role, key };
    STATE.accounts.push(u);
    saveAccounts();
    signIn(u);
  } else {
    if (!found || found.key !== key) {
      err.textContent = "That email or password is not right. Please try again.";
      return;
    }
    signIn(found);
  }
  drawAll();
}

/* ============ DRAWING: each function fills one part of the screen ============ */
function drawSidebar() {
  const name = STATE.loggedIn ? STATE.user.name : "Guest";
  DOM.sidebar.innerHTML = `<div class="sb-logo"><img src="${CONFIG.LOGO}" alt="Limpopo Dev Ecosystem"></div><div class="sb-user"><span class="sb-av" aria-hidden="true">${esc(name.charAt(0).toUpperCase())}</span><span class="t"><b>${esc(name)}</b><small>${ROLES[STATE.role]}</small></span></div>
    <div class="sb-mid"><div class="sb-event">${svg("layers", 20)}<div class="t"><span class="lbl">Event</span><select data-change="event" aria-label="Choose an event">${STATE.events.map((x) => `<option value="${x.id}"${x.id === STATE.eventId ? " selected" : ""}>${esc(x.short)}</option>`).join("")}</select></div></div></div>
    <div class="sb-foot">
      <button class="nav" data-action="theme" aria-label="Switch between light and dark mode"><span class="themeic"><span class="i sun">${svg("sun", 20)}</span><span class="i moon">${svg("moon", 20)}</span></span><span class="t"><span class="lt">Switch to light</span><span class="dk">Switch to dark</span></span></button>
      <button class="nav" data-action="auth-toggle">${svg(STATE.loggedIn ? "out" : "auth", 20)}<span class="t">${STATE.loggedIn ? "Log out" : "Log in / Register"}</span></button>
    </div>`;
}
// TOP NAVIGATION: the event name, the role tag and one tab for every menu item this role may open.
function drawNav() {
  DOM.topnav.innerHTML = `<ul class="menu">${navItems()
      .map(
        (m) => `<li><button class="nav${STATE.page === m.id ? " is-active" : ""}" data-action="nav" data-v="${m.id}" title="${m.hint}"${STATE.page === m.id ? ' aria-current="page"' : ""}><span class="ic">${svg(m.id, 18)}</span><span class="t"><b>${m.label}</b></span></button></li>`,
      )
      .join("")}</ul>`;
}
function drawTop() {
  const e = ev(),
    due = new Date(e.dueAt);
  DOM.top.innerHTML = `<div class="toolbar"><h2 class="ptitle">${MENU.find((m) => m.id === STATE.page).label}</h2>
    <div class="row"><span class="tag ${e.open ? "g" : ""}">${svg("lock", 12)} ${e.open ? "Submissions open" : "Submissions closed"}</span>
    </div></div>
    <div class="timerow" id="timerow"><div class="timers"><div class="boxes" id="cd" role="timer" aria-label="Time left until code freeze"></div></div>
    <div class="timebox"><span class="lbl">Time</span><b>${due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b><span class="lbl">Code freeze</span></div></div>`;
  tick();
}
function drawBanner() {
  const e = ev(),
    b = DOM.banner,
    custom = !e.image.startsWith("data:"); // the Super Admin can swap in their own photo
  b.classList.toggle(CLS.custom, custom); // styles.css adds the dark overlay for custom photos
  b.style.setProperty("--banner-image", `url("${custom ? e.image.replace(/"/g, "%22") : e.image}")`);
  const changeBtn = STATE.role === "superadmin" ? `<button class="btn primary" data-action="nav" data-v="admin">Change program banner</button>` : "";
  b.innerHTML = `<div class="bn-full"><div class="tl"><span class="bchip mono">${esc(e.place)}</span>${changeBtn}</div>
    <h1>${esc(e.name)}</h1>
    ${e.summary ? `<p>${esc(e.summary)}</p>` : ""}
    <div class="row"><span class="tag">${esc(e.date)}</span><span class="mono">${esc(e.tag)}</span></div></div>`;
  bannerMetrics();
}
// BROADCAST BAR: shows how long is left. Can be dismissed with the X.
// PINNED BANNER: the banner is sticky. It scrolls up until the top 20% is gone, then stays at the top. While that
// happens the scroll position (0 to 1) shrinks the whole banner to 80% and spreads a dark fill in from both sides
// (up to 20% of the width each). Only transform changes, so it stays smooth.
function bannerMetrics() {
  const b = DOM.banner;
  if (!b || b.classList.contains(CLS.hidden)) return;
  const h = b.offsetHeight;
  DOM.root.style.setProperty("--bn-h", h + "px");
  STATE.bnRange = Math.max(1, h * CONFIG.BANNER_SHRINK);
  bannerScroll();
}
function bannerScroll() {
  STATE.bnRaf = 0;
  const b = DOM.banner;
  if (!b || b.classList.contains(CLS.hidden)) return;
  const p = Math.min(1, Math.max(0, -b.getBoundingClientRect().top / STATE.bnRange)),
    fill = p * p * (3 - 2 * p);
  b.style.setProperty("--fill", fill.toFixed(3));
  b.style.setProperty("--s", (1 - CONFIG.BANNER_SHRINK * fill).toFixed(3));
  b.classList.toggle(CLS.pinned, p >= 0.97);
}
function drawBcast() {
  DOM.bcast.classList.toggle(CLS.hidden, STATE.bcastOff);
  DOM.bcast.innerHTML = `<i class="dot"></i><b>Broadcast:</b>${svg("alert", 16)}<span id="bmsg">
    </span><button class="x" data-action="bcast-x" aria-label="Close this message">${svg("x", 16)}</button>`;
}
// COUNTDOWN: runs every second and only touches the clock, so typing elsewhere is never interrupted.
function tick() {
  const left = Math.max(0, Math.floor((new Date(ev().dueAt) - Date.now()) / 1000)),
    cd = DOM.cd,
    bm = DOM.bmsg;
  if (bm)
    bm.textContent =
      ev().note ||
      (left
        ? `${Math.ceil(left / 3600)} hours until submission portal freeze. Make sure all GitHub repositories are public and contain a valid LICENSE.`
        : "The submission portal is now frozen.");
  const tr = DOM.timerow;
  if (tr) tr.classList.toggle(CLS.hidden, left <= 0); // countdown and Code freeze box disappear at zero
  syncSessions();
  if (!cd) return;
  const p = (n) => String(n).padStart(2, "0");
  cd.innerHTML = [
    [Math.floor(left / 86400), "days"],
    [Math.floor((left % 86400) / 3600), "hrs"],
    [Math.floor((left % 3600) / 60), "min"],
    [left % 60, "sec"],
  ]
    .map(([n, u]) => `<i><b>${p(n)}</b><small>${u}</small></i>`)
    .join("");
}
function syncSessions() {
  if (STATE.page === "live" && sessionsSig() !== STATE.sessSig) drawPage();
}

// One session card. The "Save my seat" button needs a login.
function card(s) {
  const r = STATE.reserved.includes(s.id);
  return `<article class="blk${s.live ? " is-live" : ""}"><h2 class="big">${esc(s.title)}</h2>
    <p class="sub">${esc(s.type)} \u00B7 ${timeLabel(s)} ${s.live ? '<span class="livepill mono">Live now</span>' : ""}</p>
    <p class="soft">${esc(s.about || "")}</p>${s.who ? `<p class="mono who">${esc(s.who).replace(", ", " \u00B7 ")}</p>` : ""}
    ${s.rsvp === false ? "" : `<button class="rsvp${r ? " is-done" : ""}" aria-pressed="${r}" data-action="reserve" data-v="${s.id}">${svg("cal", 16)} ${r ? "Seat saved" : "Save my seat"}</button>`}</article>`;
}
// Q&A list: pinned questions first, then the most votes.
function qaList() {
  return [...STATE.questions]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.votes - a.votes)
    .map(
      (q) =>
        `<li><div class="qwho"><span><b>${esc(q.name)}</b> (Team ${esc(q.team)})</span>
      <span>${q.time}</span></div><p class="u-my-8">${esc(q.text)}</p>
    <div class="qfoot"><button class="vote" data-action="vote" data-v="${q.id}"${STATE.voted.includes(q.id) ? " disabled" : ""} aria-label="Vote for this question. Votes: ${q.votes}">${svg("thumb", 14)} ${q.votes}</button>${q.pinned ? `<span class="mono u-text-amber">${svg("pin", 12)} Pinned</span>` : ""}</div>
      </li>`,
    )
    .join("");
}
const liveList = () => {
  const l = sessionsNow().filter((s) => STATE.filter === "All" || s.type === STATE.filter);
  return l.length
    ? l.map(card).join("")
    : '<p class="soft u-text-center u-my-40">No sessions left in this view.</p>';
};
// SUPER ADMIN: the form that adds (and schedules) the next upcoming event.
const eventPanel = () => {
  const mine = STATE.events.filter((x) => x.custom);
  return `<section class="panel admin-card admin-events">
    <header class="admin-section-head"><div><p class="admin-kicker">EVENT SETUP</p><h3>Create an event</h3><p class="soft">Publish another event and add it to the event switcher.</p></div>${svg("layers", 22)}</header>
    <form class="admin-form" id="eventForm" novalidate>
      <label>Event name<input name="name" placeholder="e.g. Pretoria Robotics Challenge"></label>
      <label>Short name<input name="short" placeholder="Name shown in menus"></label>
      <div class="two"><label>Starts<input type="datetime-local" name="start"></label><label>Code freeze<input type="datetime-local" name="due"></label></div>
      <label>Description<textarea name="summary" rows="3" placeholder="A sentence or two about the event"></textarea></label>
      <label>Tagline<input name="tag" placeholder="e.g. 48-Hour Build Sprint"></label>
      <label>Location<input name="place" placeholder="e.g. Sandton Convention Centre"></label>
      <label>Tracks<input name="tracks" placeholder="Separate tracks with commas"></label>
      <label>Banner image URL <span class="soft">(optional)</span><input name="image" placeholder="https://example.com/banner.jpg"></label>
      <p class="err" id="evErr" role="alert"></p>
      <button class="btn primary">Publish event</button>
    </form>
    ${STATE.evNote ? `<p class="note" role="status">${esc(STATE.evNote)}</p>` : ""}
    ${mine.length ? `<div class="admin-records"><h4>Your events</h4>${mine.map((x) => `<div class="admin-record"><span><b>${esc(x.short)}</b><small>${esc(x.date)}</small></span><button class="btn" type="button" data-action="rm-event" data-v="${x.id}">Remove</button></div>`).join("")}</div>` : ""}
  </section>`;
};
// SUPER ADMIN: add, edit and delete keynotes. They show up in Live program & keynotes straight away.
const toLocal = (ms) => new Date(ms - new Date(ms).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const fmtWhen = (ms) => new Date(ms).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const keyPanel = () => {
  const e = ev(),
    n = Date.now(),
    list = allSessions().filter((x) => !x.ev || x.ev === e.id).sort((a, b) => a.start - b.start),
    k = STATE.editKey ? list.find((x) => x.id === STATE.editKey) : null,
    t0 = Math.ceil(n / 60000) * 60000,
    v = k || { type: TYPES[1], topics: [], start: t0, end: t0 + 45 * 60000, title: "", about: "", who: "", badge: "auto", rsvp: true },
    parts = String(v.who || "").split(", "),
    speaker = parts[0] || "",
    org = parts.slice(1).join(", "),
    badge = v.badge || "auto";
  return `<section class="panel admin-card admin-keynotes">
    <header class="admin-section-head"><div><p class="admin-kicker">PROGRAM SCHEDULE</p><h3>${k ? "Edit keynote" : "Manage keynotes"}</h3><p class="soft">${k ? "Update the details below." : `Add and schedule a keynote for ${esc(e.short)}.`}</p></div>${svg("cal", 22)}</header>
    <form class="admin-form" id="keyForm" novalidate>
      <label>Title<input name="title" placeholder="e.g. Keynote: Autonomous Agent Swarms with Multimodal Grounding" value="${esc(v.title)}"></label>
      <div class="two"><label>Stage / Track<select name="type">${TYPES.slice(1).map((t) => `<option${t === v.type ? " selected" : ""}>${t}</option>`).join("")}</select></label>
      <label>Status badge<select name="badge"><option value="auto"${badge === "auto" ? " selected" : ""}>Automatic (LIVE NOW during the slot)</option><option value="live"${badge === "live" ? " selected" : ""}>Always show LIVE NOW</option><option value="off"${badge === "off" ? " selected" : ""}>No badge</option></select></label></div>
      <div><p class="lbl soft u-m-0 u-mb-6">Topics</p>
      <div class="row">${e.tracks.length ? e.tracks.map((t) => `<label class="chk"><input type="checkbox" name="topics" value="${esc(t)}"${(v.topics || []).some((x) => x.toLowerCase() === t.toLowerCase()) ? " checked" : ""}> ${esc(t)}</label>`).join("") : '<span class="soft">This event has no topics yet.</span>'}</div></div>
      <div class="two"><label>Starts<input type="datetime-local" name="start" value="${toLocal(v.start)}"></label><label>Ends<input type="datetime-local" name="end" value="${toLocal(v.end)}"></label></div>
      <label>Description / abstract<textarea name="about" rows="3" placeholder="A sentence or two about the talk">${esc(v.about || "")}</textarea></label>
      <div class="two"><label>Speaker name<input name="speaker" placeholder="e.g. Dr. Aris Thorne" value="${esc(speaker)}"></label><label>Organization<input name="org" placeholder="e.g. Google DeepMind" value="${esc(org)}"></label></div>
      <label class="chk"><input type="checkbox" name="rsvp"${v.rsvp === false ? "" : " checked"}> Show the \u201CSave my seat\u201D button</label>
      <p class="err" id="keyErr" role="alert"></p>
      <div class="row"><button class="btn primary u-justify-center">${k ? "Save changes" : "Publish keynote"}</button>${k ? '<button class="btn" type="button" data-action="key-cancel">Cancel</button>' : ""}</div>
    </form>
    ${STATE.keyNote ? `<p class="note" role="status">${esc(STATE.keyNote)}</p>` : ""}
    ${list.length ? `<div class="admin-records"><h4>Scheduled keynotes <span>${list.length}</span></h4>${list.map((x) => {
      const st = x.end <= n ? "Ended" : (x.badge === "off" ? false : x.badge === "live" ? true : x.start <= n) ? "Live now" : "Upcoming";
      return `<div class="admin-record"><span class="admin-record__main"><b>${esc(x.title)}</b><small>${esc(x.type)} · ${fmtWhen(x.start)} - ${new Date(x.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${st}</small></span>
      <span class="admin-record__actions"><button class="btn" type="button" data-action="key-edit" data-v="${x.id}">Edit</button><button class="btn" type="button" data-action="key-del" data-v="${x.id}">${STATE.delArm === x.id ? "Confirm delete" : "Delete"}</button></span></div>`;
    }).join("")}</div>` : '<p class="soft">No keynotes yet for this event.</p>'}</section>`;
};
const PAGES = {
  live: () => `<div class="live"><section>
    <div class="row u-justify-center" role="group" aria-label="Filter sessions by topic">${ev().tracks.map((t) => `<button type="button" class="tag${STATE.topic === t ? " r" : ""}" aria-pressed="${STATE.topic === t}" data-action="topic" data-v="${esc(t)}">${esc(t)}</button>`).join("")}</div>
    <div class="tabs" role="group" aria-label="Filter sessions by type">${TYPES.map((t) => `<button class="tab${STATE.filter === t ? " is-active" : ""}" aria-pressed="${STATE.filter === t}" data-action="filter" data-v="${t}">${t}</button>`).join("")}</div>
    ${STATE.notice ? `<p class="note" role="status">${STATE.notice}</p>` : ""}${liveList()}</section></div>`,
  mentors: () =>
    `<p class="soft u-mt-20">Book 20 minutes with an expert.</p>` +
    MENTORS.map(([n, sk]) => {
      const b = STATE.booked.includes(n);
      return `<article class="sess"><h3 class="u-m-0">${n}</h3><p class="soft">${sk}</p>
      <button class="rsvp${b ? " is-done" : ""}" data-action="book" data-v="${n}">${svg("cal", 16)} ${b ? "Booked. Tap to cancel" : "Book 20 minutes"}</button>
      </article>`;
    }).join(""),
  teams: () =>
    `<div class="u-mt-20">` +
    TEAMS.map(
      ([n, m]) => `<article class="sess">
    <h3 class="u-m-0">${n}</h3><p class="soft">${m} members</p></article>`,
    ).join("") +
    "</div>",
  notices: () =>
    `<div class="u-mt-20">` +
    NOTICES.map(
      ([t, b]) => `<article class="sess">
    <h3>${t}</h3><p class="soft">${b}</p></article>`,
    ).join("") +
    "</div>",
  judging: () =>
    `<p class="soft u-mt-20">Give each team a score from 0 to 10.</p>` +
    TEAMS.map(
      ([n]) => `<article class="sess">
    <h3>${n}</h3><label>Score<input type="number" min="0" max="10" data-score="${n}" value="${STATE.scores[n] ?? ""}">
    </label></article>`,
    ).join(""),
  admin: () => {
    const e = ev(),
      local = new Date(new Date(e.dueAt) - new Date(e.dueAt).getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16); // datetime-local wants local time
    const eventSessions = allSessions().filter((session) => !session.ev || session.ev === e.id).length;
    return `<div class="admin-dashboard">
      <header class="admin-hero">
        <div><p class="admin-kicker">EVENT OPERATIONS</p><h2>Super Admin Console</h2><p class="soft">Manage your event, schedule and attendee updates from one place.</p></div>
        <div class="admin-current-event"><span>MANAGING EVENT</span><strong>${esc(e.short)}</strong><span class="tag ${e.open ? "g" : "r"}">${e.open ? "Submissions open" : "Submissions closed"}</span></div>
      </header>
      <div class="admin-metrics">
        <article class="admin-metric"><span>Program sessions</span><strong>${eventSessions}</strong><small>Scheduled for this event</small></article>
        <article class="admin-metric"><span>Managed events</span><strong>${STATE.events.length}</strong><small>Available in the event switcher</small></article>
        <article class="admin-metric"><span>Submission status</span><strong class="${e.open ? "admin-status-open" : "admin-status-closed"}">${e.open ? "Open" : "Closed"}</strong><small>For ${esc(e.short)}</small></article>
      </div>
      <section class="panel admin-card admin-settings">
        <header class="admin-section-head"><div><p class="admin-kicker">EVENT CONFIGURATION</p><h3>Event settings</h3><p class="soft">Update the details attendees see across the portal.</p></div>${svg("layers", 22)}</header>
        <div class="admin-settings-grid">
          <div class="admin-setting"><div class="admin-setting__heading"><span class="admin-setting__icon">${svg("spark", 18)}</span><div><h4>Program banner</h4><p class="soft">Use a public image URL for a custom banner.</p></div></div><label>Banner image URL<input id="imgUrl" placeholder="https://example.com/banner.jpg" value="${e.image.startsWith("data:") ? "" : esc(e.image)}"></label><button class="btn primary" data-action="banner">Update banner</button></div>
          <div class="admin-setting"><div class="admin-setting__heading"><span class="admin-setting__icon">${svg("cal", 18)}</span><div><h4>Code freeze</h4><p class="soft">Choose when submissions close.</p></div></div><label>Date and time<input type="datetime-local" data-change="due" value="${local}"></label><small class="admin-hint">The countdown updates automatically.</small></div>
          <div class="admin-setting"><div class="admin-setting__heading"><span class="admin-setting__icon">${svg("alert", 18)}</span><div><h4>Broadcast message</h4><p class="soft">Shown in the status bar for attendees.</p></div></div><label>Message<input id="noteTxt" placeholder="Leave empty to use the countdown message" value="${esc(e.note || "")}"></label><button class="btn primary" data-action="note">Update message</button></div>
          <div class="admin-setting admin-submission-setting"><label class="chk"><input type="checkbox" data-change="open"${e.open ? " checked" : ""}><span><b>Submissions are open</b><small>Attendees can submit while this setting is enabled.</small></span></label></div>
        </div>
        ${STATE.notice ? `<p class="note" role="status">${esc(STATE.notice)}</p>` : ""}
      </section>
      <div class="admin-management-grid">${keyPanel()}${eventPanel()}</div>
    </div>`;
  },
  auth: () => {
    // Already signed in: show the account. The role cannot be changed here.
    if (STATE.loggedIn)
      return `<section class="panel narrow u-mt-24">
      <h3>You are signed in</h3><p class="soft">${esc(STATE.user.name)} (${ROLES[STATE.role]})<br>${esc(STATE.user.email)}</p>
      <p class="soft">Your menu only shows what your role can use. To use a different role, log out and sign in with a different account.</p>
      <div><button class="btn" data-action="auth-toggle">Log out</button></div></section>`;
    const reg = STATE.authMode === "register";
    return `<section class="panel narrow u-mt-24"><div class="tabs u-m-0">
      <button class="tab${reg ? "" : " is-active"}" data-action="mode" data-v="login">Log in</button>
      <button class="tab${reg ? " is-active" : ""}" data-action="mode" data-v="register">Register</button>
      </div>
    <form id="authForm" novalidate>${reg ? '<label>Your name<input name="name" autocomplete="name"></label>' : ""}<label>Email<input name="email" type="email" autocomplete="email">
      </label><label>Password<input name="password" type="password" autocomplete="${reg ? "new-password" : "current-password"}">
      </label>
    ${
      reg
        ? `<label>I am joining as<select name="role">${SIGNUP_ROLES.map((id) => `<option value="${id}">${ROLES[id]}</option>`).join("")}</select>
      </label><label id="codeBox" class="is-hidden">Super Admin access code<input name="code" autocomplete="off">
      </label><p class="soft">Your role is set when you register and cannot be changed later. Super Admin needs the organizer access code (demo code: ${CONFIG.ADMIN_CODE}).</p>`
        : ""
    }
    <p class="err" id="authErr" role="alert"></p><button class="btn primary u-justify-center">${reg ? "Create account" : "Log in"}</button>
      </form>
    ${
      reg
        ? ""
        : `<div><p class="lbl soft">Demo accounts (password ${CONFIG.DEMO_PASSWORD})</p>
      <div class="row">${DEMO.map((d) => `<button class="tab" type="button" data-action="demo" data-v="${d.email}">${ROLES[d.role]}</button>`).join("")}</div>
      </div>`
    }</section>`;
  },
};
function drawPage() {
  if (!can(STATE.role, STATE.page)) STATE.page = "live";
  STATE.sessSig = sessionsSig();
  DOM.banner.classList.toggle(CLS.hidden, STATE.page === "auth");
  /* the login form comes first, with no big banner pushing it down */ DOM.page.innerHTML = PAGES[STATE.page]();
} // SAFETY RULE: no access means show Live program
function drawAll() {
  drawSidebar();
  drawNav();
  drawBcast();
  drawTop();
  drawBanner();
  drawPage();
}

/* ============ ACTIONS: what happens when someone clicks, types or presses a key ============ */
// FLOATING Q&A: built once so what someone is typing survives page changes.
function drawQA() {
  DOM.qaFloat.innerHTML = `<button class="qa-open" id="qaOpen" data-action="qa-open" aria-label="Open Mini Q&amp;A" aria-expanded="false" aria-controls="qaBody">${svg("spark", 26)}</button>
    <section class="qa-body" id="qaBody" aria-label="Mini Q&amp;A"><div class="qa-h"><h2 class="sec u-m-0">${svg("spark", 20)}<span>Mini Q&amp;A</span></h2>
    <div class="row u-nowrap u-gap-6"><span class="mono" id="qCount">${STATE.questions.length} questions</span><button class="qa-x" data-action="qa-close" aria-label="Close Mini Q&amp;A">${svg("x", 18)}</button></div></div>
    <ul class="qa" id="qaList">${qaList()}</ul>
    <form id="qaForm" novalidate><div class="two"><input name="name" placeholder="Your name" aria-label="Your name">
    <input name="team" placeholder="Team name" aria-label="Team name"></div>
    <div class="send"><input name="text" placeholder="Ask the speaker a question..." aria-label="Your question">
    <button aria-label="Send question">${svg("send", 18)}</button></div><p class="err" id="qaErr" role="alert"></p></form></section>`;
}
function setQA(open) {
  STATE.qaOpen = open;
  DOM.qaFloat.classList.toggle(CLS.open, open);
  DOM.qaOpen.setAttribute("aria-expanded", open);
  if (open) requestAnimationFrame(() => DOM.qaClose.focus());
  else DOM.qaOpen.focus();
}
// "Nov 10 - Nov 12, 2026", or just "Nov 10, 2026" when it starts and ends on the same day.
function dateRange(a, b) {
  const md = { month: "short", day: "numeric" },
    f = (d, o) => d.toLocaleDateString("en-US", o);
  return a.toDateString() === b.toDateString()
    ? f(a, { ...md, year: "numeric" })
    : `${f(a, md)} - ${f(b, { ...md, year: "numeric" })}`;
}
function handleEvent(f) {
  const name = f.get("name").trim(),
    short = f.get("short").trim() || name,
    tag = f.get("tag").trim(),
    place = f.get("place").trim(),
    image = f.get("image").trim(),
    summary = f.get("summary").trim(),
    err = DOM.evErr;
  if (!name || !f.get("start") || !f.get("due")) {
    err.textContent = "Please add an event name, a start time and a code freeze time.";
    return;
  }
  const start = new Date(f.get("start")),
    due = new Date(f.get("due"));
  if (due <= start) {
    err.textContent = "The code freeze must be after the event starts.";
    return;
  }
  if (due <= Date.now()) {
    err.textContent = "The code freeze must be in the future.";
    return;
  }
  if (image && !/^https?:\/\//i.test(image)) {
    err.textContent = "The banner link must start with https://";
    return;
  }
  const e = {
    id: "ev-" + Date.now().toString(36),
    custom: true,
    name,
    short,
    date: dateRange(start, due),
    tag: tag || "Upcoming event",
    place: place || "Location to be announced",
    open: true,
    startAt: start.toISOString(),
    dueAt: due.toISOString(),
    image: image || banner(),
    summary,
    tracks: f.get("tracks").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
  };
  STATE.events.push(e);
  save();
  STATE.evNote = `${short} is published for ${e.date}. It is now in the event switcher in the sidebar.`;
  drawAll();
}
function handleKey(f) {
  const err = DOM.keyErr,
    title = f.get("title").trim(),
    type = f.get("type"),
    start = new Date(f.get("start")).getTime(),
    end = new Date(f.get("end")).getTime();
  if (!title) return void (err.textContent = "Please give the keynote a title.");
  if (!TYPES.slice(1).includes(type)) return void (err.textContent = "Please choose a stage.");
  if (isNaN(start) || isNaN(end)) return void (err.textContent = "Please set a start and an end time.");
  if (end <= start) return void (err.textContent = "The end time must be after the start time.");
  const speaker = f.get("speaker").trim(),
    org = f.get("org").trim(),
    o = {
      title,
      type,
      topics: f.getAll("topics"),
      start,
      end,
      about: f.get("about").trim(),
      who: speaker && org ? speaker + ", " + org : speaker || org,
      badge: f.get("badge") || "auto",
      rsvp: f.get("rsvp") === "on",
    };
  if (STATE.editKey) {
    const id = STATE.editKey;
    if (DEFAULT_SESSIONS.some((d) => d.id === id)) STATE.keynotes.mod[id] = o;
    else STATE.keynotes.add = STATE.keynotes.add.map((x) => (x.id === id ? { ...x, ...o } : x));
  } else STATE.keynotes.add.push({ id: Date.now(), ev: STATE.eventId, custom: true, ...o });
  saveKN();
  STATE.keyNote = `\u201C${title}\u201D ${STATE.editKey ? "updated" : "published"}.` + (end <= Date.now() ? " Its end time has already passed, so it will not show in the program." : " It is now in Live program & keynotes.");
  STATE.editKey = null;
  STATE.delArm = null;
  drawPage();
}
function go(id) {
  STATE.page = id;
  STATE.editKey = null;
  STATE.delArm = null;
  STATE.keyNote = "";
  STATE.notice = "";
  STATE.evNote = "";
  drawNav();
  drawTop();
  drawPage();
}
/* ============ INIT: the only place listeners and timers are attached ============ */
function init() {
  DOM.root.dataset.theme = STATE.theme;

  // banner scroll effect
  DOM.window.addEventListener("scroll", () => { if (!STATE.bnRaf) STATE.bnRaf = requestAnimationFrame(bannerScroll); }, { passive: true });
  DOM.window.addEventListener("resize", bannerMetrics);
  if (DOM.window.ResizeObserver) new ResizeObserver(bannerMetrics).observe(DOM.banner);

  // countdown clock
  setInterval(tick, CONFIG.TICK_MS);

  // delegated listeners: one per event type, routed by data-action / data-change / form id
  DOM.document.addEventListener("click", (x) => {
    const b = x.target.closest("[data-action]");
    if (!b) return;
    const a = b.dataset.action,
      v = b.dataset.v;
    if (a === "nav") go(v);
    else if (a === "topic") {
      STATE.topic = STATE.topic === v ? "" : v;
      drawPage();
    } else if (a === "key-edit") {
      STATE.editKey = +v;
      STATE.delArm = null;
      STATE.keyNote = "";
      drawPage();
      DOM.keyForm.scrollIntoView({ block: "center" });
    } else if (a === "key-cancel") {
      STATE.editKey = null;
      drawPage();
    } else if (a === "key-del") {
      if (STATE.delArm !== +v) {
        STATE.delArm = +v;
        drawPage();
      } else {
        const id = +v;
        if (DEFAULT_SESSIONS.some((d) => d.id === id)) {
          if (!STATE.keynotes.del.includes(id)) STATE.keynotes.del.push(id);
        } else STATE.keynotes.add = STATE.keynotes.add.filter((x) => x.id !== id);
        saveKN();
        if (STATE.editKey === id) STATE.editKey = null;
        STATE.delArm = null;
        STATE.keyNote = "Keynote deleted.";
        drawPage();
      }
    }
    else if (a === "rm-event") {
      STATE.events = STATE.events.filter((x) => !(x.id === v && x.custom));
      if (!STATE.events.some((x) => x.id === STATE.eventId)) STATE.eventId = STATE.events[0].id;
      save();
      drawAll();
    } else if (a === "qa-open") setQA(true);
    else if (a === "qa-close") setQA(false);
    else if (a === "pin") {
      STATE.pinned = !STATE.pinned;
      drawSidebar();
    } else if (a === "bcast-x") {
      STATE.bcastOff = true;
      DOM.bcast.classList.add(CLS.hidden);
    } else if (a === "filter") {
      STATE.filter = v;
      drawPage();
    } else if (a === "reserve") {
      if (!STATE.loggedIn)
        STATE.notice = "Please log in or register first (use \u201CLog in & registration\u201D in the menu).";
      else {
        STATE.notice = "";
        STATE.reserved = STATE.reserved.includes(+v) ? STATE.reserved.filter((i) => i !== +v) : [...STATE.reserved, +v];
      }
      drawPage();
    } else if (a === "vote") {
      const q = STATE.questions.find((i) => i.id === +v);
      if (q && !STATE.voted.includes(q.id)) {
        q.votes++;
        STATE.voted.push(q.id);
        DOM.qaList.innerHTML = qaList();
      }
    } else if (a === "book") {
      STATE.booked = STATE.booked.includes(v) ? STATE.booked.filter((i) => i !== v) : [...STATE.booked, v];
      drawPage();
    } else if (a === "mode") {
      STATE.authMode = v;
      drawPage();
    } else if (a === "auth-toggle") {
      if (STATE.loggedIn) {
        signOut();
        drawAll();
      } else go("auth");
    } else if (a === "theme") {
      STATE.theme = STATE.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = STATE.theme;
    } else if (a === "note") {
      update({ note: DOM.noteTxt.value.trim() });
      STATE.bcastOff = false;
      STATE.notice = "Message updated.";
      drawBcast();
      tick();
      drawPage();
    } else if (a === "demo") {
      DOM.authEmail.value = v;
      DOM.authPassword.value = CONFIG.DEMO_PASSWORD;
    } // fills the demo login
    else if (a === "banner") {
      const u = DOM.imgUrl.value.trim();
      if (u) {
        update({ image: u });
        STATE.notice = "Banner updated.";
        drawBanner();
        drawPage();
      }
    }
  });
  DOM.document.addEventListener("change", (x) => {
    const t = x.target,
      c = t.dataset.change;
    if (c === "event") {
      STATE.eventId = t.value;
      STATE.topic = "";
      STATE.editKey = null;
      STATE.keyNote = "";
      STATE.notice = "";
      STATE.evNote = "";
      drawAll();
    } else if (c === "due" && t.value) {
      update({ dueAt: new Date(t.value).toISOString() });
      drawTop();
    } else if (c === "open") {
      update({ open: t.checked });
      drawTop();
    } else if (t.name === "role" && t.form && t.form.id === "authForm")
      DOM.codeBox.classList.toggle(CLS.hidden, t.value !== "superadmin"); // show the code box only for Super Admin
  });
  DOM.document.addEventListener("input", (x) => {
    const n = x.target.dataset.score;
    if (n) STATE.scores[n] = Math.min(10, Math.max(0, Number(x.target.value)));
  }); // judge scores stay between 0 and 10
  DOM.document.addEventListener("keydown", (x) => {
    if (x.key === "Escape" && STATE.qaOpen) return setQA(false);
    // keyboard shortcut: press 1, 2, 3... to open that menu item
    if (/INPUT|TEXTAREA|SELECT/.test(x.target.tagName) || x.ctrlKey || x.metaKey || x.altKey) return;
    const m = navItems()[Number(x.key) - 1];
    if (m) go(m.id);
  });
  DOM.document.addEventListener("submit", (x) => {
    x.preventDefault();
    const f = new FormData(x.target);
    if (x.target.id === "qaForm") {
      // all three boxes are needed
      const name = f.get("name").trim(),
        team = f.get("team").trim(),
        text = f.get("text").trim();
      if (!name || !team || !text) {
        DOM.qaErr.textContent = "Please fill in your name, your team and your question.";
        return;
      }
      STATE.questions.push({
        id: Date.now(),
        name,
        team,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        pinned: false,
        votes: 0,
      });
      DOM.qaList.innerHTML = qaList();
      DOM.qCount.textContent = STATE.questions.length + " questions";
      DOM.qaList.scrollTop = DOM.qaList.scrollHeight;
      x.target.reset();
      DOM.qaErr.textContent = "";
    } else if (x.target.id === "authForm") handleAuth(f);
    else if (x.target.id === "eventForm") handleEvent(f);
    else if (x.target.id === "keyForm") handleKey(f);
  });

  // first paint
  drawQA();
  drawAll();
  initAccounts().then(drawAll).catch(drawAll); // load accounts, restore a saved login, then redraw
}
init();