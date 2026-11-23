"use strict";
/* This file controls what the page does.
   1. Settings
   2. Style state names
   3. Page data
   4. Current app state
   5. HTML parts
   6. Small helper functions
   7. Saving data and demo accounts
   8. Functions that draw the page
   9. Moving effects
   10. Button and form actions
   11. Start the app

   This file should not contain colours or sizes.
   It changes looks by using classes or CSS variables. */


/* ==========================================================================
   1. CONFIG
   ========================================================================== */
const CONFIG = {
  // Edited by NkosinathiM-ship: keep the logo path relative to the assets folder.
  logoSrc: "assets/logo-white.png",
  storage: {
    events: "portal-events-v3", // Super Admin edits to events survive a refresh
    keynotes: "portal-keynotes-v1", // added / edited / deleted keynotes
    accounts: "portal-accounts-v1",
    session: "portal-session-v1",
  },
  demoPassword: "demo1234",
  // This is only a demo code for making a Super Admin account.
  adminCode: "LIMPOPO-ADMIN",
  tickMs: 1000,
  freeze: {
    warnSeconds: 10, // crimson warning glow during the last N seconds
    glitchMs: 1000, // length of the glitch burst at zero
    holdMs: 3500, // from zero until the countdown row dissolves away
    dissolveMs: 1100,
    dissolveCell: 10,
    scrambleMs: 700, // the caption scrambles into FROZEN // LOCKED
    badgeSwapMs: 260, // swap the badge face while it is edge-on
    badgeFlipMs: 560,
  },
  sessionExit: {
    timeLeadMs: 350, // the time slot starts dissolving this long before the card
    timeDissolveMs: 800,
    timeCell: 6,
    cardDissolveMs: 1100,
    cardCell: 10,
  },
  collapseMs: 540, // keep in step with --dur-collapse in css/live-program.css
  pixelTokens: ["--pixel-1", "--pixel-2", "--pixel-3", "--pixel-4", "--pixel-5", "--pixel-6"],
  scrambleChars: "#%&01<>_=+*",
  qaMinutesLabel: "questions",
};


/* ==========================================================================
   2. CLASSES: the state names defined in css/live-program.css
   ========================================================================== */
const CLS = {
  hidden: "is-hidden",
  active: "is-active",
  open: "is-open",
  done: "is-done",
  pinned: "is-pinned",
  warning: "is-warning",
  frozen: "is-frozen",
  glitching: "is-glitching",
  flipping: "is-flipping",
  dissolving: "is-dissolving",
  collapsing: "is-collapsing",
  collapsed: "is-collapsed",
  loading: "is-loading",
  error: "has-error",
};


/* ==========================================================================
   3. DATA
   ========================================================================== */
// Small drawings used as menu icons.
const ICONS = {
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
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  thumb:
    '<path d="M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.5l-1.4 7a2 2 0 0 1-2 1.5H7V10l4-8a2.4 2.4 0 0 1 4 3.9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mic:
    '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/>',
  event:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  edit:
    '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  trash:
    '<path d="M3 6h18M8 6V3h8v3M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  alert:
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
};

const ROLES = {
  guest: "Guest",
  attendee: "Attendee",
  mentor: "Mentor",
  team: "Team",
  judge: "Judge",
  superadmin: "Super Admin",
};
// The menu items.
const MENU = [
  { id: "live", label: "Live program & keynotes", hint: "Talks, workshops and questions" },
  { id: "mentors", label: "Mentor 1-on-1 hub", hint: "Get help from an expert" },
  { id: "teams", label: "Team directory", hint: "See all teams" },
  { id: "notices", label: "Notice board", hint: "Announcements for teams" },
  { id: "judging", label: "Judging portal", hint: "Score the projects" },
  { id: "admin", label: "Super Admin console", hint: "Banner, countdown, controls" },
  { id: "auth", label: "Log in & registration", hint: "Sign in or create an account" },
];
// TODO: Connect these navigation entries when their team pages are ready.
const PLACEHOLDER_NAV_IDS = new Set(["mentors", "teams", "notices", "judging"]);
const SIGNUP_ROLES = ["attendee", "mentor", "team", "judge", "superadmin"]; // roles a person can pick when registering
// This shows which menus each account role can open.
const ALLOWED = {
  guest: ["live", "auth"],
  attendee: ["live", "auth"],
  mentor: ["live", "mentors", "auth"],
  team: ["live", "mentors", "teams", "notices", "auth"],
  judge: ["live", "judging", "auth"],
  superadmin: ["live", "mentors", "teams", "notices", "judging", "admin", "auth"],
};
const TYPES = ["All", "Main Stage", "Workshop Lab", "Mentor Pit", "Lightning Talks"];

// A sample banner picture until a real photo is added.
const placeholderBanner = () =>
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e2028"/><stop offset="1" stop-color="#0d0e12"/></linearGradient></defs><rect width="1600" height="420" fill="url(#s)"/><g fill="#fff" fill-opacity=".07"><ellipse cx="620" cy="40" rx="110" ry="34"/><ellipse cx="540" cy="52" rx="70" ry="26"/><ellipse cx="1330" cy="50" rx="80" ry="26"/><ellipse cx="300" cy="70" rx="60" ry="20"/></g><path d="M0 420V330C200 250 380 250 560 330S900 300 1020 250 1300 300 1600 330V420Z" fill="#2a151b"/><path d="M0 420V360C150 280 330 290 470 350S720 380 820 340 1200 250 1400 310 1560 340 1600 350V420Z" fill="#121318"/></svg>',
  );
const inHours = (h) => new Date(Date.now() + h * 3600000).toISOString();
// The admin can change the banner picture and countdown time.
const DEFAULT_EVENTS = [
  {
    id: "limpopo",
    name: "SYNAPSE 2026 // Limpopo Dev Hackathon",
    short: "Limpopo Dev Hackathon",
    date: "Nov 10-12, 2026",
    tag: "48-Hour Live Build & Pitch Championship",
    place: "Moscone Center West & Global Virtual Stream",
    open: true,
    dueAt: inHours(18),
    image: placeholderBanner(),
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
    image: placeholderBanner(),
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
    image: placeholderBanner(),
    summary: "A weekend sprint to build tools for a greener future.",
    tracks: ["Energy", "Water", "Farming"],
  },
];

// Sessions have a start and end time.
// A session says "Live now" while it is running and leaves the page after it ends.
// These demo times start relative to page load, so the first keynote ends after a few minutes.
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
// Demo accounts for trying the different roles.
const DEMO_ACCOUNTS = [
  { email: "attendee@demo.test", name: "Ayanda", role: "attendee" },
  { email: "mentor@demo.test", name: "Priya", role: "mentor" },
  { email: "team@demo.test", name: "Team NeuralPulse", role: "team" },
  { email: "judge@demo.test", name: "Kaito", role: "judge" },
  { email: "admin@demo.test", name: "Thandi", role: "superadmin" },
];


/* ==========================================================================
   4. STATE: everything that can change
   ========================================================================== */
const STATE = {
  events: loadEvents(),
  keynotes: loadKeynotes(), // { add: [], del: [], mod: {} }
  accounts: [],
  eventId: "limpopo",
  role: "guest",
  loggedIn: false,
  user: null,
  page: "live",
  theme: "dark",
  bcastOff: false,
  qaOpen: false,
  filter: "All", // stage tab
  topic: "", // topic pill
  editKey: null, // keynote being edited
  delArm: null, // keynote waiting for "Confirm delete"
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
  // Temporary values used while the page is open.
  sessionSignature: "", // Used to know when the session list changed.
  wasFrozen: null,
  freezeBusy: false,
  sessionsExiting: false,
  bannerRange: 1,
  bannerFrame: 0,
  bannerShrink: 0.2, // Read from CSS when the app starts.
  pixelPalette: [], // Colours used for the pixel effect.
};


/* ==========================================================================
   5. DOM: one registry for every hook in index.html
   ========================================================================== */
const byId = (id) => document.getElementById(id);
const DOM = {
  // Parts that stay in index.html.
  doc: document,
  win: window,
  root: document.documentElement,
  body: byId("body"),
  sidebar: byId("sidebar"),
  app: byId("app"),
  banner: byId("banner"),
  topNav: byId("topNav"),
  broadcast: byId("broadcast"),
  pageHeader: byId("pageHeader"),
  pageMain: byId("pageMain"),
  pageContent: byId("pageContent"),
  qaFloat: byId("qaFloat"),

  // Parts added again by the page drawing functions.
  get countdownRow() { return byId("countdownRow"); },
  get countdown() { return byId("countdown"); },
  get submissionBadge() { return byId("submissionBadge"); },
  get freezeCaption() { return byId("freezeCaption"); },
  get broadcastMessage() { return byId("broadcastMessage"); },
  get authForm() { return byId("authForm"); },
  get authError() { return byId("authError"); },
  get authCodeBox() { return byId("authCodeBox"); },
  get eventForm() { return byId("eventForm"); },
  get eventError() { return byId("eventError"); },
  get keyForm() { return byId("keyForm"); },
  get keyError() { return byId("keyError"); },
  get qaForm() { return byId("qaForm"); },
  get qaError() { return byId("qaError"); },
  get qaList() { return byId("qaList"); },
  get qaCount() { return byId("qaCount"); },
  get qaToggle() { return byId("qaToggle"); },
  get bannerImageInput() { return byId("bannerImageInput"); },
  get broadcastNoteInput() { return byId("broadcastNoteInput"); },

  // CSS class names used to find parts.
  query: {
    qaClose: () => document.querySelector(".qa__close"),
    sessionCard: (id) => document.querySelector(`.session[data-session-id="${id}"]`),
    sessionTime: (card) => card.querySelector(".session__time"),
    authField: (name) => document.querySelector(`#authForm [name="${name}"]`),
  },
};


/* ==========================================================================
   6. HELPERS
   ========================================================================== */
const currentEvent = () => STATE.events.find((e) => e.id === STATE.eventId);
const svg = (name, size = 22) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
// Stops text from being read as HTML code.
const esc = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const withClass = (condition, className) => (condition ? " " + className : "");
const readToken = (name) => getComputedStyle(DOM.root).getPropertyValue(name).trim();
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const show = (el, visible) => el && el.classList.toggle(CLS.hidden, !visible);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pad2 = (n) => String(n).padStart(2, "0");
const clock24 = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const clockShort = (ms) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const timeLabel = (s) => clockShort(s.start) + " - " + clockShort(s.end);
const toLocalInput = (ms) => new Date(ms - new Date(ms).getTimezoneOffset() * 60000).toISOString().slice(0, 16); // datetime-local wants local time
const fmtWhen = (ms) => new Date(ms).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const can = (role, id) => ALLOWED[role].includes(id);
// Edited by NkosinathiM-ship: build the menu from the signed-in role's permissions.
const visibleMenu = () => MENU.filter((m) => ALLOWED[STATE.role].includes(m.id));
const navItems = () => visibleMenu().filter((m) => m.id !== "auth");
function showError(form, target, message) {
  target.textContent = message;
  form.classList.toggle(CLS.error, Boolean(message));
}
// Shows a date range, or one date when the start and end are the same.
function dateRange(a, b) {
  const md = { month: "short", day: "numeric" },
    f = (d, o) => d.toLocaleDateString("en-US", o);
  return a.toDateString() === b.toDateString()
    ? f(a, { ...md, year: "numeric" })
    : `${f(a, md)} - ${f(b, { ...md, year: "numeric" })}`;
}


/* ==========================================================================
   7. STORAGE AND ACCOUNTS
   ========================================================================== */
function loadEvents() {
  try {
    const raw = localStorage.getItem(CONFIG.storage.events);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* storage blocked */
  }
  return DEFAULT_EVENTS;
}
function saveEvents() {
  try {
    localStorage.setItem(CONFIG.storage.events, JSON.stringify(STATE.events));
  } catch (e) {
    /* ignore */
  }
}
function loadKeynotes() {
  try {
    const r = JSON.parse(localStorage.getItem(CONFIG.storage.keynotes));
    if (r && typeof r === "object") return { add: r.add || [], del: r.del || [], mod: r.mod || {} };
  } catch (e) {
    /* storage blocked */
  }
  return { add: [], del: [], mod: {} };
}
function saveKeynotes() {
  try {
    localStorage.setItem(CONFIG.storage.keynotes, JSON.stringify(STATE.keynotes));
  } catch (e) {
    /* ignore */
  }
}
function updateEvent(patch) {
  Object.assign(currentEvent(), patch);
  saveEvents();
}

// Built-in sessions can be edited or deleted too: that is saved as "mod" (changes) and "del" (hidden ids).
const allSessions = () => [
  ...DEFAULT_SESSIONS.filter((s) => !STATE.keynotes.del.includes(s.id)).map((s) => ({ ...s, ...(STATE.keynotes.mod[s.id] || {}) })),
  ...STATE.keynotes.add,
];
// Sessions still to come or happening now, for the chosen event and topic pill.
const sessionsNow = () => {
  const now = Date.now(),
    topic = (STATE.topic || "").toLowerCase();
  return allSessions()
    .filter((s) => (!s.ev || s.ev === STATE.eventId) && s.end > now)
    .filter((s) => !topic || (s.topics || []).some((t) => t.toLowerCase() === topic))
    .map((s) => ({ ...s, live: s.badge === "off" ? false : s.badge === "live" ? true : s.start <= now }));
};
const sessionsSignature = () => sessionsNow().map((s) => s.id + (s.live ? "L" : "")).join();

/* ---- ACCOUNTS (DEMO): sign-up and login happen inside the browser ----
   A person's role comes from the account they registered with. It cannot be changed afterwards.
   LATER: replace this block with calls to a real backend. A real site must never keep passwords in the browser. */
// Turns a password into a scrambled fingerprint, so the plain password is never stored.
async function fingerprint(email, pass) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.toLowerCase() + ":" + pass));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const isDemoAccount = (a) => DEMO_ACCOUNTS.some((d) => d.email === a.email);
function saveAccounts() {
  try {
    localStorage.setItem(CONFIG.storage.accounts, JSON.stringify(STATE.accounts.filter((a) => !isDemoAccount(a))));
  } catch (e) {
    /* storage blocked */
  }
}
// Signing in fixes the role to the one on the account.
function signIn(user) {
  STATE.user = user;
  STATE.role = user.role;
  STATE.loggedIn = true;
  STATE.page = "live";
  try {
    localStorage.setItem(CONFIG.storage.session, user.email);
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
    localStorage.removeItem(CONFIG.storage.session);
  } catch (e) {
    /* ignore */
  }
}
async function initAccounts() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(CONFIG.storage.accounts)) || [];
  } catch (e) {
    /* ignore */
  }
  const demo = await Promise.all(
    DEMO_ACCOUNTS.map(async (d) => ({ ...d, key: await fingerprint(d.email, CONFIG.demoPassword) })),
  );
  STATE.accounts = [...demo, ...saved];
  try {
    const user = STATE.accounts.find((a) => a.email === localStorage.getItem(CONFIG.storage.session));
    if (user) signIn(user); // keep people signed in after a refresh
  } catch (e) {
    /* ignore */
  }
}
// Log in or register. The role always comes from the account, never from a choice made after signing in.
async function handleAuth(form) {
  const f = new FormData(form),
    email = f.get("email").trim().toLowerCase(),
    pass = f.get("password"),
    name = (f.get("name") || "").trim(),
    err = DOM.authError,
    register = STATE.authMode === "register";
  if (!email || !pass || (register && !name)) return showError(form, err, "Please fill in every box.");
  if (register && pass.length < 6) return showError(form, err, "Please use at least 6 characters for your password.");
  form.classList.add(CLS.loading);
  try {
    const key = await fingerprint(email, pass),
      found = STATE.accounts.find((a) => a.email === email);
    if (register) {
      if (found) return showError(form, err, "That email already has an account. Please log in instead.");
      const role = SIGNUP_ROLES.includes(f.get("role")) ? f.get("role") : "attendee";
      if (role === "superadmin" && (f.get("code") || "").trim() !== CONFIG.adminCode)
        return showError(form, err, "That Super Admin access code is not right.");
      const user = { email, name, role, key };
      STATE.accounts.push(user);
      saveAccounts();
      signIn(user);
    } else {
      if (!found || found.key !== key) return showError(form, err, "That email or password is not right. Please try again.");
      signIn(found);
    }
    drawAll();
  } finally {
    form.classList.remove(CLS.loading);
  }
}


/* ==========================================================================
   8. RENDERERS: each function fills one part of the screen
   ========================================================================== */
// Drawing rule: keep data-action and data-change names the same as the names used in onClick and onChange.
function drawSidebar() {
  const name = STATE.loggedIn ? STATE.user.name : "Guest";
  DOM.sidebar.innerHTML = `<div class="sidebar__logo"><img class="sidebar__logo-img" src="${CONFIG.logoSrc}" alt="Limpopo Dev Ecosystem"></div>
    <div class="sidebar__user"><span class="sidebar__avatar" aria-hidden="true">${esc(name.charAt(0).toUpperCase())}</span><span class="sidebar__text"><b class="sidebar__name">${esc(name)}</b><small class="sidebar__role">${ROLES[STATE.role]}</small></span></div>
    <div class="sidebar__main"><div class="sidebar__event">${svg("layers", 20)}<div class="sidebar__text sidebar__text--grow"><span class="sidebar__event-label text-label">Event</span><select class="sidebar__select" data-change="event" aria-label="Choose an event">${STATE.events.map((x) => `<option value="${x.id}"${x.id === STATE.eventId ? " selected" : ""}>${esc(x.short)}</option>`).join("")}</select></div></div></div>
    <div class="sidebar__footer">
      <button class="sidebar__item" data-action="theme" aria-label="Switch between light and dark mode"><span class="theme-icon"><span class="theme-icon__glyph theme-icon__glyph--sun">${svg("sun", 20)}</span><span class="theme-icon__glyph theme-icon__glyph--moon">${svg("moon", 20)}</span></span><span class="sidebar__text"><span class="sidebar__switch-text--to-light">Switch to light</span><span class="sidebar__switch-text--to-dark">Switch to dark</span></span></button>
      <button class="sidebar__item" data-action="auth-toggle">${svg(STATE.loggedIn ? "out" : "auth", 20)}<span class="sidebar__text">${STATE.loggedIn ? "Log out" : "Log in / Register"}</span></button>
    </div>`;
}

// Show the items allowed for this role; placeholders remain disabled until linked.
function drawNav() {
  DOM.topNav.innerHTML = `<ul class="top-nav__list">${navItems()
    .map(
      (m) => {
        const placeholder = PLACEHOLDER_NAV_IDS.has(m.id);
        const canOpen = !placeholder && can(STATE.role, m.id);
        const title = placeholder ? "TODO: connect this page later" : canOpen ? m.hint : "Available to Super Admins only";
        return `<li class="top-nav__item"><button class="top-nav__link${withClass(STATE.page === m.id, CLS.active)}${withClass(!canOpen, "is-disabled")}" data-action="nav" data-value="${m.id}" title="${title}"${canOpen ? "" : ' disabled aria-disabled="true"'}${STATE.page === m.id ? ' aria-current="page"' : ""}><span class="top-nav__icon">${svg(m.id, 18)}</span><span class="top-nav__label">${m.label}</span></button></li>`;
      },
    )
    .join("")}</ul>`;
}

function drawTop() {
  const e = currentEvent(),
    due = new Date(e.dueAt);
  DOM.pageHeader.innerHTML = `<div class="page-header__toolbar"><h2 class="page-header__title">${MENU.find((m) => m.id === STATE.page).label}</h2>
    <div class="cluster"><span class="pill${withClass(e.open, "pill--ok")}" id="submissionBadge" aria-live="polite">${svg(e.open ? "unlock" : "lock", 12)} ${e.open ? "Submissions open" : "Submissions closed"}</span></div></div>
    <div class="countdown" id="countdownRow"><div class="countdown__units" id="countdown" role="timer" aria-label="Time left until code freeze"></div>
    <div class="countdown__target"><span class="countdown__target-label">Time</span><span class="countdown__target-time">${clock24(due)}</span><span class="countdown__target-label countdown__caption" id="freezeCaption">Code freeze</span></div></div>`;
  STATE.wasFrozen = null; // a freshly drawn page never plays the lockdown animation by itself
  tick();
}

function drawBanner() {
  const e = currentEvent(),
    custom = !e.image.startsWith("data:"), // the Super Admin can swap in their own photo
    changeButton = STATE.role === "superadmin" ? `<button class="btn btn--primary banner__action" data-action="nav" data-value="admin">Change program banner</button>` : "";
  DOM.banner.className = "banner";
  DOM.banner.style.setProperty(
    "--banner-image",
    custom ? `var(--banner-overlay), url("${e.image.replace(/"/g, "%22")}")` : `url("${e.image}")`,
  );
  DOM.banner.innerHTML = `<div class="banner__inner"><div class="banner__top"><span class="banner__chip text-mono">${esc(e.place)}</span>${changeButton}</div>
    <h1 class="banner__title">${esc(e.name)}</h1>
    ${e.summary ? `<p class="banner__summary">${esc(e.summary)}</p>` : ""}
    <div class="cluster"><span class="pill">${esc(e.date)}</span><span class="text-mono">${esc(e.tag)}</span></div></div>`;
  bannerMetrics();
}

// BROADCAST BAR: shows how long is left. Can be dismissed with the X.
function drawBroadcast() {
  show(DOM.broadcast, !STATE.bcastOff);
  DOM.broadcast.innerHTML = `<i class="broadcast__dot"></i><b>Broadcast:</b>${svg("alert", 16)}<span class="broadcast__message" id="broadcastMessage"></span><button class="broadcast__close" data-action="broadcast-close" aria-label="Close this message">${svg("x", 16)}</button>`;
}

// Create one session card.
function sessionCard(s) {
  const reserved = STATE.reserved.includes(s.id);
  return `<article class="session" data-session-id="${s.id}"><h2 class="session__title">${esc(s.title)}</h2>
    <p class="session__time"><span class="session__time-text">${esc(s.type)} \u00B7 ${timeLabel(s)} ${s.live ? '<span class="live-pill text-mono">Live now</span>' : ""}</span></p>
    <p class="session__about u-text-soft">${esc(s.about || "")}</p>${s.who ? `<p class="session__speaker text-mono">${esc(s.who).replace(", ", " \u00B7 ")}</p>` : ""}
    ${s.rsvp === false ? "" : `<button class="rsvp-button${withClass(reserved, CLS.done)}" aria-pressed="${reserved}" data-action="reserve" data-value="${s.id}">${svg("cal", 16)} ${reserved ? "Seat saved" : "Save my seat"}</button>`}</article>`;
}
// Show pinned questions first, then show questions with the most votes.
function qaListHtml() {
  return [...STATE.questions]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.votes - a.votes)
    .map(
      (q) =>
        `<li class="qa__item"><div class="qa__who"><span><b class="qa__author">${esc(q.name)}</b> (Team ${esc(q.team)})</span>
      <span>${q.time}</span></div><p class="qa__text">${esc(q.text)}</p>
    <div class="qa__footer"><button class="qa__vote" data-action="vote" data-value="${q.id}"${STATE.voted.includes(q.id) ? " disabled" : ""} aria-label="Vote for this question. Votes: ${q.votes}">${svg("thumb", 14)} ${q.votes}</button>${q.pinned ? `<span class="qa__pinned text-mono">${svg("pin", 12)} Pinned</span>` : ""}</div>
      </li>`,
    )
    .join("");
}
const liveListHtml = () => {
  const list = sessionsNow().filter((s) => STATE.filter === "All" || s.type === STATE.filter);
  return list.length ? list.map(sessionCard).join("") : '<p class="empty-state u-text-soft">No sessions left in this view.</p>';
};

// The Super Admin form for creating an event.
function eventPanelHtml() {
  const mine = STATE.events.filter((x) => x.custom);
  return `<section class="panel panel--narrow admin-grid__item admin-grid__item--events"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("event", 21)}</span><h3>Create and publish the next event</h3></div>
    <p class="u-text-soft">Fill this in and publish. The event is added to the event switcher in the sidebar straight away.</p>
    <form class="form form--event" id="eventForm" novalidate>
      <label class="field">Event name<input class="input" name="name" placeholder="e.g. Pretoria Robotics Challenge"></label>
      <label class="field">Short name (shown in menus)<input class="input" name="short" placeholder="e.g. Robotics Challenge"></label>
      <div class="form__split"><label class="field">Starts<input class="input" type="datetime-local" name="start"></label><label class="field">Code freeze<input class="input" type="datetime-local" name="due"></label></div>
      <label class="field">Description<textarea class="input" name="summary" rows="3" placeholder="A sentence or two about the event"></textarea></label>
      <label class="field">Tagline<input class="input" name="tag" placeholder="e.g. 48-Hour Build Sprint"></label>
      <label class="field">Location<input class="input" name="place" placeholder="e.g. Sandton Convention Centre"></label>
      <label class="field">Tracks (separate with commas)<input class="input" name="tracks" placeholder="e.g. Robotics, AI, IoT"></label>
      <label class="field">Banner image URL (optional)<input class="input" name="image" placeholder="https://example.com/banner.jpg"></label>
      <p class="form__error" id="eventError" role="alert"></p>
      <button class="btn btn--primary btn--center">${svg("plus", 17)} Publish event</button>
    </form>
    ${STATE.evNote ? `<p class="notice" role="status">${esc(STATE.evNote)}</p>` : ""}
    ${mine.length ? `<div><p class="text-label u-text-soft">Events you added</p>${mine.map((x) => `<div class="admin-list__item admin-list__item--event"><span><b>${esc(x.short)}</b> <span class="u-text-soft">${esc(x.date)}</span></span><button class="btn admin-action" type="button" data-action="remove-event" data-value="${x.id}">${svg("trash", 16)} Remove</button></div>`).join("")}</div>` : ""}</section>`;
}

// The Super Admin can add, edit, or delete keynotes.
function keynotePanelHtml() {
  const e = currentEvent(),
    now = Date.now(),
    list = allSessions().filter((x) => !x.ev || x.ev === e.id).sort((a, b) => a.start - b.start),
    editing = STATE.editKey ? list.find((x) => x.id === STATE.editKey) : null,
    t0 = Math.ceil(now / 60000) * 60000,
    v = editing || { type: TYPES[1], topics: [], start: t0, end: t0 + 45 * 60000, title: "", about: "", who: "", badge: "auto", rsvp: true },
    parts = String(v.who || "").split(", "),
    speaker = parts[0] || "",
    org = parts.slice(1).join(", "),
    badge = v.badge || "auto",
    statusOf = (x) =>
      x.end <= now ? "Ended" : (x.badge === "off" ? false : x.badge === "live" ? true : x.start <= now) ? "Live now" : "Upcoming";
  return `<section class="panel panel--narrow admin-grid__item admin-grid__item--keynotes"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("mic", 21)}</span><h3>${editing ? "Edit keynote" : "Add keynote"}</h3></div>
    <p class="u-text-soft">${editing ? "Change the details and save. The program updates straight away." : "Fill this in and publish. It appears in Live program & keynotes for"} ${editing ? "" : `<strong class="u-text-strong">${esc(e.short)}</strong>.`}</p>
    <form class="form" id="keyForm" novalidate>
      <label class="field">Title<input class="input" name="title" placeholder="e.g. Keynote: Autonomous Agent Swarms" value="${esc(v.title)}"></label>
      <div class="form__split"><label class="field">Stage / Track<select class="input" name="type">${TYPES.slice(1).map((t) => `<option${t === v.type ? " selected" : ""}>${t}</option>`).join("")}</select></label>
      <label class="field">Status badge<select class="input" name="badge"><option value="auto"${badge === "auto" ? " selected" : ""}>Automatic</option><option value="live"${badge === "live" ? " selected" : ""}>Always show LIVE NOW</option><option value="off"${badge === "off" ? " selected" : ""}>No badge</option></select></label></div>
      <div><p class="text-label u-text-soft u-mb-6">Topics (the pills above the program)</p>
      <div class="cluster">${e.tracks.length ? e.tracks.map((t) => `<label class="field field--check"><input class="input input--check" type="checkbox" name="topics" value="${esc(t)}"${(v.topics || []).some((x) => x.toLowerCase() === t.toLowerCase()) ? " checked" : ""}> ${esc(t)}</label>`).join("") : '<span class="u-text-soft">This event has no topics yet.</span>'}</div></div>
      <div class="form__split"><label class="field">Starts<input class="input" type="datetime-local" name="start" value="${toLocalInput(v.start)}"></label><label class="field">Ends<input class="input" type="datetime-local" name="end" value="${toLocalInput(v.end)}"></label></div>
      <label class="field">Description / abstract<textarea class="input" name="about" rows="3" placeholder="A sentence or two about the talk">${esc(v.about || "")}</textarea></label>
      <div class="form__split"><label class="field">Speaker name<input class="input" name="speaker" placeholder="e.g. Dr. Aris Thorne" value="${esc(speaker)}"></label><label class="field">Organization<input class="input" name="org" placeholder="e.g. Google DeepMind" value="${esc(org)}"></label></div>
      <label class="field field--check"><input class="input input--check" type="checkbox" name="rsvp"${v.rsvp === false ? "" : " checked"}> Show the \u201CSave my seat\u201D button</label>
      <p class="form__error" id="keyError" role="alert"></p>
      <div class="cluster"><button class="btn btn--primary btn--center">${svg(editing ? "edit" : "plus", 17)} ${editing ? "Save changes" : "Publish keynote"}</button>${editing ? '<button class="btn" type="button" data-action="key-cancel">' + svg("x", 16) + " Cancel</button>" : ""}</div>
    </form>
    ${STATE.keyNote ? `<p class="notice" role="status">${esc(STATE.keyNote)}</p>` : ""}
    ${list.length ? `<div><p class="text-label u-text-soft">Keynotes in this event</p>${list.map((x) => `<div class="admin-list__item"><span class="admin-list__info"><b>${esc(x.title)}</b><br><span class="u-text-soft">${esc(x.type)} \u00B7 ${fmtWhen(x.start)} - ${clockShort(x.end)} \u00B7 ${statusOf(x)}</span></span>
      <span class="admin-list__actions"><button class="btn admin-action" type="button" data-action="key-edit" data-value="${x.id}">${svg("edit", 16)} Edit</button><button class="btn admin-action admin-action--danger" type="button" data-action="key-delete" data-value="${x.id}">${svg("trash", 16)} ${STATE.delArm === x.id ? "Confirm delete" : "Delete"}</button></span></div>`).join("")}</div>` : '<p class="u-text-soft">No keynotes yet for this event.</p>'}</section>`;
}

const cardGrid = (cards, spaced) => `<div class="card-grid${withClass(spaced, "card-grid--spaced")}">${cards}</div>`;

// This list chooses which page HTML to show.
const PAGES = {
  live: () => `<div class="live-program"><section>
    <div class="cluster cluster--center" role="group" aria-label="Filter sessions by topic">${currentEvent().tracks.map((t) => `<button type="button" class="pill pill--button${withClass(STATE.topic === t, CLS.active)}" aria-pressed="${STATE.topic === t}" data-action="topic" data-value="${esc(t)}">${esc(t)}</button>`).join("")}</div>
    <div class="tabs tabs--center" role="group" aria-label="Filter sessions by type">${TYPES.map((t) => `<button class="tab${withClass(STATE.filter === t, CLS.active)}" aria-pressed="${STATE.filter === t}" data-action="filter" data-value="${t}">${t}</button>`).join("")}</div>
    ${STATE.notice ? `<p class="notice" role="status">${STATE.notice}</p>` : ""}${liveListHtml()}</section></div>`,

  mentors: () =>
    `<p class="u-text-soft u-mt-20">Book 20 minutes with an expert.</p>` +
    cardGrid(
      MENTORS.map(([n, skill]) => {
        const booked = STATE.booked.includes(n);
        return `<article class="info-card"><h3 class="info-card__title">${n}</h3><p class="info-card__text u-text-soft">${skill}</p>
      <button class="rsvp-button${withClass(booked, CLS.done)}" data-action="book" data-value="${n}">${svg("cal", 16)} ${booked ? "Booked. Tap to cancel" : "Book 20 minutes"}</button>
      </article>`;
      }).join(""),
    ),

  teams: () =>
    cardGrid(
      TEAMS.map(([n, m]) => `<article class="info-card"><h3 class="info-card__title">${n}</h3><p class="info-card__text u-text-soft">${m} members</p></article>`).join(""),
      true,
    ),

  notices: () =>
    cardGrid(
      NOTICES.map(([t, b]) => `<article class="info-card"><h3 class="info-card__title">${t}</h3><p class="info-card__text u-text-soft">${b}</p></article>`).join(""),
      true,
    ),

  judging: () =>
    `<p class="u-text-soft u-mt-20">Give each team a score from 0 to 10.</p>` +
    cardGrid(
      TEAMS.map(
        ([n]) => `<article class="info-card"><h3 class="info-card__title">${n}</h3><label class="score-row">Score<input class="input score-row__input" type="number" min="0" max="10" data-score="${n}" value="${STATE.scores[n] ?? ""}"></label></article>`,
      ).join(""),
    ),

  admin: () => {
    const e = currentEvent();
    const programSessions = allSessions().filter((session) => !session.ev || session.ev === e.id).length;
    const managedEvents = STATE.events.length;
    const submissionState = e.open ? "Open" : "Closed";
    return `<section class="admin-hero" aria-label="Super Admin Console overview">
      <div class="admin-hero__copy">
        <span class="admin-hero__eyebrow">EVENT OPERATIONS</span>
        <h1>Super Admin Console</h1>
        <p>Manage your event, schedule and attendee updates from one place.</p>
      </div>
      <aside class="admin-hero__event" aria-label="Managing event">
        <span class="admin-hero__label">MANAGING EVENT</span>
        <strong>${esc(e.short)}</strong>
        <span class="admin-hero__status${withClass(e.open, "is-open")}">${svg(e.open ? "unlock" : "lock", 12)} SUBMISSIONS ${submissionState.toUpperCase()}</span>
      </aside>
      <div class="admin-hero__metrics">
        <article class="admin-metric">
          <span class="admin-metric__label">PROGRAM SESSIONS</span>
          <strong>${programSessions}</strong>
          <span>Scheduled for this event</span>
        </article>
        <article class="admin-metric">
          <span class="admin-metric__label">MANAGED EVENTS</span>
          <strong>${managedEvents}</strong>
          <span>Available in the event switcher</span>
        </article>
        <article class="admin-metric">
          <span class="admin-metric__label">SUBMISSION STATUS</span>
          <strong class="${e.open ? "u-text-ok" : "u-text-accent"}">${submissionState}</strong>
          <span>For ${esc(e.short)}</span>
        </article>
      </div>
    </section>
    <div class="admin-grid"><section class="panel panel--narrow admin-grid__item admin-grid__item--settings"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("admin", 21)}</span><h3>Program settings</h3></div><p class="u-text-soft">Changes apply to: <strong class="u-text-strong">${esc(e.short)}</strong></p>
    <label class="field">Banner image URL<input class="input" id="bannerImageInput" placeholder="https://example.com/banner.jpg" value="${e.image.startsWith("data:") ? "" : esc(e.image)}"></label>
    <div><button class="btn btn--primary" data-action="update-banner">${svg("image", 17)} Update banner</button></div>
    <label class="field">Code freeze (date and time)<input class="input" type="datetime-local" data-change="due" value="${toLocalInput(new Date(e.dueAt).getTime())}"></label>
    <label class="field">Broadcast message (shown in the red bar)<input class="input" id="broadcastNoteInput" placeholder="Leave empty for the automatic countdown message" value="${esc(e.note || "")}"></label>
    <div><button class="btn btn--primary" data-action="update-note">${svg("send", 17)} Update message</button></div>
    <label class="field field--check"><input class="input input--check" type="checkbox" data-change="open"${e.open ? " checked" : ""}> Submissions are open</label>${STATE.notice ? `<p class="notice" role="status">${STATE.notice}</p>` : ""}</section>${keynotePanelHtml()}${eventPanelHtml()}</div>`;
  },

  auth: () => {
    // Already signed in: show the account. The role cannot be changed here.
    if (STATE.loggedIn)
      return `<section class="panel panel--narrow panel--auth">
      <h3>You are signed in</h3><p class="u-text-soft">${esc(STATE.user.name)} (${ROLES[STATE.role]})<br>${esc(STATE.user.email)}</p>
      <p class="u-text-soft">Your menu only shows what your role can use. To use a different role, log out and sign in with a different account.</p>
      <div><button class="btn" data-action="auth-toggle">Log out</button></div></section>`;
    const register = STATE.authMode === "register";
    return `<section class="panel panel--narrow panel--auth"><div class="tabs tabs--flush">
      <button class="tab${withClass(!register, CLS.active)}" data-action="mode" data-value="login">Log in</button>
      <button class="tab${withClass(register, CLS.active)}" data-action="mode" data-value="register">Register</button>
      </div>
    <form class="form" id="authForm" novalidate>${register ? '<label class="field">Your name<input class="input" name="name" autocomplete="name"></label>' : ""}<label class="field">Email<input class="input" name="email" type="email" autocomplete="email">
      </label><label class="field">Password<input class="input" name="password" type="password" autocomplete="${register ? "new-password" : "current-password"}">
      </label>
    ${
      register
        ? `<label class="field">I am joining as<select class="input" name="role">${SIGNUP_ROLES.map((id) => `<option value="${id}">${ROLES[id]}</option>`).join("")}</select>
      </label><label class="field is-hidden" id="authCodeBox">Super Admin access code<input class="input" name="code" autocomplete="off">
      </label><p class="form__hint">Your role is set when you register and cannot be changed later. Super Admin needs the organizer access code (demo code: ${CONFIG.adminCode}).</p>`
        : ""
    }
    <p class="form__error" id="authError" role="alert"></p><button class="btn btn--primary btn--center">${register ? "Create account" : "Log in"}</button>
      </form>
    ${
      register
        ? ""
        : `<div><p class="text-label u-text-soft">Demo accounts (password ${CONFIG.demoPassword})</p>
      <div class="cluster">${DEMO_ACCOUNTS.map((d) => `<button class="tab" type="button" data-action="demo" data-value="${d.email}">${ROLES[d.role]}</button>`).join("")}</div>
      </div>`
    }</section>`;
  },
};

function drawPage() {
  if (!can(STATE.role, STATE.page)) STATE.page = "live"; // SAFETY RULE: no access means show Live program
  STATE.sessionSignature = sessionsSignature();
  show(DOM.banner, STATE.page !== "auth"); // the login form comes first, with no big banner pushing it down
  DOM.pageContent.innerHTML = PAGES[STATE.page]();
}
function drawAll() {
  drawSidebar();
  drawNav();
  drawBroadcast();
  drawTop();
  drawBanner();
  drawPage();
}

// Make the floating Q&A once, so typed text stays on the page.
function drawQA() {
  DOM.qaFloat.innerHTML = `<button class="qa-float__toggle" id="qaToggle" data-action="qa-open" aria-label="Open Mini Q&amp;A" aria-expanded="false" aria-controls="qaPanel">${svg("spark", 26)}</button>
    <section class="qa-float__panel" id="qaPanel" aria-label="Mini Q&amp;A"><div class="qa__header"><h2 class="qa__title">${svg("spark", 20)}<span>Mini Q&amp;A</span></h2>
    <div class="qa__tools"><span class="text-mono" id="qaCount">${STATE.questions.length} ${CONFIG.qaMinutesLabel}</span><button class="qa__close" data-action="qa-close" aria-label="Close Mini Q&amp;A">${svg("x", 18)}</button></div></div>
    <ul class="qa__list" id="qaList">${qaListHtml()}</ul>
    <form class="form qa__form" id="qaForm" novalidate><div class="form__split"><input class="input" name="name" placeholder="Your name" aria-label="Your name">
    <input class="input" name="team" placeholder="Team name" aria-label="Team name"></div>
    <div class="qa__send"><input class="input" name="text" placeholder="Ask the speaker a question..." aria-label="Your question">
    <button class="qa__send-button" aria-label="Send question">${svg("send", 18)}</button></div><p class="form__error" id="qaError" role="alert"></p></form></section>`;
}
function setQA(open) {
  STATE.qaOpen = open;
  DOM.qaFloat.classList.toggle(CLS.open, open);
  DOM.qaToggle.setAttribute("aria-expanded", open);
  if (open) requestAnimationFrame(() => DOM.query.qaClose().focus());
  else DOM.qaToggle.focus();
}


/* ==========================================================================
   9. MOTION: banner pin, countdown freeze, pixel dissolve
   ========================================================================== */

/* Banner that stays at the top.
   It moves up while scrolling, then stops at the top. */
function bannerMetrics() {
  if (DOM.banner.classList.contains(CLS.hidden)) return;
  const height = DOM.banner.offsetHeight;
  DOM.root.style.setProperty("--banner-h", height + "px");
  STATE.bannerRange = Math.max(1, height * STATE.bannerShrink);
  bannerScroll();
}
function bannerScroll() {
  STATE.bannerFrame = 0;
  if (DOM.banner.classList.contains(CLS.hidden)) return;
  const progress = Math.min(1, Math.max(0, -DOM.banner.getBoundingClientRect().top / STATE.bannerRange)),
    eased = progress * progress * (3 - 2 * progress);
  DOM.banner.style.setProperty("--banner-fill-progress", eased.toFixed(3));
  DOM.banner.style.setProperty("--banner-scale", (1 - STATE.bannerShrink * eased).toFixed(3));
  DOM.banner.classList.toggle(CLS.pinned, progress >= 0.97);
}
function onScroll() {
  if (!STATE.bannerFrame) STATE.bannerFrame = requestAnimationFrame(bannerScroll);
}

/* Countdown and code freeze.
   It updates once every second. At zero, the countdown gets a freeze effect and then disappears. */
function scrambleTo(el, text, ms) {
  const t0 = performance.now(),
    chars = CONFIG.scrambleChars;
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / ms);
    el.textContent = [...text].map((c, i) => (c === " " || c === "/" || i / text.length < p ? c : chars[Math.floor(Math.random() * chars.length)])).join("");
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
function badgeHtml(frozen, open) {
  return frozen ? `${svg("lock", 12)} Submissions frozen` : `${svg(open ? "unlock" : "lock", 12)} ${open ? "Submissions open" : "Submissions closed"}`;
}
// Slowly make an item shorter until it closes.
function collapse(el) {
  el.style.setProperty("--collapse-height", el.offsetHeight + "px");
  el.classList.add(CLS.collapsing);
  void el.offsetHeight; // Make the browser notice the starting size.
  el.classList.add(CLS.collapsed);
  return wait(CONFIG.collapseMs);
}
function paintFreeze(left, animate) {
  const row = DOM.countdownRow,
    badge = DOM.submissionBadge,
    caption = DOM.freezeCaption;
  if (!row || !badge || !caption) return;
  const frozen = left <= 0,
    e = currentEvent(),
    mode = frozen ? "f" : e.open ? "o" : "c",
    label = frozen ? "FROZEN // LOCKED" : "Code freeze";
  row.classList.toggle(CLS.warning, left > 0 && left <= CONFIG.freeze.warnSeconds);
  row.classList.toggle(CLS.frozen, frozen);
  if (caption.dataset.mode !== mode) {
    caption.dataset.mode = mode;
    caption.classList.toggle(CLS.frozen, frozen);
    if (animate) scrambleTo(caption, label, CONFIG.freeze.scrambleMs);
    else caption.textContent = label;
  }
  if (badge.dataset.mode !== mode) {
    const apply = () => {
      badge.className = "pill" + (frozen ? " pill--frozen" : withClass(e.open, "pill--ok"));
      badge.innerHTML = badgeHtml(frozen, e.open);
    };
    badge.dataset.mode = mode;
    if (animate) {
      badge.classList.add(CLS.flipping);
      setTimeout(apply, CONFIG.freeze.badgeSwapMs); // swap the face while the badge is edge-on
      setTimeout(() => badge.classList.remove(CLS.flipping), CONFIG.freeze.badgeFlipMs);
    } else apply();
  }
  if (!frozen) {
    // the freeze moved later again: bring the countdown back clean
    row.classList.remove(CLS.hidden, CLS.dissolving, CLS.collapsing, CLS.collapsed);
    row.style.removeProperty("--collapse-height");
  } else if (animate) {
    // Show the glitch, pause, then hide the countdown.
    STATE.freezeBusy = true;
    row.classList.add(CLS.glitching);
    setTimeout(() => row.classList.remove(CLS.glitching), CONFIG.freeze.glitchMs);
    wait(CONFIG.freeze.holdMs).then(async () => {
      const target = DOM.countdownRow;
      if (target && !reducedMotion()) {
        await pixelDissolve(target, { duration: CONFIG.freeze.dissolveMs, cell: CONFIG.freeze.dissolveCell });
        await collapse(target);
      }
      if (target) show(target, false);
      STATE.freezeBusy = false;
    });
  } else if (!STATE.freezeBusy) show(row, false); // The countdown is already frozen.
}
function tick() {
  const e = currentEvent(),
    left = Math.max(0, Math.floor((new Date(e.dueAt) - Date.now()) / 1000)),
    frozen = left <= 0,
    justFroze = STATE.wasFrozen === false && frozen; // only the tick that crosses zero plays the animation
  if (DOM.broadcastMessage)
    DOM.broadcastMessage.textContent =
      e.note ||
      (left
        ? `${Math.ceil(left / 3600)} hours until submission portal freeze. Make sure all GitHub repositories are public and contain a valid LICENSE.`
        : "The submission portal is now frozen.");
  STATE.wasFrozen = frozen;
  paintFreeze(left, justFroze);
  syncSessions();
  if (!DOM.countdown) return;
  DOM.countdown.innerHTML = [
    [Math.floor(left / 86400), "days"],
    [Math.floor((left % 86400) / 3600), "hrs"],
    [Math.floor((left % 3600) / 60), "min"],
    [left % 60, "sec"],
  ]
    .map(([n, unit]) => `<div class="countdown__unit"><span class="countdown__value">${pad2(n)}</span><span class="countdown__label">${unit}</span></div>`)
    .join("");
}

/* Pixel disappear effect.
   When a session ends, coloured blocks cover it and the card closes. */
function pixelDissolve(el, { duration, cell }) {
  return new Promise((done) => {
    const w = el.offsetWidth,
      h = el.offsetHeight;
    if (!w || !h) return done();
    const dpr = Math.min(2, window.devicePixelRatio || 1),
      canvas = document.createElement("canvas"),
      palette = STATE.pixelPalette;
    canvas.width = Math.ceil(w * dpr);
    canvas.height = Math.ceil(h * dpr);
    canvas.className = "pixel-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.classList.add(CLS.dissolving);
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const cols = Math.ceil(w / cell),
      rows = Math.ceil(h / cell),
      n = cols * rows,
      on = new Float32Array(n),
      off = new Float32Array(n),
      pick = new Uint8Array(n);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        on[i] = 0.7 * Math.random() + 0.3 * (c / cols); // blocks switch on in a loose left-to-right sweep
        off[i] = 0.7 * Math.random() + 0.3 * (1 - c / cols); // and wink out in a loose right-to-left sweep
        pick[i] = Math.floor(Math.random() * palette.length);
      }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration),
        a = Math.min(1, p / 0.5),
        b = Math.max(0, (p - 0.5) / 0.5);
      el.style.setProperty("--dissolve", a.toFixed(3)); // the text underneath fades as the blocks appear
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < n; i++) {
        if (on[i] > a) continue;
        const alpha = 1 - Math.min(1, Math.max(0, (b - off[i] * 0.85) / 0.15));
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = palette[pick[i]];
        ctx.fillRect((i % cols) * cell, Math.floor(i / cols) * cell, cell - 1, cell - 1);
      }
      if (p < 1) requestAnimationFrame(step);
      else {
        canvas.remove();
        done();
      }
    };
    requestAnimationFrame(step);
  });
}
function exitSession(card) {
  const time = DOM.query.sessionTime(card),
    cfg = CONFIG.sessionExit;
  if (time) pixelDissolve(time, { duration: cfg.timeDissolveMs, cell: cfg.timeCell }); // the time slot goes first
  return wait(cfg.timeLeadMs)
    .then(() => pixelDissolve(card, { duration: cfg.cardDissolveMs, cell: cfg.cardCell }))
    .then(() => collapse(card));
}
function syncSessions() {
  if (STATE.page !== "live" || STATE.sessionsExiting || sessionsSignature() === STATE.sessionSignature) return;
  const stillThere = new Set(sessionsNow().map((x) => String(x.id))),
    gone = STATE.sessionSignature.split(",").filter(Boolean).map((x) => x.replace(/L$/, "")).filter((id) => !stillThere.has(id)),
    cards = gone.map((id) => DOM.query.sessionCard(id)).filter(Boolean);
  if (!cards.length || reducedMotion()) return drawPage();
  STATE.sessionsExiting = true;
  Promise.all(cards.map(exitSession)).then(() => {
    STATE.sessionsExiting = false;
    drawPage();
  });
}


/* ==========================================================================
   10. ACTIONS: what each click does (looked up by the data-action name)
   ========================================================================== */
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
function handleEvent(form) {
  const f = new FormData(form),
    name = f.get("name").trim(),
    short = f.get("short").trim() || name,
    tag = f.get("tag").trim(),
    place = f.get("place").trim(),
    image = f.get("image").trim(),
    summary = f.get("summary").trim(),
    err = DOM.eventError;
  if (!name || !f.get("start") || !f.get("due")) return showError(form, err, "Please add an event name, a start time and a code freeze time.");
  const start = new Date(f.get("start")),
    due = new Date(f.get("due"));
  if (due <= start) return showError(form, err, "The code freeze must be after the event starts.");
  if (due <= Date.now()) return showError(form, err, "The code freeze must be in the future.");
  if (image && !/^https?:\/\//i.test(image)) return showError(form, err, "The banner link must start with https://");
  const created = {
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
    image: image || placeholderBanner(),
    summary,
    tracks: f.get("tracks").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
  };
  STATE.events.push(created);
  saveEvents();
  STATE.evNote = `${short} is published for ${created.date}. It is now in the event switcher in the sidebar.`;
  drawAll();
}
function handleKeynote(form) {
  const f = new FormData(form),
    err = DOM.keyError,
    title = f.get("title").trim(),
    type = f.get("type"),
    start = new Date(f.get("start")).getTime(),
    end = new Date(f.get("end")).getTime();
  if (!title) return showError(form, err, "Please give the keynote a title.");
  if (!TYPES.slice(1).includes(type)) return showError(form, err, "Please choose a stage.");
  if (isNaN(start) || isNaN(end)) return showError(form, err, "Please set a start and an end time.");
  if (end <= start) return showError(form, err, "The end time must be after the start time.");
  const speaker = f.get("speaker").trim(),
    org = f.get("org").trim(),
    fields = {
      title,
      type,
      topics: f.getAll("topics"),
      start,
      end,
      about: f.get("about").trim(),
      who: speaker && org ? speaker + ", " + org : speaker || org,
      badge: f.get("badge") || "auto",
      rsvp: f.get("rsvp") === "on",
    },
    kn = STATE.keynotes;
  if (STATE.editKey) {
    const id = STATE.editKey;
    if (DEFAULT_SESSIONS.some((d) => d.id === id)) kn.mod[id] = fields;
    else kn.add = kn.add.map((x) => (x.id === id ? { ...x, ...fields } : x));
  } else kn.add.push({ id: Date.now(), ev: STATE.eventId, custom: true, ...fields });
  saveKeynotes();
  STATE.keyNote =
    `\u201C${title}\u201D ${STATE.editKey ? "updated" : "published"}.` +
    (end <= Date.now() ? " Its end time has already passed, so it will not show in the program." : " It is now in Live program & keynotes.");
  STATE.editKey = null;
  STATE.delArm = null;
  drawPage();
}
function handleQuestion(form) {
  const f = new FormData(form),
    name = f.get("name").trim(),
    team = f.get("team").trim(),
    text = f.get("text").trim();
  if (!name || !team || !text) return showError(form, DOM.qaError, "Please fill in your name, your team and your question."); // all three boxes are needed
  STATE.questions.push({
    id: Date.now(),
    name,
    team,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    pinned: false,
    votes: 0,
  });
  DOM.qaList.innerHTML = qaListHtml();
  DOM.qaCount.textContent = STATE.questions.length + " " + CONFIG.qaMinutesLabel;
  DOM.qaList.scrollTop = DOM.qaList.scrollHeight;
  form.reset();
  showError(form, DOM.qaError, "");
}

const ACTIONS = {
  nav: (v) => go(v),
  topic: (v) => {
    STATE.topic = STATE.topic === v ? "" : v;
    drawPage();
  },
  filter: (v) => {
    STATE.filter = v;
    drawPage();
  },
  mode: (v) => {
    STATE.authMode = v;
    drawPage();
  },
  // Edited by NkosinathiM-ship: clear the session and return to the login entry.
  "auth-toggle": () => {
    if (STATE.loggedIn) {
      signOut();
      window.location.assign("index.html");
    } else go("auth");
  },
  theme: () => {
    STATE.theme = STATE.theme === "dark" ? "light" : "dark";
    DOM.root.dataset.theme = STATE.theme;
  },
  demo: (v) => {
    // fills the demo login
    DOM.query.authField("email").value = v;
    DOM.query.authField("password").value = CONFIG.demoPassword;
  },
  "broadcast-close": () => {
    STATE.bcastOff = true;
    show(DOM.broadcast, false);
  },
  reserve: (v) => {
    const id = +v;
    if (!STATE.loggedIn) STATE.notice = "Please log in or register first (use \u201CLog in & registration\u201D in the menu).";
    else {
      STATE.notice = "";
      STATE.reserved = STATE.reserved.includes(id) ? STATE.reserved.filter((i) => i !== id) : [...STATE.reserved, id];
    }
    drawPage();
  },
  book: (v) => {
    STATE.booked = STATE.booked.includes(v) ? STATE.booked.filter((i) => i !== v) : [...STATE.booked, v];
    drawPage();
  },
  vote: (v) => {
    const q = STATE.questions.find((i) => i.id === +v);
    if (q && !STATE.voted.includes(q.id)) {
      q.votes++;
      STATE.voted.push(q.id);
      DOM.qaList.innerHTML = qaListHtml();
    }
  },
  "qa-open": () => setQA(true),
  "qa-close": () => setQA(false),
  "update-banner": () => {
    const url = DOM.bannerImageInput.value.trim();
    if (!url) return;
    updateEvent({ image: url });
    STATE.notice = "Banner updated.";
    drawBanner();
    drawPage();
  },
  "update-note": () => {
    updateEvent({ note: DOM.broadcastNoteInput.value.trim() });
    STATE.bcastOff = false;
    STATE.notice = "Message updated.";
    drawBroadcast();
    tick();
    drawPage();
  },
  "remove-event": (v) => {
    STATE.events = STATE.events.filter((x) => !(x.id === v && x.custom));
    if (!STATE.events.some((x) => x.id === STATE.eventId)) STATE.eventId = STATE.events[0].id;
    saveEvents();
    drawAll();
  },
  "key-edit": (v) => {
    STATE.editKey = +v;
    STATE.delArm = null;
    STATE.keyNote = "";
    drawPage();
    DOM.keyForm.scrollIntoView({ block: "center" });
  },
  "key-cancel": () => {
    STATE.editKey = null;
    drawPage();
  },
  "key-delete": (v) => {
    const id = +v,
      kn = STATE.keynotes;
    if (STATE.delArm !== id) {
      STATE.delArm = id; // first click arms it, second click confirms
      return drawPage();
    }
    if (DEFAULT_SESSIONS.some((d) => d.id === id)) {
      if (!kn.del.includes(id)) kn.del.push(id);
    } else kn.add = kn.add.filter((x) => x.id !== id);
    saveKeynotes();
    if (STATE.editKey === id) STATE.editKey = null;
    STATE.delArm = null;
    STATE.keyNote = "Keynote deleted.";
    drawPage();
  },
};

const CHANGES = {
  event: (target) => {
    STATE.eventId = target.value;
    STATE.topic = "";
    STATE.editKey = null;
    STATE.keyNote = "";
    STATE.notice = "";
    STATE.evNote = "";
    drawAll();
  },
  due: (target) => {
    if (!target.value) return;
    updateEvent({ dueAt: new Date(target.value).toISOString() });
    drawTop();
  },
  open: (target) => {
    updateEvent({ open: target.checked });
    drawTop();
  },
};

const FORMS = {
  qaForm: handleQuestion,
  authForm: handleAuth,
  eventForm: handleEvent,
  keyForm: handleKeynote,
};

function onClick(e) {
  // Send clicked buttons to the right action function.
  const button = e.target.closest("[data-action]");
  const action = button && ACTIONS[button.dataset.action];
  if (action) action(button.dataset.value, button);
}
function onChange(e) {
  const target = e.target,
    change = CHANGES[target.dataset.change];
  if (change) return change(target);
  // show the code box only for Super Admin
  if (target.name === "role" && target.form && target.form.id === "authForm") show(DOM.authCodeBox, target.value === "superadmin");
}
function onInput(e) {
  const team = e.target.dataset.score;
  if (team) STATE.scores[team] = Math.min(10, Math.max(0, Number(e.target.value))); // judge scores stay between 0 and 10
}
function onKeydown(e) {
  if (e.key === "Escape" && STATE.qaOpen) return setQA(false);
  // keyboard shortcut: press 1, 2, 3... to open that menu item
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  const item = navItems()[Number(e.key) - 1];
  if (item && !PLACEHOLDER_NAV_IDS.has(item.id) && can(STATE.role, item.id)) go(item.id);
}
function onSubmit(e) {
  e.preventDefault();
  const handler = FORMS[e.target.id];
  if (handler) handler(e.target);
}


/* ==========================================================================
   11. init(): wire every listener once, then start the app
   ========================================================================== */
function init() {
  // Settings in css/live-program.css are read from tokens so the files stay in sync.
  STATE.bannerShrink = parseFloat(readToken("--banner-shrink")) || STATE.bannerShrink;
  STATE.pixelPalette = CONFIG.pixelTokens.map(readToken);

  // Event listeners (one delegated listener per event type)
  DOM.doc.addEventListener("click", onClick);
  DOM.doc.addEventListener("change", onChange);
  DOM.doc.addEventListener("input", onInput);
  DOM.doc.addEventListener("keydown", onKeydown);
  DOM.doc.addEventListener("submit", onSubmit);
  DOM.win.addEventListener("scroll", onScroll, { passive: true });
  DOM.win.addEventListener("resize", bannerMetrics);
  if (window.ResizeObserver) new ResizeObserver(bannerMetrics).observe(DOM.banner);

  // First paint
  DOM.root.dataset.theme = STATE.theme;
  drawQA();
  drawAll();
  initAccounts().then(drawAll).catch(drawAll); // load accounts, restore a saved login, then redraw
  setInterval(tick, CONFIG.tickMs);
}

init(); // this file is loaded with "defer", so the page is ready by now
