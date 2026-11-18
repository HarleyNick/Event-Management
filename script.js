"use strict";
/* =====================================================================
   script.js : application logic only. No colours, sizes or inline styles.
   Order: 1 CONFIG  2 DATA  3 DOM registry  4 STATE  5 HELPERS  6 ACCOUNTS
          7 DRAWING  8 ACTIONS  9 init()
   Appearance changes happen ONLY by toggling CONFIG.CLASS names, or by
   setting the CSS variable CONFIG.CSS_VAR.bannerImage.
   ===================================================================== */

/* ========== 1. CONFIG (static, never changes at runtime) ========== */
const CONFIG = {
  STORAGE_KEYS: { events: "portal-events-v3", accounts: "portal-accounts-v1", session: "portal-session-v1" },
  CLASS: {
    hidden: "is-hidden",
    active: "is-active",
    live: "is-live",
    done: "is-done",
    open: "is-open",
    bannerCustom: "banner--custom",
  },
  CSS_VAR: { bannerImage: "--banner-image" },
  TICK_INTERVAL_MS: 1000,
  START: { eventId: "limpopo", page: "live", theme: "dark", filter: "All", authMode: "login" },
  AUTH: { demoPassword: "demo1234", adminCode: "LIMPOPO-ADMIN", minPasswordLength: 6 }, // DEMO ONLY: real organizers must be created by a server
  LIMITS: { scoreMin: 0, scoreMax: 10, maxTracks: 8 },
  ICON_SIZE: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 26 },
  ROLES: {
    guest: "Guest",
    attendee: "Attendee",
    mentor: "Mentor",
    team: "Team",
    judge: "Judge",
    superadmin: "Super Admin",
  },
  SIGNUP_ROLES: ["attendee", "mentor", "team", "judge", "superadmin"],
  // Role-based access control: the menu pages each role may open.
  ALLOWED: {
    guest: ["live", "auth"],
    attendee: ["live", "auth"],
    mentor: ["live", "mentors", "auth"],
    team: ["live", "mentors", "teams", "notices", "auth"],
    judge: ["live", "judging", "auth"],
    superadmin: ["live", "mentors", "teams", "notices", "judging", "admin", "auth"],
  },
  MENU: [
    { id: "live", label: "Live program & keynotes", hint: "Talks, workshops and questions" },
    { id: "mentors", label: "Mentor 1-on-1 hub", hint: "Get help from an expert" },
    { id: "teams", label: "Team directory", hint: "See all teams" },
    { id: "notices", label: "Notice board", hint: "Announcements for teams" },
    { id: "judging", label: "Judging portal", hint: "Score the projects" },
    { id: "admin", label: "Super Admin console", hint: "Banner, countdown, controls" },
    { id: "auth", label: "Log in & registration", hint: "Sign in or create an account" },
  ],
  SESSION_TYPES: ["All", "Main Stage", "Workshop Lab", "Mentor Pit", "Lightning Talks"],
};

/* ========== 2. DATA (seed content and icon artwork) ========== */
const DATA = {
  ICONS: {
    live: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19a10 10 0 0 1 0-14"/>',
    mentors: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    teams: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    notices: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
    judging: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
    admin: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    auth: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    pin: '<path d="M12 17v5M9 3h6l-1 7 3 3v2H7v-2l3-3z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/>',
    send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    thumb: '<path d="M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.5l-1.4 7a2 2 0 0 1-2 1.5H7V10l4-8a2.4 2.4 0 0 1 4 3.9z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  },
  // dueInHours / bannerColors are turned into dueAt / image by createDefaultEvents().
  DEFAULT_EVENTS: [
    {
      id: "limpopo",
      name: "SYNAPSE 2026 // Limpopo Dev Hackathon",
      short: "Limpopo Dev Hackathon",
      date: "Nov 10-12, 2026",
      tag: "48-Hour Live Build & Pitch Championship",
      place: "Moscone Center West & Global Virtual Stream",
      open: true,
      dueInHours: 18,
      bannerColors: ["#3a0a1c", "#14153a"],
      summary: "Premier 48-hour global multimodal artificial intelligence, agentic frameworks, and edge computing championship.",
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
      dueInHours: 72,
      bannerColors: ["#07272e", "#1a1442"],
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
      dueInHours: 240,
      bannerColors: ["#0b2a1a", "#0d1f3a"],
      summary: "A weekend sprint to build tools for a greener future.",
      tracks: ["Energy", "Water", "Farming"],
    },
  ],
  // DEMO: offsets are minutes from page load so you can watch a session end. Real events: use fixed timestamps.
  SESSION_TEMPLATES: [
    { id: 1, type: "Main Stage", startMin: -40, endMin: 3, title: "Keynote: Autonomous Agent Swarms with Multimodal Grounding", about: "Deep dive into next-generation reactive architectures where agentic loops fuse vision, audio, and code execution with verifiable consensus.", who: "Dr. Aris Thorne, Google DeepMind" },
    { id: 2, type: "Workshop Lab", startMin: 4, endMin: 94, title: "Hands-on Lab: Deploying Local SLMs on WebGPU & WASM", about: "Build and deploy a zero-latency in-browser embedding and generation pipeline with quantized weights running directly on user hardware.", who: "Priya Sharma, Hugging Face" },
    { id: 3, type: "Main Stage", startMin: 110, endMin: 170, title: "Constitutional Safety & Red-Teaming for Production Agents", about: "Practical security frameworks to prevent jailbreaks, prompt injection, and unauthorized API execution in autonomous agent workflows.", who: "Elena Rostova, Anthropic Core Systems" },
    { id: 4, type: "Lightning Talks", startMin: 185, endMin: 230, title: "Zero-Knowledge State Channels for Ultra-Fast Decentralized Gaming", about: "How to achieve sub-50ms verifiable off-chain game physics with succinct batch proofs settled periodically on layer-1.", who: "Marcus Vance, Solana Labs" },
    { id: 5, type: "Mentor Pit", startMin: 245, endMin: 320, title: "Venture Pitch Clinic: What Judges & Angel VCs Look For", about: "1-on-1 critique of 3-minute deck structure, traction milestones, defensible moat articulation, and live demo stagecraft.", who: "Kaito Tanaka, Cybernetic Ventures" },
  ],
  MENTORS: [
    { name: "Priya Sharma", skill: "Machine learning" },
    { name: "Kaito Tanaka", skill: "Pitching and funding" },
    { name: "Elena Rostova", skill: "Security" },
  ],
  TEAMS: [
    { name: "NeuralPulse", members: 4 },
    { name: "BioSynapse", members: 3 },
    { name: "ZeroProof", members: 5 },
    { name: "GreenGrid", members: 4 },
  ],
  NOTICES: [
    { title: "Lunch is at 1 PM", body: "Find the food tables near the main hall." },
    { title: "Repository rule", body: "Your GitHub repo must be public and include a LICENSE file." },
  ],
  DEMO_ACCOUNTS: [
    { email: "attendee@demo.test", name: "Ayanda", role: "attendee" },
    { email: "mentor@demo.test", name: "Priya", role: "mentor" },
    { email: "team@demo.test", name: "Team NeuralPulse", role: "team" },
    { email: "judge@demo.test", name: "Kaito", role: "judge" },
    { email: "admin@demo.test", name: "Thandi", role: "superadmin" },
  ],
  SEED_QUESTIONS: [
    { id: 1, name: "Kai Vance", team: "NeuralPulse", time: "10:14 AM", pinned: true, votes: 42, text: "How do you handle latency jitter when streaming tool-call arguments concurrently across a distributed swarm of sub-agents?" },
    { id: 2, name: "Mei Lin", team: "BioSynapse", time: "10:22 AM", pinned: false, votes: 29, text: "Can we use speculative decoding directly against multi-modal video streams, or is the KV-cache invalidation too prohibitive?" },
    { id: 3, name: "Alex Thorne", team: "ZeroProof", time: "10:35 AM", pinned: false, votes: 18, text: "What is the benchmark overhead for runtime safety filtering when generating streaming code tokens at 80 tokens/sec?" },
  ],
};

/* ========== 3. DOM REGISTRY (every element lookup lives here) ========== */
const byId = (id) => document.getElementById(id);
const DOM = {
  // Static shells from index.html
  root: document.documentElement,
  sidebar: byId("sidebar"),
  banner: byId("banner"),
  mainNav: byId("main-nav"),
  broadcast: byId("broadcast"),
  pageHeader: byId("page-header"),
  page: byId("page"),
  qaWidget: byId("qa-widget"),
  // Elements injected by drawing functions: looked up fresh each time because they are re-rendered.
  get countdown() { return byId("countdown"); },
  get countdownRow() { return byId("countdown-row"); },
  get broadcastMessage() { return byId("broadcast-message"); },
  get authForm() { return byId("auth-form"); },
  get authError() { return byId("auth-error"); },
  get codeBox() { return byId("code-box"); },
  get eventForm() { return byId("event-form"); },
  get eventError() { return byId("event-error"); },
  get bannerUrl() { return byId("banner-url"); },
  get broadcastText() { return byId("broadcast-text"); },
  get qaOpen() { return byId("qa-open"); },
  get qaClose() { return byId("qa-close"); },
  get qaForm() { return byId("qa-form"); },
  get qaError() { return byId("qa-error"); },
  get qaList() { return byId("qa-list"); },
  get qaCount() { return byId("qa-count"); },
};

/* ========== 4. STATE (everything that can change) ========== */
const STATE = {
  events: [],
  sessions: [],
  accounts: [],
  eventId: CONFIG.START.eventId,
  page: CONFIG.START.page,
  theme: CONFIG.START.theme,
  filter: CONFIG.START.filter,
  authMode: CONFIG.START.authMode,
  role: "guest",
  loggedIn: false,
  user: null,
  broadcastDismissed: false,
  qaOpen: false,
  notice: "",
  eventNote: "",
  sessionSignature: "", // what the Live page last drew, so it only redraws when a session starts or ends
  reserved: [],
  booked: [],
  voted: [],
  scores: {},
  questions: DATA.SEED_QUESTIONS.map((q) => ({ ...q })),
};

/* ========== 5. HELPERS ========== */
const currentEvent = () => STATE.events.find((e) => e.id === STATE.eventId);
const setHidden = (el, hidden) => el && el.classList.toggle(CONFIG.CLASS.hidden, hidden);
const active = (cond) => (cond ? " " + CONFIG.CLASS.active : "");
const can = (role, pageId) => CONFIG.ALLOWED[role].includes(pageId);
const visibleMenu = () => CONFIG.MENU.filter((m) => can(STATE.role, m.id));
const navItems = () => visibleMenu().filter((m) => m.id !== "auth"); // "auth" lives in the sidebar
const esc = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icon = (name, size = 22) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${DATA.ICONS[name]}</svg>`;

const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();
function bannerSvg(from = "#3a0a1c", to = "#14153a") {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="420" fill="url(#s)"/><g fill="#fff" fill-opacity=".07"><ellipse cx="620" cy="40" rx="110" ry="34"/><ellipse cx="540" cy="52" rx="70" ry="26"/><ellipse cx="1330" cy="50" rx="80" ry="26"/><ellipse cx="300" cy="70" rx="60" ry="20"/></g><path d="M0 420V330C200 250 380 250 560 330S900 300 1020 250 1300 300 1600 330V420Z" fill="#5a1233"/><path d="M0 420V360C150 280 330 290 470 350S720 380 820 340 1200 250 1400 310 1560 340 1600 350V420Z" fill="#2a0d24"/></svg>`,
    )
  );
}
const isPlaceholderBanner = (image) => image.startsWith("data:");

function createDefaultEvents() {
  return DATA.DEFAULT_EVENTS.map(({ dueInHours, bannerColors, ...e }) => ({
    ...e,
    dueAt: hoursFromNow(dueInHours),
    image: bannerSvg(...bannerColors),
  }));
}
function buildSessions() {
  const now = Date.now();
  return DATA.SESSION_TEMPLATES.map(({ startMin, endMin, ...s }) => ({
    ...s,
    start: now + startMin * 60000,
    end: now + endMin * 60000,
  }));
}
// Sessions still to come or happening now, with "live" worked out from the clock.
function sessionsNow() {
  const now = Date.now();
  return STATE.sessions.filter((s) => s.end > now).map((s) => ({ ...s, live: s.start <= now }));
}
const sessionsSignature = () => sessionsNow().map((s) => s.id + (s.live ? "L" : "")).join();
const timeLabel = (s) => {
  const f = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return f(s.start) + " - " + f(s.end);
};

/* Storage (all wrapped: storage can be blocked) */
function loadEvents() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.events);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* storage blocked */ }
  return createDefaultEvents();
}
function saveEvents() {
  try { localStorage.setItem(CONFIG.STORAGE_KEYS.events, JSON.stringify(STATE.events)); } catch (e) { /* ignore */ }
}
function updateEvent(patch) {
  Object.assign(currentEvent(), patch);
  saveEvents();
}

/* ========== 6. ACCOUNTS (DEMO: runs in the browser; a real site needs a backend) ========== */
async function fingerprint(email, pass) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.toLowerCase() + ":" + pass));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const isDemoAccount = (a) => DATA.DEMO_ACCOUNTS.some((d) => d.email === a.email);
function saveAccounts() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.accounts, JSON.stringify(STATE.accounts.filter((a) => !isDemoAccount(a))));
  } catch (e) { /* storage blocked */ }
}
function signIn(user) {
  Object.assign(STATE, { user, role: user.role, loggedIn: true, page: "live" });
  try { localStorage.setItem(CONFIG.STORAGE_KEYS.session, user.email); } catch (e) { /* ignore */ }
}
function signOut() {
  Object.assign(STATE, { user: null, role: "guest", loggedIn: false, page: "live" });
  try { localStorage.removeItem(CONFIG.STORAGE_KEYS.session); } catch (e) { /* ignore */ }
}
async function initAccounts() {
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.accounts)) || []; } catch (e) { /* ignore */ }
  const demo = await Promise.all(
    DATA.DEMO_ACCOUNTS.map(async (d) => ({ ...d, key: await fingerprint(d.email, CONFIG.AUTH.demoPassword) })),
  );
  STATE.accounts = [...demo, ...saved];
  try {
    const u = STATE.accounts.find((a) => a.email === localStorage.getItem(CONFIG.STORAGE_KEYS.session));
    if (u) signIn(u); // keep people signed in after a refresh
  } catch (e) { /* ignore */ }
}
async function handleAuth(f) {
  const email = f.get("email").trim().toLowerCase(),
    pass = f.get("password"),
    name = (f.get("name") || "").trim(),
    err = DOM.authError,
    registering = STATE.authMode === "register";
  if (!email || !pass || (registering && !name)) { err.textContent = "Please fill in every box."; return; }
  if (registering && pass.length < CONFIG.AUTH.minPasswordLength) {
    err.textContent = `Please use at least ${CONFIG.AUTH.minPasswordLength} characters for your password.`;
    return;
  }
  const key = await fingerprint(email, pass),
    found = STATE.accounts.find((a) => a.email === email);
  if (registering) {
    if (found) { err.textContent = "That email already has an account. Please log in instead."; return; }
    const role = CONFIG.SIGNUP_ROLES.includes(f.get("role")) ? f.get("role") : "attendee";
    if (role === "superadmin" && (f.get("code") || "").trim() !== CONFIG.AUTH.adminCode) {
      err.textContent = "That Super Admin access code is not right.";
      return;
    }
    const user = { email, name, role, key };
    STATE.accounts.push(user);
    saveAccounts();
    signIn(user);
  } else {
    if (!found || found.key !== key) { err.textContent = "That email or password is not right. Please try again."; return; }
    signIn(found);
  }
  drawAll();
}

/* ========== 7. DRAWING (each function fills one shell from index.html) ========== */
function drawSidebar() {
  const name = STATE.loggedIn ? STATE.user.name : "Guest";
  const options = STATE.events
    .map((e) => `<option value="${esc(e.id)}"${e.id === STATE.eventId ? " selected" : ""}>${esc(e.short)}</option>`)
    .join("");
  DOM.sidebar.innerHTML = `<div class="sidebar__user"><span class="sidebar__avatar" aria-hidden="true">${esc(name.charAt(0).toUpperCase())}</span>
      <span class="sidebar__text"><b class="sidebar__name">${esc(name)}</b><small class="sidebar__role">${CONFIG.ROLES[STATE.role]}</small></span></div>
    <div class="sidebar__body"><div class="sidebar__event">${icon("layers", CONFIG.ICON_SIZE.xl)}<div class="sidebar__text"><span class="label sidebar__label">Event</span><select class="sidebar__select" data-change="event" aria-label="Choose an event">${options}</select></div></div></div>
    <div class="sidebar__footer">
      <button class="sidebar__item" type="button" data-action="theme" aria-label="Switch between light and dark mode"><span class="theme-icon"><span class="theme-icon__glyph theme-icon__glyph--sun">${icon("sun", CONFIG.ICON_SIZE.xl)}</span><span class="theme-icon__glyph theme-icon__glyph--moon">${icon("moon", CONFIG.ICON_SIZE.xl)}</span></span><span class="sidebar__text"><span class="theme-label--to-light">Switch to light</span><span class="theme-label--to-dark">Switch to dark</span></span></button>
      <button class="sidebar__item" type="button" data-action="auth-toggle">${icon(STATE.loggedIn ? "out" : "auth", CONFIG.ICON_SIZE.xl)}<span class="sidebar__text">${STATE.loggedIn ? "Log out" : "Log in / Register"}</span></button>
    </div>`;
}

function drawNav() {
  const items = navItems()
    .map(
      (m) => `<li class="topnav__item"><button class="topnav__link${active(STATE.page === m.id)}" type="button" data-action="nav" data-value="${m.id}" title="${esc(m.hint)}"${STATE.page === m.id ? ' aria-current="page"' : ""}><span class="topnav__icon">${icon(m.id, CONFIG.ICON_SIZE.lg)}</span><span class="topnav__label">${esc(m.label)}</span></button></li>`,
    )
    .join("");
  DOM.mainNav.innerHTML = `<div class="topnav__strip"><b>${esc(currentEvent().short)}</b><span class="tag">${CONFIG.ROLES[STATE.role]}</span></div>
    <ul class="topnav__menu">${items}</ul>`;
}

function drawPageHeader() {
  const e = currentEvent(),
    due = new Date(e.dueAt),
    title = CONFIG.MENU.find((m) => m.id === STATE.page).label;
  DOM.pageHeader.innerHTML = `<div class="page-header__toolbar"><h2 class="page-header__title">${esc(title)}</h2>
      <div class="cluster"><span class="tag${e.open ? " tag--ok" : ""}">${icon("lock", CONFIG.ICON_SIZE.xs)} ${e.open ? "Submissions open" : "Submissions closed"}</span></div></div>
    <div class="page-header__timer-row" id="countdown-row"><div class="page-header__timer"><div class="countdown" id="countdown" role="timer" aria-label="Time left until code freeze"></div></div>
      <div class="time-box"><span class="label">Time</span><b class="time-box__value">${due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b><span class="label">Code freeze</span></div></div>`;
  tick();
}

function drawBanner() {
  const e = currentEvent(),
    custom = !isPlaceholderBanner(e.image); // the Super Admin can swap in a real photo
  DOM.banner.classList.toggle(CONFIG.CLASS.bannerCustom, custom);
  DOM.banner.style.setProperty(CONFIG.CSS_VAR.bannerImage, `url("${e.image.replace(/"/g, "%22")}")`);
  DOM.banner.innerHTML = `<div class="banner__top"><span class="banner__chip text-mono">${esc(e.place)}</span>${STATE.role === "superadmin" ? `<button class="btn btn--primary banner__action" type="button" data-action="nav" data-value="admin">Change program banner</button>` : ""}</div>
    <h1 class="banner__title">${esc(e.name)}</h1>
    ${e.summary ? `<p class="banner__summary">${esc(e.summary)}</p>` : ""}
    <div class="banner__meta"><span class="tag">${esc(e.date)}</span><span class="text-mono">${esc(e.tag)}</span></div>`;
}

function drawBroadcast() {
  setHidden(DOM.broadcast, STATE.broadcastDismissed);
  DOM.broadcast.innerHTML = `<i class="broadcast__dot"></i><b class="broadcast__label">Broadcast:</b>${icon("alert", CONFIG.ICON_SIZE.md)}<span class="broadcast__message" id="broadcast-message"></span><button class="broadcast__close" type="button" data-action="broadcast-close" aria-label="Close this message">${icon("x", CONFIG.ICON_SIZE.md)}</button>`;
}

// Runs every second and only touches the clock and message, so typing elsewhere is never interrupted.
function tick() {
  const e = currentEvent(),
    left = Math.max(0, Math.floor((new Date(e.dueAt) - Date.now()) / 1000)),
    msg = DOM.broadcastMessage,
    cd = DOM.countdown;
  if (msg) {
    msg.textContent =
      e.note ||
      (left
        ? `${Math.ceil(left / 3600)} hours until submission portal freeze. Make sure all GitHub repositories are public and contain a valid LICENSE.`
        : "The submission portal is now frozen.");
  }
  setHidden(DOM.countdownRow, left <= 0); // countdown and Code freeze box disappear at zero
  syncSessions();
  if (!cd) return;
  const p = (n) => String(n).padStart(2, "0");
  cd.innerHTML = [
    [Math.floor(left / 86400), "days"],
    [Math.floor((left % 86400) / 3600), "hrs"],
    [Math.floor((left % 3600) / 60), "min"],
    [left % 60, "sec"],
  ]
    .map(([n, u]) => `<span class="countdown__cell"><b class="countdown__value">${p(n)}</b><small class="countdown__unit">${u}</small></span>`)
    .join("");
}
function syncSessions() {
  if (STATE.page === "live" && sessionsSignature() !== STATE.sessionSignature) drawPage();
}

/* Page building blocks */
const noticeHtml = (text) => (text ? `<p class="notice" role="status">${esc(text)}</p>` : "");

function sessionCard(s) {
  const reserved = STATE.reserved.includes(s.id);
  return `<article class="session${s.live ? " " + CONFIG.CLASS.live : ""}"><h2 class="session__title">${esc(s.title)}</h2>
    <p class="session__meta">${esc(s.type)} \u00B7 ${timeLabel(s)} ${s.live ? '<span class="live-pill text-mono">Live now</span>' : ""}</p>
    <p class="session__about">${esc(s.about)}</p><p class="session__speaker text-mono">${esc(s.who.replace(", ", " \u00B7 "))}</p>
    <button class="rsvp-btn${reserved ? " " + CONFIG.CLASS.done : ""}" type="button" aria-pressed="${reserved}" data-action="reserve" data-value="${s.id}">${icon("cal", CONFIG.ICON_SIZE.md)} ${reserved ? "Seat saved" : "Save my seat"}</button></article>`;
}
const liveList = () => {
  const list = sessionsNow().filter((s) => STATE.filter === "All" || s.type === STATE.filter);
  return list.length ? list.map(sessionCard).join("") : '<p class="page__empty">No sessions left in this view.</p>';
};

// Q&A list: pinned questions first, then the most votes.
function qaListHtml() {
  return [...STATE.questions]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.votes - a.votes)
    .map(
      (q) => `<li class="qa-item"><div class="qa-item__who"><span><b>${esc(q.name)}</b> (Team ${esc(q.team)})</span><span>${esc(q.time)}</span></div>
      <p class="qa-item__text">${esc(q.text)}</p>
      <div class="qa-item__footer"><button class="vote-btn" type="button" data-action="vote" data-value="${q.id}"${STATE.voted.includes(q.id) ? " disabled" : ""} aria-label="Vote for this question. Votes: ${q.votes}">${icon("thumb", CONFIG.ICON_SIZE.sm)} ${q.votes}</button>${q.pinned ? `<span class="qa-item__pin text-mono">${icon("pin", CONFIG.ICON_SIZE.xs)} Pinned</span>` : ""}</div></li>`,
    )
    .join("");
}

function eventPanelHtml() {
  const mine = STATE.events.filter((x) => x.custom);
  return `<section class="panel panel--narrow"><h3>Create and publish the next event</h3>
    <p class="text-soft">Fill this in and publish. The event is added to the event switcher in the sidebar straight away.</p>
    <form class="form event-form" id="event-form" novalidate>
      <label class="form__field">Event name<input class="input" name="name" placeholder="e.g. Pretoria Robotics Challenge"></label>
      <label class="form__field">Short name (shown in menus)<input class="input" name="short" placeholder="e.g. Robotics Challenge"></label>
      <div class="form__row"><label class="form__field">Starts<input class="input" type="datetime-local" name="start"></label><label class="form__field">Code freeze<input class="input" type="datetime-local" name="due"></label></div>
      <label class="form__field">Description<textarea class="input" name="summary" rows="3" placeholder="A sentence or two about the event"></textarea></label>
      <label class="form__field">Tagline<input class="input" name="tag" placeholder="e.g. 48-Hour Build Sprint"></label>
      <label class="form__field">Location<input class="input" name="place" placeholder="e.g. Sandton Convention Centre"></label>
      <label class="form__field">Tracks (separate with commas)<input class="input" name="tracks" placeholder="e.g. Robotics, AI, IoT"></label>
      <label class="form__field">Banner image URL (optional)<input class="input" name="image" placeholder="https://example.com/banner.jpg"></label>
      <p class="form-error" id="event-error" role="alert"></p>
      <button class="btn btn--primary btn--block">Publish event</button>
    </form>
    ${noticeHtml(STATE.eventNote)}
    ${mine.length ? `<div><p class="label text-soft">Events you added</p>${mine.map((x) => `<div class="cluster cluster--between event-row"><span><b>${esc(x.short)}</b> <span class="text-soft">${esc(x.date)}</span></span><button class="btn" type="button" data-action="remove-event" data-value="${esc(x.id)}">Remove</button></div>`).join("")}</div>` : ""}</section>`;
}

const PAGES = {
  live: () => `<div class="live-page"><section class="live-page__section">
    <div class="cluster cluster--center">${currentEvent().tracks.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    <div class="tabs tabs--center" role="group" aria-label="Filter sessions by type">${CONFIG.SESSION_TYPES.map((t) => `<button class="tabs__tab${active(STATE.filter === t)}" type="button" aria-pressed="${STATE.filter === t}" data-action="filter" data-value="${esc(t)}">${esc(t)}</button>`).join("")}</div>
    ${noticeHtml(STATE.notice)}${liveList()}</section></div>`,

  mentors: () =>
    `<p class="page__intro">Book 20 minutes with an expert.</p><div class="page__list">` +
    DATA.MENTORS.map((m) => {
      const booked = STATE.booked.includes(m.name);
      return `<article class="card"><h3 class="card__title">${esc(m.name)}</h3><p class="text-soft">${esc(m.skill)}</p>
      <button class="rsvp-btn${booked ? " " + CONFIG.CLASS.done : ""}" type="button" data-action="book" data-value="${esc(m.name)}">${icon("cal", CONFIG.ICON_SIZE.md)} ${booked ? "Booked. Tap to cancel" : "Book 20 minutes"}</button></article>`;
    }).join("") +
    "</div>",

  teams: () =>
    `<div class="page__list">` +
    DATA.TEAMS.map((t) => `<article class="card"><h3 class="card__title">${esc(t.name)}</h3><p class="text-soft">${t.members} members</p></article>`).join("") +
    "</div>",

  notices: () =>
    `<div class="page__list">` +
    DATA.NOTICES.map((n) => `<article class="card"><h3 class="card__title">${esc(n.title)}</h3><p class="text-soft">${esc(n.body)}</p></article>`).join("") +
    "</div>",

  judging: () =>
    `<p class="page__intro">Give each team a score from ${CONFIG.LIMITS.scoreMin} to ${CONFIG.LIMITS.scoreMax}.</p><div class="page__list">` +
    DATA.TEAMS.map(
      (t) => `<article class="card"><h3 class="card__title">${esc(t.name)}</h3><label class="form__field">Score<input class="input" type="number" min="${CONFIG.LIMITS.scoreMin}" max="${CONFIG.LIMITS.scoreMax}" data-score="${esc(t.name)}" value="${STATE.scores[t.name] ?? ""}"></label></article>`,
    ).join("") +
    "</div>",

  admin: () => {
    const e = currentEvent(),
      localDue = new Date(new Date(e.dueAt) - new Date(e.dueAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16); // datetime-local wants local time
    return `<section class="panel panel--narrow"><p class="text-soft">Changes apply to: <strong>${esc(e.short)}</strong></p>
      <label class="form__field">Banner image URL<input class="input" id="banner-url" placeholder="https://example.com/banner.jpg" value="${isPlaceholderBanner(e.image) ? "" : esc(e.image)}"></label>
      <div><button class="btn btn--primary" type="button" data-action="update-banner">Update banner</button></div>
      <label class="form__field">Code freeze (date and time)<input class="input" type="datetime-local" data-change="due" value="${localDue}"></label>
      <label class="form__field">Broadcast message (shown in the bar at the top)<input class="input" id="broadcast-text" placeholder="Leave empty for the automatic countdown message" value="${esc(e.note || "")}"></label>
      <div><button class="btn btn--primary" type="button" data-action="update-broadcast">Update message</button></div>
      <label class="form__field form__field--check"><input class="form__checkbox" type="checkbox" data-change="open"${e.open ? " checked" : ""}> Submissions are open</label>${noticeHtml(STATE.notice)}</section>${eventPanelHtml()}`;
  },

  auth: () => {
    if (STATE.loggedIn) {
      return `<section class="panel panel--narrow"><h3>You are signed in</h3><p class="text-soft">${esc(STATE.user.name)} (${CONFIG.ROLES[STATE.role]})<br>${esc(STATE.user.email)}</p>
      <p class="text-soft">Your menu only shows what your role can use. To use a different role, log out and sign in with a different account.</p>
      <div><button class="btn" type="button" data-action="auth-toggle">Log out</button></div></section>`;
    }
    const reg = STATE.authMode === "register";
    return `<section class="panel panel--narrow"><div class="tabs tabs--flush">
      <button class="tabs__tab${active(!reg)}" type="button" data-action="auth-mode" data-value="login">Log in</button>
      <button class="tabs__tab${active(reg)}" type="button" data-action="auth-mode" data-value="register">Register</button></div>
    <form class="form" id="auth-form" novalidate>${reg ? '<label class="form__field">Your name<input class="input" name="name" autocomplete="name"></label>' : ""}
      <label class="form__field">Email<input class="input" name="email" type="email" autocomplete="email"></label>
      <label class="form__field">Password<input class="input" name="password" type="password" autocomplete="${reg ? "new-password" : "current-password"}"></label>
      ${reg ? `<label class="form__field">I am joining as<select class="input" name="role">${CONFIG.SIGNUP_ROLES.map((id) => `<option value="${id}">${CONFIG.ROLES[id]}</option>`).join("")}</select></label>
      <label class="form__field ${CONFIG.CLASS.hidden}" id="code-box">Super Admin access code<input class="input" name="code" autocomplete="off"></label>
      <p class="text-soft">Your role is set when you register and cannot be changed later. Super Admin needs the organizer access code (demo code: ${esc(CONFIG.AUTH.adminCode)}).</p>` : ""}
      <p class="form-error" id="auth-error" role="alert"></p><button class="btn btn--primary btn--block">${reg ? "Create account" : "Log in"}</button></form>
    ${reg ? "" : `<div><p class="label text-soft">Demo accounts (password ${esc(CONFIG.AUTH.demoPassword)})</p>
      <div class="cluster">${DATA.DEMO_ACCOUNTS.map((d) => `<button class="tabs__tab" type="button" data-action="fill-demo" data-value="${esc(d.email)}">${CONFIG.ROLES[d.role]}</button>`).join("")}</div></div>`}</section>`;
  },
};

function drawPage() {
  if (!can(STATE.role, STATE.page)) STATE.page = "live"; // safety rule: no access means show the Live program
  STATE.sessionSignature = sessionsSignature();
  setHidden(DOM.banner, STATE.page === "auth"); // the login form comes first, with no big banner above it
  DOM.page.innerHTML = PAGES[STATE.page]();
}
function drawAll() {
  drawSidebar();
  drawNav();
  drawBroadcast();
  drawPageHeader();
  drawBanner();
  drawPage();
}

// Floating Mini Q&A: built once so what someone is typing survives page changes.
function drawQA() {
  DOM.qaWidget.innerHTML = `<button class="qa-widget__open" id="qa-open" type="button" data-action="qa-open" aria-label="Open Mini Q&amp;A" aria-expanded="false" aria-controls="qa-body">${icon("spark", CONFIG.ICON_SIZE.xxl)}</button>
    <section class="qa-widget__body" id="qa-body" aria-label="Mini Q&amp;A"><div class="qa-widget__header"><h2 class="qa-widget__title">${icon("spark", CONFIG.ICON_SIZE.xl)}<span>Mini Q&amp;A</span></h2>
    <div class="qa-widget__meta"><span class="text-mono" id="qa-count">${STATE.questions.length} questions</span><button class="qa-widget__close" id="qa-close" type="button" data-action="qa-close" aria-label="Close Mini Q&amp;A">${icon("x", CONFIG.ICON_SIZE.lg)}</button></div></div>
    <ul class="qa-list" id="qa-list">${qaListHtml()}</ul>
    <form class="form qa-form" id="qa-form" novalidate><div class="form__row"><input class="input" name="name" placeholder="Your name" aria-label="Your name">
    <input class="input" name="team" placeholder="Team name" aria-label="Team name"></div>
    <div class="qa-form__send"><input class="input" name="text" placeholder="Ask the speaker a question..." aria-label="Your question">
    <button class="qa-form__submit" aria-label="Send question">${icon("send", CONFIG.ICON_SIZE.lg)}</button></div><p class="form-error" id="qa-error" role="alert"></p></form></section>`;
}
function setQA(open) {
  STATE.qaOpen = open;
  DOM.qaWidget.classList.toggle(CONFIG.CLASS.open, open);
  DOM.qaOpen.setAttribute("aria-expanded", open);
  if (open) requestAnimationFrame(() => DOM.qaClose.focus());
  else DOM.qaOpen.focus();
}

/* ========== 8. ACTIONS (what happens on click / change / input / key / submit) ========== */
function go(pageId) {
  Object.assign(STATE, { page: pageId, notice: "", eventNote: "" });
  drawNav();
  drawPageHeader();
  drawPage();
}
// "Nov 10 - Nov 12, 2026", or just "Nov 10, 2026" when it starts and ends on the same day.
function dateRange(a, b) {
  const md = { month: "short", day: "numeric" },
    f = (d, o) => d.toLocaleDateString("en-US", o);
  return a.toDateString() === b.toDateString() ? f(a, { ...md, year: "numeric" }) : `${f(a, md)} - ${f(b, { ...md, year: "numeric" })}`;
}
function handleEventForm(f) {
  const name = f.get("name").trim(),
    short = f.get("short").trim() || name,
    image = f.get("image").trim(),
    err = DOM.eventError;
  if (!name || !f.get("start") || !f.get("due")) { err.textContent = "Please add an event name, a start time and a code freeze time."; return; }
  const start = new Date(f.get("start")),
    due = new Date(f.get("due"));
  if (due <= start) { err.textContent = "The code freeze must be after the event starts."; return; }
  if (due <= Date.now()) { err.textContent = "The code freeze must be in the future."; return; }
  if (image && !/^https?:\/\//i.test(image)) { err.textContent = "The banner link must start with https://"; return; }
  const e = {
    id: "ev-" + Date.now().toString(36),
    custom: true,
    name,
    short,
    date: dateRange(start, due),
    tag: f.get("tag").trim() || "Upcoming event",
    place: f.get("place").trim() || "Location to be announced",
    open: true,
    startAt: start.toISOString(),
    dueAt: due.toISOString(),
    image: image || bannerSvg(),
    summary: f.get("summary").trim(),
    tracks: f.get("tracks").split(",").map((t) => t.trim()).filter(Boolean).slice(0, CONFIG.LIMITS.maxTracks),
  };
  STATE.events.push(e);
  saveEvents();
  STATE.eventNote = `${short} is published for ${e.date}. It is now in the event switcher in the sidebar.`;
  drawAll();
}
function handleQuestionForm(form) {
  const f = new FormData(form),
    name = f.get("name").trim(),
    team = f.get("team").trim(),
    text = f.get("text").trim();
  if (!name || !team || !text) { DOM.qaError.textContent = "Please fill in your name, your team and your question."; return; }
  STATE.questions.push({ id: Date.now(), name, team, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), pinned: false, votes: 0 });
  DOM.qaList.innerHTML = qaListHtml();
  DOM.qaCount.textContent = STATE.questions.length + " questions";
  DOM.qaList.scrollTop = DOM.qaList.scrollHeight;
  form.reset();
  DOM.qaError.textContent = "";
}
const toggleIn = (list, v) => (list.includes(v) ? list.filter((i) => i !== v) : [...list, v]);

// Click actions, keyed by the data-action attribute in the HTML. Each receives data-value.
const CLICK_ACTIONS = {
  nav: (v) => go(v),
  "qa-open": () => setQA(true),
  "qa-close": () => setQA(false),
  "broadcast-close": () => {
    STATE.broadcastDismissed = true;
    setHidden(DOM.broadcast, true);
  },
  filter: (v) => {
    STATE.filter = v;
    drawPage();
  },
  reserve: (v) => {
    if (!STATE.loggedIn) STATE.notice = "Please log in or register first (use \u201CLog in & registration\u201D in the menu).";
    else {
      STATE.notice = "";
      STATE.reserved = toggleIn(STATE.reserved, +v);
    }
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
  book: (v) => {
    STATE.booked = toggleIn(STATE.booked, v);
    drawPage();
  },
  "auth-mode": (v) => {
    STATE.authMode = v;
    drawPage();
  },
  "auth-toggle": () => {
    if (STATE.loggedIn) {
      signOut();
      drawAll();
    } else go("auth");
  },
  theme: () => {
    STATE.theme = STATE.theme === "dark" ? "light" : "dark";
    DOM.root.dataset.theme = STATE.theme;
  },
  "fill-demo": (v) => {
    DOM.authForm.elements.email.value = v;
    DOM.authForm.elements.password.value = CONFIG.AUTH.demoPassword;
  },
  "update-banner": () => {
    const url = DOM.bannerUrl.value.trim();
    if (!url) return;
    updateEvent({ image: url });
    STATE.notice = "Banner updated.";
    drawBanner();
    drawPage();
  },
  "update-broadcast": () => {
    updateEvent({ note: DOM.broadcastText.value.trim() });
    STATE.broadcastDismissed = false;
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
};
// Change actions, keyed by the data-change attribute.
const CHANGE_ACTIONS = {
  event: (el) => {
    Object.assign(STATE, { eventId: el.value, notice: "", eventNote: "" });
    drawAll();
  },
  due: (el) => {
    if (!el.value) return;
    updateEvent({ dueAt: new Date(el.value).toISOString() });
    drawPageHeader();
  },
  open: (el) => {
    updateEvent({ open: el.checked });
    drawPageHeader();
  },
};

function onClick(x) {
  const btn = x.target.closest("[data-action]");
  const run = btn && CLICK_ACTIONS[btn.dataset.action];
  if (run) run(btn.dataset.value);
}
function onChange(x) {
  const el = x.target,
    run = CHANGE_ACTIONS[el.dataset.change];
  if (run) run(el);
  else if (el.name === "role" && el.form === DOM.authForm) setHidden(DOM.codeBox, el.value !== "superadmin"); // code box only for Super Admin
}
function onInput(x) {
  const team = x.target.dataset.score;
  if (team) STATE.scores[team] = Math.min(CONFIG.LIMITS.scoreMax, Math.max(CONFIG.LIMITS.scoreMin, Number(x.target.value)));
}
function onKeydown(x) {
  if (x.key === "Escape" && STATE.qaOpen) return setQA(false);
  if (/INPUT|TEXTAREA|SELECT/.test(x.target.tagName) || x.ctrlKey || x.metaKey || x.altKey) return;
  const item = navItems()[Number(x.key) - 1]; // shortcut: press 1, 2, 3... to open that menu item
  if (item) go(item.id);
}
function onSubmit(x) {
  x.preventDefault();
  const form = x.target;
  if (form === DOM.qaForm) handleQuestionForm(form);
  else if (form === DOM.authForm) handleAuth(new FormData(form));
  else if (form === DOM.eventForm) handleEventForm(new FormData(form));
}

/* ========== 9. init() : the only place the app starts and listeners attach ========== */
function init() {
  STATE.events = loadEvents();
  STATE.sessions = buildSessions();
  DOM.root.dataset.theme = STATE.theme;

  DOM.root.addEventListener("click", onClick);
  DOM.root.addEventListener("change", onChange);
  DOM.root.addEventListener("input", onInput);
  DOM.root.addEventListener("keydown", onKeydown);
  DOM.root.addEventListener("submit", onSubmit);

  drawQA();
  drawAll();
  setInterval(tick, CONFIG.TICK_INTERVAL_MS);
  initAccounts().then(drawAll).catch(drawAll); // load accounts, restore a saved login, then redraw
}
init();
