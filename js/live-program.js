"use strict";
/* Author: NkosinathiM-ship */
/* This file controls what the page does.
   1. Settings
   2. Style state names
   3. Page data
   4. Current app state
   5. HTML parts
   6. Small helper functions
   7. Saving data and accounts
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
    publicNotices: "portal-public-notices-v1",
    privateNotices: "portal-notice-board-v1",
    mealSchedule: "portal-coder-meal-schedule-v1",
    teamResources: "portal-team-resources-v1",
    judgingScores: "portal-judging-scores-v1",
    accounts: "portal-accounts-v1",
    session: "portal-session-v1",
    mentorRequests: "portal-mentor-requests-v1",
    mentorPresencePrefix: "portal-mentor-presence-v1:",
  },
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
  { id: "notices", label: "Notice Board", hint: "Daily meals and public announcements" },
  { id: "mentors", label: "Mentor 1-on-1 hub", hint: "Get help from an expert" },
  { id: "teams", label: "Team directory", hint: "See all teams" },
  { id: "judging", label: "Judging portal", hint: "Score the projects" },
  { id: "admin", label: "Super Admin console", hint: "Banner, countdown, controls" },
  { id: "auth", label: "Log in & registration", hint: "Sign in or create an account" },
];
// This shows which menus each account role can open.
const ALLOWED = {
  guest: ["live", "notices", "auth"],
  attendee: ["live", "notices", "auth"],
  mentor: ["live", "notices", "mentors", "auth"],
  team: ["live", "notices", "mentors", "teams", "auth"],
  judge: ["live", "notices", "judging", "auth"],
  superadmin: ["live", "notices", "mentors", "teams", "judging", "admin", "auth"],
};
const TYPES = ["All", "Main Stage", "Workshop Lab", "Mentor Pit", "Lightning Talks"];
const MENTOR_PRESENCE_TTL_MS = 30000;
const MENTOR_PRESENCE_INTERVAL_MS = 10000;
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
let mentorChannel = null;
let mentorPresenceEmail = "";
const MEALS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "dinner", label: "Dinner" },
];
const DEFAULT_MEAL_SCHEDULE = Object.fromEntries(MEALS.map(({ id }) => [id, { time: "", details: "" }]));
const DEFAULT_TEAM_RESOURCES = [
  { id: "mdn", title: "MDN Web Docs", description: "Beginner-friendly lessons for HTML, CSS and JavaScript.", url: "https://developer.mozilla.org/en-US/docs/Learn", badge: "⌘", tone: "violet" },
  { id: "w3schools", title: "W3Schools", description: "Simple examples to practise web development basics.", url: "https://www.w3schools.com/", badge: "W3", tone: "green" },
  { id: "owasp", title: "OWASP Top 10", description: "Common web application security risks.", url: "https://owasp.org/www-project-top-ten/", badge: "OW", tone: "amber" },
  { id: "github", title: "GitHub Guides", description: "Learn how to save code and collaborate as a team.", url: "https://docs.github.com/en/get-started", badge: "⌘", tone: "dark" },
  { id: "vscode", title: "Visual Studio Code", description: "Editor setup, extensions and beginner documentation.", url: "https://code.visualstudio.com/docs", badge: "VS", tone: "violet" },
];

// A sample banner picture until a real photo is added.
const placeholderBanner = () =>
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e2028"/><stop offset="1" stop-color="#0d0e12"/></linearGradient></defs><rect width="1600" height="420" fill="url(#s)"/><g fill="#fff" fill-opacity=".07"><ellipse cx="620" cy="40" rx="110" ry="34"/><ellipse cx="540" cy="52" rx="70" ry="26"/><ellipse cx="1330" cy="50" rx="80" ry="26"/><ellipse cx="300" cy="70" rx="60" ry="20"/></g><path d="M0 420V330C200 250 380 250 560 330S900 300 1020 250 1300 300 1600 330V420Z" fill="#2a151b"/><path d="M0 420V360C150 280 330 290 470 350S720 380 820 340 1200 250 1400 310 1560 340 1600 350V420Z" fill="#121318"/></svg>',
  );
/* ==========================================================================
   4. STATE: everything that can change
   ========================================================================== */
const STATE = {
  events: loadEvents(),
  keynotes: loadKeynotes(), // { add: [], del: [], mod: {} }
  accounts: [],
  eventId: "",
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
  publicNotices: loadNotices(CONFIG.storage.publicNotices),
  privateNotices: loadNotices(CONFIG.storage.privateNotices),
  mealSchedule: loadMealSchedule(),
  teamResources: loadTeamResources(),
  mentorNotice: "",
  mentorHubSignature: "",
  publicNoticeNote: "",
  privateNoticeNote: "",
  editingPublicNoticeId: null,
  editingPrivateNoticeId: null,
  deletePublicNoticeId: null,
  deletePrivateNoticeId: null,
  mealScheduleNote: "",
  teamResourceNote: "",
  judgingFilter: "all",
  judgingCategory: "All",
  judgingSearch: "",
  judgingTeamId: "",
  draggingResourceId: null,
  evNote: "",
  reserved: [],
  scores: {},
  voted: [],
  questions: [],
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
STATE.eventId = STATE.events[0]?.id || "";


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
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved)) return saved.filter((event) => event && event.custom === true && typeof event.id === "string");
    }
  } catch (e) {
    /* storage blocked */
  }
  return [];
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
    if (r && typeof r === "object" && Array.isArray(r.add))
      return { add: r.add, del: [], mod: {} };
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
function loadNotices(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter(
      (notice) =>
        notice &&
        typeof notice.id === "string" &&
        typeof notice.title === "string" &&
        typeof notice.message === "string" &&
        typeof notice.createdAt === "string" &&
        !Number.isNaN(new Date(notice.createdAt).getTime()),
    );
  } catch {
    return [];
  }
}
function saveNotices(key, notices) {
  try {
    localStorage.setItem(key, JSON.stringify(notices));
    return true;
  } catch {
    return false;
  }
}
function loadMealSchedule() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.storage.mealSchedule) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return { ...DEFAULT_MEAL_SCHEDULE };
    return Object.fromEntries(
      MEALS.map(({ id }) => {
        const meal = saved[id] && typeof saved[id] === "object" ? saved[id] : {};
        const time = typeof meal.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(meal.time) ? meal.time : "";
        return [id, { time, details: typeof meal.details === "string" ? meal.details : "" }];
      }),
    );
  } catch {
    return { ...DEFAULT_MEAL_SCHEDULE };
  }
}
function saveMealSchedule() {
  try {
    localStorage.setItem(CONFIG.storage.mealSchedule, JSON.stringify(STATE.mealSchedule));
    return true;
  } catch {
    return false;
  }
}
function isSafeResourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
function loadTeamResources() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.storage.teamResources) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved).map(([eventId, resources]) => [
        eventId,
        Array.isArray(resources)
          ? resources
              .filter(
                (resource) =>
                resource &&
                typeof resource.id === "string" &&
                typeof resource.title === "string" &&
                typeof resource.description === "string" &&
                typeof resource.badge === "string" &&
                isSafeResourceUrl(resource.url),
            )
            .map((resource) => ({
              ...resource,
              tone: ["violet", "green", "amber", "dark"].includes(resource.tone) ? resource.tone : "violet",
            }))
          : [],
      ]),
    );
  } catch {
    return {};
  }
}
function saveTeamResources() {
  try {
    localStorage.setItem(CONFIG.storage.teamResources, JSON.stringify(STATE.teamResources));
    return true;
  } catch {
    return false;
  }
}
const resourcesForEvent = (eventId = STATE.eventId) =>
  eventId ? STATE.teamResources[eventId] || DEFAULT_TEAM_RESOURCES : DEFAULT_TEAM_RESOURCES;
function persistTeamResources(eventId, resources, message) {
  const previous = STATE.teamResources;
  STATE.teamResources = { ...previous, [eventId]: resources };
  if (!saveTeamResources()) {
    STATE.teamResources = previous;
    STATE.teamResourceNote = "Unable to save team resources. Browser storage is unavailable.";
  } else {
    STATE.teamResourceNote = message;
  }
  drawPage();
}
function updateEvent(patch) {
  const event = currentEvent();
  if (!event) return false;
  Object.assign(event, patch);
  saveEvents();
  return true;
}

const allSessions = () => STATE.keynotes.add;
// Sessions still to come or happening now, for the chosen event and topic pill.
const sessionsNow = () => {
  if (!currentEvent()) return [];
  const now = Date.now(),
    topic = (STATE.topic || "").toLowerCase();
  return allSessions()
    .filter((s) => (!s.ev || s.ev === STATE.eventId) && s.end > now)
    .filter((s) => !topic || (s.topics || []).some((t) => t.toLowerCase() === topic))
    .map((s) => ({ ...s, live: s.badge === "off" ? false : s.badge === "live" ? true : s.start <= now }));
};
const sessionsSignature = () => sessionsNow().map((s) => s.id + (s.live ? "L" : "")).join();

/* ---- ACCOUNTS: loaded from the shared sign-in page's browser storage ---- */
function saveAccounts() {
  try {
    localStorage.setItem(CONFIG.storage.accounts, JSON.stringify(STATE.accounts));
  } catch (e) {
    /* storage blocked */
  }
}
// Signing in fixes the role to the one on the account.
function signIn(user) {
  STATE.user = user;
  STATE.role = user.role;
  STATE.loggedIn = true;
  clearGuestAccess();
  if (window.location.pathname.toLowerCase().endsWith("judging-portal.html")) {
    STATE.page = "judging";
  } else if (!window.location.pathname.toLowerCase().endsWith("team-directory.html")) {
    const hashPage = window.location.hash.replace(/^#/, "");
    STATE.page = hashPage && MENU.some((item) => item.id === hashPage) ? hashPage : "live";
  } else {
    STATE.page = "teams";
  }
  try {
    localStorage.setItem(CONFIG.storage.session, user.email);
  } catch (e) {
    /* ignore */
  }
  updateMentorPresence();
}
function signOut() {
  clearMentorPresence();
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
function isGuestAccess() {
  return new URLSearchParams(window.location.search).get("access") === "guest";
}
function clearGuestAccess() {
  if (!isGuestAccess()) return;
  const url = new URL(window.location.href);
  url.searchParams.delete("access");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}
function guardJudgingAccess() {
  if (!window.location.pathname.toLowerCase().endsWith("judging-portal.html")) return true;
  if (!STATE.loggedIn) {
    window.location.replace("index.html");
    return false;
  }
  if (STATE.role !== "judge" && STATE.role !== "superadmin") {
    window.location.replace("live-program.html");
    return false;
  }
  return true;
}

async function initAccounts() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(CONFIG.storage.accounts)) || [];
  } catch (e) {
    /* ignore */
  }
  STATE.accounts = Array.isArray(saved)
    ? saved.filter((account) => account && typeof account.email === "string")
    : [];
  saveAccounts();
  if (isGuestAccess()) return;
  try {
    const user = STATE.accounts.find((a) => a.email === localStorage.getItem(CONFIG.storage.session));
    if (user) signIn(user); // keep people signed in after a refresh
  } catch (e) {
    /* ignore */
  }
}
function loadMentorRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG.storage.mentorRequests) || "[]");
    return Array.isArray(saved)
      ? saved.filter((request) => request && typeof request.id === "string" &&
        typeof request.mentorEmail === "string" && typeof request.teamEmail === "string" &&
        ["pending", "accepted"].includes(request.status) && Array.isArray(request.messages))
      : [];
  } catch {
    return [];
  }
}
function saveMentorRequests(requests) {
  try {
    localStorage.setItem(CONFIG.storage.mentorRequests, JSON.stringify(requests));
    mentorChannel?.postMessage({ type: "updated" });
    return true;
  } catch {
    return false;
  }
}
function updateMentorPresence() {
  if (!STATE.loggedIn || STATE.role !== "mentor") return;
  try {
    localStorage.setItem(
      `${CONFIG.storage.mentorPresencePrefix}${TAB_ID}`,
      JSON.stringify({ email: STATE.user.email, updatedAt: Date.now() }),
    );
    if (mentorPresenceEmail !== STATE.user.email.toLowerCase()) {
      mentorChannel?.postMessage({ type: "updated" });
      mentorPresenceEmail = STATE.user.email.toLowerCase();
    }
    STATE.mentorNotice = "";
  } catch {
    STATE.mentorNotice = "Unable to update online status because browser storage is unavailable.";
  }
}
function clearMentorPresence() {
  try {
    localStorage.removeItem(`${CONFIG.storage.mentorPresencePrefix}${TAB_ID}`);
    mentorChannel?.postMessage({ type: "updated" });
    mentorPresenceEmail = "";
  } catch {
    STATE.mentorNotice = "Unable to clear online status because browser storage is unavailable.";
  }
}
function onlineMentors() {
  const active = new Set();
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(CONFIG.storage.mentorPresencePrefix)) continue;
      const presence = JSON.parse(localStorage.getItem(key) || "null");
      if (!presence || !Number.isFinite(Number(presence.updatedAt)) ||
        Date.now() - Number(presence.updatedAt) > MENTOR_PRESENCE_TTL_MS) {
        localStorage.removeItem(key);
        index -= 1;
        continue;
      }
      if (typeof presence.email === "string") active.add(presence.email.toLowerCase());
    }
  } catch {
    STATE.mentorNotice = "Unable to read mentor availability because browser storage is unavailable.";
  }
  return STATE.accounts.filter((account) =>
    account.role === "mentor" && active.has(account.email.toLowerCase()),
  );
}
function mentorRequests() {
  return loadMentorRequests();
}
function mentorHubDataSignature() {
  return JSON.stringify({
    mentors: onlineMentors().map((account) => account.email.toLowerCase()).sort(),
    requests: mentorRequests(),
  });
}
function syncMentorHub() {
  const signature = mentorHubDataSignature();
  if (signature === STATE.mentorHubSignature) return;
  STATE.mentorHubSignature = signature;
  if (STATE.page === "mentors") drawPage();
}
function announceMentorHubChange() {
  mentorChannel?.postMessage({ type: "updated" });
  syncMentorHub();
}
/* ==========================================================================
   8. RENDERERS: each function fills one part of the screen
   ========================================================================== */
// Drawing rule: keep data-action and data-change names the same as the names used in onClick and onChange.
function drawSidebar() {
  const name = STATE.loggedIn ? STATE.user.name : "Guest";
  const eventOptions = STATE.events.length
    ? STATE.events.map((x) => `<option value="${x.id}"${x.id === STATE.eventId ? " selected" : ""}>${esc(x.short)}</option>`).join("")
    : '<option value="" selected disabled>No events yet</option>';
  DOM.sidebar.innerHTML = `<div class="sidebar__logo"><img class="sidebar__logo-img" src="${CONFIG.logoSrc}" alt="Limpopo Dev Ecosystem"></div>
    <div class="sidebar__user"><span class="sidebar__avatar" aria-hidden="true">${esc(name.charAt(0).toUpperCase())}</span><span class="sidebar__text"><b class="sidebar__name">${esc(name)}</b><small class="sidebar__role">${ROLES[STATE.role]}</small></span></div>
    <div class="sidebar__main"><div class="sidebar__event">${svg("layers", 20)}<div class="sidebar__text sidebar__text--grow"><span class="sidebar__event-label text-label">Event</span><select class="sidebar__select" data-change="event" aria-label="Choose an event"${STATE.events.length ? "" : " disabled"}>${eventOptions}</select></div></div></div>
    <div class="sidebar__footer">
      <button class="sidebar__item" data-action="theme" aria-label="Switch between light and dark mode"><span class="theme-icon"><span class="theme-icon__glyph theme-icon__glyph--sun">${svg("sun", 20)}</span><span class="theme-icon__glyph theme-icon__glyph--moon">${svg("moon", 20)}</span></span><span class="sidebar__text"><span class="sidebar__switch-text--to-light">Switch to light</span><span class="sidebar__switch-text--to-dark">Switch to dark</span></span></button>
      <button class="sidebar__item" data-action="auth-toggle">${svg(STATE.loggedIn ? "out" : "auth", 20)}<span class="sidebar__text">${STATE.loggedIn ? "Log out" : "Log in / Register"}</span></button>
    </div>`;
}

// Show the items allowed for this role.
function drawNav() {
  DOM.topNav.innerHTML = `<ul class="top-nav__list">${navItems()
    .map(
      (m) => {
        const canOpen = can(STATE.role, m.id);
        const title = canOpen ? m.hint : "Available to Super Admins only";
        return `<li class="top-nav__item"><button class="top-nav__link${withClass(STATE.page === m.id, CLS.active)}${withClass(!canOpen, "is-disabled")}" data-action="nav" data-value="${m.id}" title="${title}" aria-label="${esc(m.label)}"${canOpen ? "" : ' disabled aria-disabled="true"'}${STATE.page === m.id ? ' aria-current="page"' : ""}><span class="top-nav__icon">${svg(m.id, 18)}</span><span class="top-nav__label">${m.label}</span></button></li>`;
      },
    )
    .join("")}</ul>`;
}

function drawTop() {
  const e = currentEvent();
  DOM.pageHeader.innerHTML = `<div class="page-header__toolbar"><h2 class="page-header__title">${MENU.find((m) => m.id === STATE.page).label}</h2>
    <div class="cluster"><span class="pill${withClass(e && e.open, "pill--ok")}" id="submissionBadge" aria-live="polite">${e ? `${svg(e.open ? "unlock" : "lock", 12)} ${e.open ? "Submissions open" : "Submissions closed"}` : "No event published"}</span></div></div>
    <div class="countdown" id="countdownRow"><div class="countdown__units" id="countdown" role="timer" aria-label="${e ? "Time left until code freeze" : "No event schedule"}"></div>
    <div class="countdown__target"><span class="countdown__target-label">Time</span><span class="countdown__target-time">${e ? clock24(new Date(e.dueAt)) : "Not scheduled"}</span><span class="countdown__target-label countdown__caption" id="freezeCaption">${e ? "Code freeze" : "No event selected"}</span></div></div>`;
  STATE.wasFrozen = null; // a freshly drawn page never plays the lockdown animation by itself
  tick();
}

function drawBanner() {
  const e = currentEvent(),
    custom = e && !e.image.startsWith("data:"), // the Super Admin can swap in their own photo
    changeButton = STATE.role === "superadmin" ? `<button class="btn btn--primary banner__action" data-action="nav" data-value="admin">Change program banner</button>` : "";
  DOM.banner.className = "banner";
  DOM.banner.style.setProperty(
    "--banner-image",
    e && custom ? `var(--banner-overlay), url("${e.image.replace(/"/g, "%22")}")` : `url("${placeholderBanner()}")`,
  );
  DOM.banner.innerHTML = `<div class="banner__inner"><div class="banner__top"><span class="banner__chip text-mono">${esc(e ? e.place : "Event workspace")}</span>${changeButton}</div>
    <h1 class="banner__title">${esc(e ? e.name : "No event has been published")}</h1>
    ${e ? (e.summary ? `<p class="banner__summary">${esc(e.summary)}</p>` : "") : "<p class=\"banner__summary\">Create an event in the Super Admin console to publish its details.</p>"}
    <div class="cluster">${e ? `<span class="pill">${esc(e.date)}</span><span class="text-mono">${esc(e.tag)}</span>` : ""}</div></div>`;
  bannerMetrics();
}

// BROADCAST BAR: shows how long is left. Can be dismissed with the X.
function drawBroadcast() {
  show(DOM.broadcast, !STATE.bcastOff);
  DOM.broadcast.innerHTML = `<i class="broadcast__dot"></i><b>Broadcast:</b>${svg("alert", 16)}<span class="broadcast__viewport"><span class="broadcast__track"><span class="broadcast__message" id="broadcastMessage"></span><span class="broadcast__message broadcast__message--copy" aria-hidden="true"></span></span></span><button class="broadcast__close" data-action="broadcast-close" aria-label="Close this message">${svg("x", 16)}</button>`;
}
function setBroadcastText(text) {
  const message = DOM.broadcastMessage;
  if (!message) return;
  message.textContent = text;
  const copy = message.nextElementSibling;
  if (copy) copy.textContent = text;
  measureBroadcastTicker();
}
function measureBroadcastTicker() {
  const message = DOM.broadcastMessage;
  const track = message?.parentElement;
  const viewport = track?.parentElement;
  if (!message || !track || !viewport) return;
  track.classList.toggle("is-scrolling", message.scrollWidth > viewport.clientWidth + 1);
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
  if (!STATE.questions.length) return '<li class="qa__item empty-state u-text-soft">No questions yet. Be the first to ask.</li>';
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
  return list.length
    ? list.map(sessionCard).join("")
    : `<p class="empty-state u-text-soft">${STATE.events.length ? "No sessions in this view yet." : "No events have been published yet."}</p>`;
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
    ${mine.length ? `<div><p class="text-label u-text-soft">Published events</p>${mine.map((x) => `<div class="admin-list__item admin-list__item--event"><span><b>${esc(x.short)}</b> <span class="u-text-soft">${esc(x.date)}</span></span><button class="btn admin-action" type="button" data-action="remove-event" data-value="${x.id}">${svg("trash", 16)} Remove</button></div>`).join("")}</div>` : '<p class="empty-state u-text-soft">No events have been published yet.</p>'}</section>`;
}

// The Super Admin can add, edit, or delete keynotes.
function keynotePanelHtml() {
  const e = currentEvent();
  if (!e) return `<section class="panel panel--narrow admin-grid__item admin-grid__item--keynotes"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("mic", 21)}</span><h3>Event program</h3></div><p class="empty-state u-text-soft">Publish an event before adding keynotes.</p></section>`;
  const now = Date.now(),
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

function noticeManagementPanelHtml(board) {
  const isPublic = board === "public",
    notices = isPublic ? STATE.publicNotices : STATE.privateNotices,
    editingId = isPublic ? STATE.editingPublicNoticeId : STATE.editingPrivateNoticeId,
    deleteId = isPublic ? STATE.deletePublicNoticeId : STATE.deletePrivateNoticeId,
    editing = notices.find((notice) => notice.id === editingId),
    sorted = [...notices].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    prefix = isPublic ? "public" : "private",
    label = isPublic ? "Public" : "Private",
    note = isPublic ? STATE.publicNoticeNote : STATE.privateNoticeNote;
  return `<section class="panel panel--narrow admin-grid__item admin-grid__item--notices"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg(isPublic ? "notices" : "teams", 21)}</span><h3>${editing ? "Edit" : "Manage"} ${label} Notice Board</h3></div>
    <p class="u-text-soft">${isPublic ? "Announcements appear on the public Notice Board for every account." : "Team notices appear only inside the Team Directory."}</p>
    <form class="form" id="${prefix}NoticeForm" novalidate>
      <label class="field">Title<input class="input" name="title" required maxlength="120" placeholder="${isPublic ? "e.g. Welcome, coders!" : "e.g. Team stand-up moved to 10:00"}" value="${esc(editing ? editing.title : "")}"></label>
      <label class="field">Message<textarea class="input" name="message" required rows="4" placeholder="Share the details people need to know.">${esc(editing ? editing.message : "")}</textarea></label>
      <p class="form__error" id="${prefix}NoticeError" role="alert"></p>
      <div class="cluster"><button class="btn btn--primary">${svg(editing ? "edit" : "send", 17)} ${editing ? "Save changes" : "Publish notice"}</button>${editing ? `<button class="btn" type="button" data-action="${prefix}-notice-cancel">${svg("x", 16)} Cancel</button>` : ""}</div>
    </form>
    ${note ? `<p class="notice" role="status">${esc(note)}</p>` : ""}
    ${sorted.length ? `<div><p class="text-label u-text-soft">Published ${label.toLowerCase()} notices</p>${sorted.map((notice) => `<div class="admin-list__item"><span class="admin-list__info"><b>${esc(notice.title)}</b><br><span class="u-text-soft">${esc(notice.message)}</span></span>
      <span class="admin-list__actions"><button class="btn admin-action" type="button" data-action="${prefix}-notice-edit" data-value="${esc(notice.id)}">${svg("edit", 16)} Edit</button><button class="btn admin-action admin-action--danger" type="button" data-action="${prefix}-notice-delete" data-value="${esc(notice.id)}">${svg("trash", 16)} ${deleteId === notice.id ? "Confirm delete" : "Delete"}</button></span></div>`).join("")}</div>` : `<p class="u-text-soft">No ${label.toLowerCase()} notices have been published yet.</p>`}</section>`;
}

function mealSchedulePanelHtml() {
  return `<section class="panel panel--narrow admin-grid__item admin-grid__item--meal-schedule"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("cal", 21)}</span><h3>Coder Meal Schedule</h3></div>
    <p class="u-text-soft">Set the daily meal times and optional location or notes shown on the Public Notice Board.</p>
    <form class="form" id="mealScheduleForm" novalidate><div class="meal-schedule-admin">
      ${MEALS.map(({ id, label }) => `<fieldset class="meal-schedule-admin__item"><legend>${label}</legend><label class="field">${label} time<input class="input" type="time" name="${id}Time" value="${esc(STATE.mealSchedule[id].time)}"></label><label class="field">Location or notes<input class="input" name="${id}Details" placeholder="Optional" value="${esc(STATE.mealSchedule[id].details)}"></label></fieldset>`).join("")}
    </div><p class="form__error" id="mealScheduleError" role="alert"></p><button class="btn btn--primary">${svg("send", 17)} Save meal schedule</button></form>
    ${STATE.mealScheduleNote ? `<p class="notice" role="status">${esc(STATE.mealScheduleNote)}</p>` : ""}</section>`;
}

function teamResourcesPanelHtml() {
  const event = currentEvent();
  if (!event)
    return `<section class="panel panel--narrow admin-grid__item admin-grid__item--resources"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("layers", 21)}</span><h3>Team Resources Management</h3></div><p class="empty-state u-text-soft">Publish or select an event to manage its team resources.</p></section>`;
  const resources = resourcesForEvent(event.id);
  return `<section class="panel panel--narrow admin-grid__item admin-grid__item--resources"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("layers", 21)}</span><h3>Team Resources Management</h3></div>
    <p class="u-text-soft">Changes apply to <strong class="u-text-strong">${esc(event.short)}</strong> and appear in that event's Team Directory. Drag rows to reorder them, or use the arrow buttons.</p>
    <form class="form" id="teamResourceForm" novalidate>
      <label class="field">Title<input class="input" name="title" required maxlength="100" placeholder="e.g. Project documentation"></label>
      <label class="field">Description<input class="input" name="description" required maxlength="240" placeholder="A short explanation of this resource"></label>
      <label class="field">URL<input class="input" type="url" name="url" required placeholder="https://example.com"></label>
      <label class="field">Icon / badge text<input class="input" name="badge" required maxlength="8" placeholder="e.g. DOC"></label>
      <p class="form__error" id="teamResourceError" role="alert"></p>
      <button class="btn btn--primary">${svg("plus", 17)} Add resource</button>
    </form>
    ${STATE.teamResourceNote ? `<p class="notice" role="status">${esc(STATE.teamResourceNote)}</p>` : ""}
    ${resources.length ? `<ol class="resource-admin-list" id="teamResourceAdminList" aria-label="Team resources for ${esc(event.short)}">${resources.map((resource, index) => `<li class="resource-admin-row" draggable="true" data-resource-id="${esc(resource.id)}">
      <button class="resource-admin-grip" type="button" aria-label="Drag ${esc(resource.title)} to reorder">⠿</button><span class="directory-resource-icon directory-resource-icon--${esc(resource.tone || "violet")}">${esc(resource.badge)}</span>
      <span class="resource-admin-row__info"><strong>${esc(resource.title)}</strong><small>${esc(resource.description)}</small><small>${esc(resource.url)}</small></span>
      <span class="resource-admin-actions"><button class="btn admin-action" type="button" data-action="resource-move-up" data-value="${esc(resource.id)}" aria-label="Move ${esc(resource.title)} up"${index === 0 ? " disabled" : ""}>↑</button><button class="btn admin-action" type="button" data-action="resource-move-down" data-value="${esc(resource.id)}" aria-label="Move ${esc(resource.title)} down"${index === resources.length - 1 ? " disabled" : ""}>↓</button><button class="btn admin-action admin-action--danger" type="button" data-action="resource-delete" data-value="${esc(resource.id)}" aria-label="Delete ${esc(resource.title)}">${svg("trash", 16)} Delete</button></span>
    </li>`).join("")}</ol>` : '<p class="u-text-soft">No resources are configured for this event.</p>'}</section>`;
}

function publicNoticeBoardHtml() {
  const notices = [...STATE.publicNotices].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return `<div class="public-notice-board">
    <section class="directory-panel public-notice-board__panel">
      <div class="directory-section-heading"><div><p class="directory-eyebrow">FOR CODERS · DAILY</p><h1>Public Notice Board</h1></div><span class="directory-pill">Meal schedule</span></div>
      <p class="directory-notice-intro">Daily meal times for coders. Location and extra details are shown when available.</p>
      <div class="public-meal-schedule">${MEALS.map(({ id, label }) => {
        const meal = STATE.mealSchedule[id];
        return `<article class="public-meal"><span class="public-meal__icon">${svg("cal", 18)}</span><div><h2>${label}</h2><time${meal.time ? ` datetime="${esc(meal.time)}"` : ""}>${meal.time ? esc(meal.time) : "Time to be announced"}</time>${meal.details ? `<p>${esc(meal.details)}</p>` : ""}</div></article>`;
      }).join("")}</div>
    </section>
    <section class="directory-panel public-notice-board__panel">
      <div class="directory-section-heading"><div><p class="directory-eyebrow">LATEST UPDATES</p><h2>Public announcements</h2></div><span class="directory-pill">${notices.length} ${notices.length === 1 ? "notice" : "notices"}</span></div>
      ${notices.length ? `<div class="public-announcements">${notices.map((notice) => `<article><h3>${esc(notice.title)}</h3><p>${esc(notice.message)}</p><small>${esc(fmtWhen(new Date(notice.createdAt).getTime()))}</small></article>`).join("")}</div>` : '<p class="empty-state u-text-soft">No public announcements have been published yet.</p>'}
    </section>
  </div>`;
}

function teamResourceLinksHtml(resources) {
  return resources.length
    ? resources.map((resource) => `<a href="${esc(resource.url)}" target="_blank" rel="noopener"><span class="directory-resource-icon directory-resource-icon--${esc(resource.tone || "violet")}">${esc(resource.badge)}</span><span><strong>${esc(resource.title)}</strong><small>${esc(resource.description)}</small></span><b>↗</b></a>`).join("")
    : '<p class="empty-state u-text-soft">No team resources have been added for this event yet.</p>';
}

const cardGrid = (cards, spaced) => `<div class="card-grid${withClass(spaced, "card-grid--spaced")}">${cards}</div>`;

const directoryStorage = {
  get(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  },
};
const directoryTeams = () => directoryStorage.get("geekulchaExtraTeams").filter((x) => x && typeof x.name === "string");
const directoryMembers = () => directoryStorage.get("geekulchaExtraMembers").filter((x) => x && typeof x.name === "string");

const judgingStorage = {
  get() {
    try {
      const value = JSON.parse(localStorage.getItem(CONFIG.storage.judgingScores) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  },
  set(value) {
    try {
      localStorage.setItem(CONFIG.storage.judgingScores, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

const judgingTeamId = (team, index) => team.id || `directory-team-${team.number || index + 1}-${String(team.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
const judgingTeams = () => {
  const registered = directoryTeams().map((team, index) => ({
    ...team,
    id: judgingTeamId(team, index),
    category: typeof team.category === "string" && team.category.trim() ? team.category.trim() : "General",
  }));
  const accountTeams = STATE.accounts
    .filter((account) => account.role === "team")
    .map((account, index) => ({
      id: `account-team-${String(account.email).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      number: String(index + 1).padStart(2, "0"),
      name: account.team || account.name || account.email,
      role: "Registered team",
      category: "General",
    }));
  const seen = new Set(registered.map((team) => team.name.toLowerCase()));
  accountTeams.forEach((team) => {
    if (!seen.has(team.name.toLowerCase())) registered.push(team);
  });
  return registered;
};

function judgeId() {
  return STATE.user && STATE.user.email ? String(STATE.user.email).trim().toLowerCase() : "";
}

function ownJudgingScores() {
  const id = judgeId();
  return judgingStorage.get().filter((score) =>
    score &&
    score.eventId === STATE.eventId &&
    score.judgeId === id
  );
}

function ownScoreForTeam(teamId) {
  return ownJudgingScores().find((score) => score.teamId === teamId) || null;
}

function upsertOwnScore(teamId, criteria, feedback) {
  const id = judgeId();
  if (!id) return false;
  const all = judgingStorage.get();
  const now = new Date().toISOString();
  const existingIndex = all.findIndex((score) =>
    score &&
    score.eventId === STATE.eventId &&
    score.teamId === teamId &&
    score.judgeId === id
  );
  const existing = existingIndex >= 0 ? all[existingIndex] : null;
  const entry = {
    eventId: STATE.eventId,
    teamId,
    judgeId: id,
    criteria,
    total: Object.values(criteria).reduce((sum, value) => sum + Number(value || 0), 0),
    feedback: String(feedback || "").trim(),
    submittedAt: existing ? existing.submittedAt : now,
    updatedAt: now,
  };
  if (existingIndex >= 0) all[existingIndex] = entry;
  else all.push(entry);
  return judgingStorage.set(all);
}

// Used only by the Super Admin dashboard. This function reads no judge identity in rendering.
function judgingAggregateForAdmin(teamId) {
  const scores = judgingStorage.get().filter((score) =>
    score && score.eventId === STATE.eventId && score.teamId === teamId
  );
  const total = scores.reduce((sum, score) => sum + Number(score.total || 0), 0);
  return {
    judgeCount: scores.length,
    total,
    average: scores.length ? total / scores.length : 0,
  };
}

function teamDirectoryHtml() {
  const teams = directoryTeams(),
    members = directoryMembers(),
    notices = [...STATE.privateNotices].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    resources = resourcesForEvent(),
    event = currentEvent(),
    broadcastDismissed = (() => {
      try { return localStorage.getItem("geekulchaBroadcastDismissed") === "1"; } catch { return false; }
    })(),
    teamCount = teams.length,
    memberCount = members.length,
    savedTeams = [
      ...teams.map((team) => `<article class="team-row"><span class="team-badge badge-one">${String(team.number).padStart(2, "0")}</span><div><h4>${esc(team.name)}</h4><p>Project team</p><small>${esc(team.role)}</small></div><button class="remove-entry" type="button" data-action="directory-remove-team" data-value="${esc(team.number)}">Remove</button></article>`),
      ...members.map((member) => `<article class="team-row"><span class="team-badge badge-three">${esc(member.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase())}</span><div><h4>${esc(member.name)}</h4><p>${esc(member.team)} · ${esc(member.role)}</p><small>Team member</small></div><button class="remove-entry" type="button" data-action="directory-remove-member" data-value="${esc(member.name)}">Remove</button></article>`),
    ].join("");

  return `<div class="directory-hub">
    <section class="directory-welcome">
      <div><p class="directory-eyebrow">GEEKULCHA · PROJECT WORKSPACE</p><h1>Team directory<span>.</span></h1><p class="directory-subheading">Meet the people, follow the updates and find the tools that help us build together.</p></div>
      <div class="directory-welcome-mark" aria-hidden="true"><span>G</span><i>${String(teamCount).padStart(2, "0")}</i></div>
    </section>
    <section class="directory-stats" aria-label="Workspace overview">
      <article><span class="directory-stat-icon">${svg("teams", 18)}</span><div><strong>${teamCount}</strong><small>Project teams</small></div></article>
      <article><span class="directory-stat-icon">${svg("auth", 18)}</span><div><strong>${memberCount}</strong><small>Team members</small></div></article>
      <article><span class="directory-stat-icon">${svg("layers", 18)}</span><div><strong>${teamCount}</strong><small>Team work areas</small></div></article>
    </section>
    <div class="directory-main-grid">
      <div class="directory-primary">
        <section class="directory-panel" id="directory">
          <div class="directory-section-heading"><div><p class="directory-eyebrow">WORKSPACE DIRECTORY</p><h2>Project teams</h2></div><span class="directory-pill directory-pill--accent">${teamCount} teams</span></div>
          <p class="directory-section-intro">We make it easy for everyone to know who is involved, what each team does and who to contact.</p>
          <div class="directory-focus">${svg("spark", 18)}<p><strong>Our focus</strong><br>Keep the directory clear and up to date, show each team's responsibilities, and make the workspace welcoming for people who are new to technology.</p></div>
          <div class="directory-subheading"><h3>All project teams</h3><span id="directory-member-label">${memberCount} people · ${teamCount} teams</span></div>
          <div class="directory-other-teams">${savedTeams || '<p class="empty-state u-text-soft">No teams or members have been added yet.</p>'}</div>
          <div class="directory-actions"><button class="directory-button directory-button--primary" type="button" data-action="directory-open-team">＋ Register a team</button><button class="directory-button directory-button--secondary" type="button" data-action="directory-open-member">＋ Add a member</button></div>
        </section>
        <section class="directory-panel" id="directory-resources">
          <div class="directory-section-heading"><div><p class="directory-eyebrow">USEFUL LINKS</p><h2>Team resources</h2></div><span class="directory-quiet-label">Helpful tools &amp; guides</span></div>
          <div class="directory-resource-list">${teamResourceLinksHtml(resources)}</div>
        </section>
      </div>
      <aside class="directory-side">
        ${event && event.note && !broadcastDismissed ? `<section class="directory-panel directory-broadcast" id="directory-broadcast"><div class="directory-broadcast-heading"><span class="directory-live-dot"></span><p class="directory-eyebrow">PINNED BROADCAST</p><button class="directory-icon-button" type="button" data-action="directory-dismiss-broadcast" aria-label="Dismiss broadcast">×</button></div><h2>Event update</h2><p>${esc(event.note)}</p><div class="directory-broadcast-footer"><span>Organizer announcement</span><span>Stays until dismissed</span></div></section>` : ""}
        <section class="directory-panel" id="directory-notice-board"><div class="directory-section-heading"><div><p class="directory-eyebrow">INTERNAL TEAM UPDATES</p><h2>Private notice board</h2></div><span class="directory-pill">${notices.length} ${notices.length === 1 ? "notice" : "notices"}</span></div><p class="directory-notice-intro">Notices for teams in this directory.</p><div class="directory-schedule">
          ${notices.length ? notices.map((notice) => {
            const createdAt = new Date(notice.createdAt);
            return `<article><time class="directory-time" datetime="${esc(notice.createdAt)}">${Number.isNaN(createdAt.getTime()) ? "" : esc(createdAt.toLocaleDateString([], { month: "short", day: "numeric" }))}</time><span class="directory-timeline-dot" aria-hidden="true"></span><div><strong>${esc(notice.title)}</strong><p class="directory-notice-message">${esc(notice.message)}</p><small>${Number.isNaN(createdAt.getTime()) ? "" : `Posted ${esc(createdAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }))}`}</small></div></article>`;
          }).join("") : '<p class="empty-state u-text-soft">No notices have been published yet.</p>'}
        </div></section>
        <section class="directory-panel directory-help"><span class="directory-help-icon">${svg("mentors", 20)}</span><div><strong>Need a hand?</strong><p>Mentor listings will appear here when available.</p></div><button class="directory-button directory-button--primary" type="button" data-action="directory-open-help">Request</button></section>
      </aside>
    </div>
    ${directoryDialogsHtml()}
    <div class="directory-toast" id="directoryToast" role="status" aria-live="polite"></div>
  </div>`;
}

function directoryDialogsHtml() {
  const teams = directoryTeams();
  return `<dialog class="directory-dialog" id="directoryTeamDialog"><form id="directoryTeamForm" method="dialog">
      <div class="directory-dialog-heading"><div><p class="directory-eyebrow">WORKSPACE DIRECTORY</p><h2>Register a team</h2></div><button type="button" class="directory-icon-button" data-action="directory-close-dialog" aria-label="Close">×</button></div>
      <label>Team name<input name="teamName" required placeholder="e.g. Design team"></label><label>Team number<input name="teamNumber" required type="number" min="1" max="99" placeholder="e.g. 5"></label><label>Category / track<input name="teamCategory" required placeholder="e.g. AI, Robotics, Web"></label><label>Team responsibility<textarea name="teamRole" required rows="3" placeholder="What will this team work on?"></textarea></label><p class="directory-form-error" id="directoryTeamError" role="alert"></p><div class="directory-dialog-actions"><button type="button" class="directory-button directory-button--secondary" data-action="directory-close-dialog">Cancel</button><button class="directory-button directory-button--primary" type="submit">Save team</button></div><p class="directory-form-note">Saved in this browser only.</p>
    </form></dialog>
    <dialog class="directory-dialog" id="directoryMemberDialog"><form id="directoryMemberForm" method="dialog">
      <div class="directory-dialog-heading"><div><p class="directory-eyebrow">WORKSPACE DIRECTORY</p><h2>Add a member</h2></div><button type="button" class="directory-icon-button" data-action="directory-close-dialog" aria-label="Close">×</button></div>
      <label>Full name<input name="memberName" required placeholder="Enter their full name"></label><label>Team<select name="memberTeam" required${teams.length ? "" : " disabled"}><option value="" selected disabled>${teams.length ? "Choose a team" : "Register a team first"}</option>${teams.map((team) => `<option>${esc(team.name)}</option>`).join("")}</select></label><label>Role<input name="memberRole" required placeholder="e.g. Front-end developer"></label><div class="directory-dialog-actions"><button type="button" class="directory-button directory-button--secondary" data-action="directory-close-dialog">Cancel</button><button class="directory-button directory-button--primary" type="submit"${teams.length ? "" : " disabled"}>Add member</button></div><p class="directory-form-note">Saved in this browser only.</p>
    </form></dialog>
    <dialog class="directory-dialog" id="directoryHelpDialog"><form id="directoryHelpForm" method="dialog">
      <div class="directory-dialog-heading"><div><p class="directory-eyebrow">NEED HELP?</p><h2>Request help</h2></div><button type="button" class="directory-icon-button" data-action="directory-close-dialog" aria-label="Close">×</button></div>
      <label>Your name<input name="who" required placeholder="e.g. Thabo Mokoena"></label><fieldset><legend>What type of help do you need?</legend><div class="directory-help-options">${[
        ["tech", "Technical / coding", "Bugs, HTML, CSS, JavaScript"],
        ["reg", "Registration & login", "Sign-up, accounts, forms"],
        ["live", "Live programme", "Schedule, live event page"],
        ["security", "Security & research", "Passwords, data, OWASP"],
        ["other", "Something else", "Not sure where to start"],
      ].map(([id, label, hint]) => `<label><input type="radio" name="kind" value="${id}" required><span><strong>${label}</strong><small>${hint}</small></span></label>`).join("")}</div></fieldset>
      <label>What is happening? (optional)<textarea name="details" rows="3" placeholder="A short description helps the mentor prepare."></textarea></label><p class="directory-form-error" id="directoryHelpError" role="alert"></p><div class="directory-dialog-actions"><button type="button" class="directory-button directory-button--secondary" data-action="directory-close-dialog">Cancel</button><button class="directory-button directory-button--primary" type="submit">Find a mentor</button></div>
    </form></dialog>
    <dialog class="directory-dialog" id="directoryMentorDialog"><div class="directory-dialog-body"><div class="directory-dialog-heading"><div><p class="directory-eyebrow">MENTOR SUPPORT</p><h2>No mentors are listed yet</h2></div><button type="button" class="directory-icon-button" data-action="directory-close-dialog" aria-label="Close">×</button></div><p id="directoryMentorSummary" class="directory-mentor-summary"></p><p class="directory-mentor-hint">Contact an event organiser to request support.</p><div class="directory-dialog-actions"><button type="button" class="directory-button directory-button--secondary" data-action="directory-close-dialog">Close</button></div></div></dialog>`;
}
function judgingPortalHtml() {
  if (STATE.role === "superadmin") {
    const judges = STATE.accounts
      .filter((account) => account && account.role === "judge" && typeof account.email === "string")
      .sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email)));
    return `<div class="judging-portal">
      <section class="judging-summary">
        <div>
          <p class="judging-eyebrow">SUPER ADMIN VIEW</p>
          <h1>Judge directory</h1>
          <p>Registered judges for this event. Scores are not shown here.</p>
        </div>
        <div class="judging-progress"><strong>${judges.length}</strong><span>${judges.length === 1 ? "Registered judge" : "Registered judges"}</span></div>
      </section>
      <section class="judging-grid" aria-label="Registered judges">
        ${judges.length ? judges.map((judge, index) =>
          `<article class="judging-team-card judging-person-card">
            <div class="judging-team-heading"><span class="judging-team-number">${String(index + 1).padStart(2, "0")}</span><span class="judging-status-badge is-scored">Judge</span></div>
            <h2>${esc(String(judge.name || "Unnamed judge"))}</h2>
            <p>${esc(judge.email)}</p>
          </article>`
        ).join("") : '<p class="empty-state u-text-soft judging-empty">No judge accounts are registered yet.</p>'}
      </section>
    </div>`;
  }

  const teams = judgingTeams();
  const categories = ["All", ...new Set(teams.map((team) => team.category))];
  if (!categories.includes(STATE.judgingCategory)) STATE.judgingCategory = "All";
  const query = STATE.judgingSearch.trim().toLowerCase();
  const visible = teams.filter((team) => {
    const own = ownScoreForTeam(team.id);
    const statusMatch =
      STATE.judgingFilter === "all" ||
      (STATE.judgingFilter === "pending" && !own) ||
      (STATE.judgingFilter === "scored" && !!own);
    const categoryMatch = STATE.judgingCategory === "All" || team.category === STATE.judgingCategory;
    const searchMatch = !query || team.name.toLowerCase().includes(query);
    return statusMatch && categoryMatch && searchMatch;
  });
  const scoredCount = teams.filter((team) => ownScoreForTeam(team.id)).length;

  return `<div class="judging-portal">
    <section class="judging-summary">
      <div>
        <p class="judging-eyebrow">JUDGE WORKSPACE</p>
        <h1>Judging portal</h1>
        <p>${esc(currentEvent()?.short || "No event selected")} · Scores are private to your account</p>
      </div>
      <div class="judging-progress" aria-label="${scoredCount} of ${teams.length} teams scored">
        <strong>${scoredCount} of ${teams.length}</strong>
        <span>Teams scored</span>
        <div><i style="width:${teams.length ? (scoredCount / teams.length * 100) : 0}%"></i></div>
      </div>
    </section>

    <section class="judging-controls" aria-label="Team filters">
      <label class="judging-search"><span>Search teams</span><input class="input" id="judgingSearch" type="search" placeholder="Team name" value="${esc(STATE.judgingSearch)}"></label>
      <label><span>Category</span><select class="input" id="judgingCategory">${categories.map((category) =>
        `<option${category === STATE.judgingCategory ? " selected" : ""}>${esc(category)}</option>`
      ).join("")}</select></label>
      <div class="judging-status" role="group" aria-label="Judging status">
        ${[
          ["all", "All Teams"],
          ["pending", "Pending / Unscored"],
          ["scored", "Scored"],
        ].map(([id, label]) =>
          `<button type="button" class="pill pill--button${STATE.judgingFilter === id ? " is-active" : ""}" data-action="judging-filter" data-value="${id}" aria-pressed="${STATE.judgingFilter === id}">${label}</button>`
        ).join("")}
      </div>
    </section>

    <section class="judging-grid" aria-label="Competing teams">
      ${visible.length ? visible.map((team, index) => {
        const own = ownScoreForTeam(team.id);
        return `<article class="judging-team-card">
          <div class="judging-team-heading">
            <span class="judging-team-number">${String(team.number || index + 1).padStart(2, "0")}</span>
            <span class="judging-status-badge ${own ? "is-scored" : ""}">${own ? "Scored" : "Pending"}</span>
          </div>
          <h2>${esc(team.name)}</h2>
          <p>${esc(team.role || "Project team")}</p>
          <div class="judging-team-meta"><span>${esc(team.category)}</span>${own ? `<strong>${own.total} / 40</strong>` : "<strong>Not scored</strong>"}</div>
          <button class="btn ${own ? "btn--secondary" : "btn--primary"} judging-open" type="button" data-action="judging-open" data-value="${esc(team.id)}"${currentEvent()?.open ? "" : " disabled"}>${!currentEvent()?.open ? "Judging closed" : (own ? "Edit score" : "Score team")}</button>
        </article>`;
      }).join("") : `<p class="empty-state u-text-soft judging-empty">No teams match these filters.</p>`}
    </section>

    <dialog class="judging-dialog" id="judgingDialog">
      <form id="judgingForm" method="dialog">
        <div class="judging-dialog-heading">
          <div><p class="judging-eyebrow">SCORE SUBMISSION</p><h2 id="judgingTeamTitle">Team</h2></div>
          <button type="button" class="directory-icon-button" data-action="judging-close" aria-label="Close">×</button>
        </div>
        <input type="hidden" name="teamId" id="judgingTeamId" value="">
        <div class="judging-rubric">
          ${[
            ["innovation", "Innovation", "Originality and creativity"],
            ["execution", "Technical Execution", "Quality of implementation"],
            ["impact", "Impact", "Value and practical usefulness"],
            ["presentation", "Presentation", "Clarity and communication"],
          ].map(([id, label, hint]) =>
            `<div class="judging-criterion">
              <div class="judging-criterion-heading"><span><strong>${label}</strong><small>${hint}</small></span><output class="judging-score-badge" id="${id}Badge"><b>0.0</b> / 10</output></div>
              <input type="hidden" name="${id}" id="${id}Score" value="0.0">
              <div class="judging-scale" data-scale="${id}" role="slider" tabindex="0" aria-label="${label} score" aria-valuemin="0" aria-valuemax="10" aria-valuenow="0" aria-valuetext="0.0 out of 10">
                <div class="judging-scale-ticks" aria-hidden="true">${Array.from({length: 21}, (_, i) =>
                  `<i class="${i % 2 === 0 ? "is-major" : "is-minor"}"${i % 2 === 0 ? ` data-number="${i / 2}"` : ""}></i>`
                ).join("")}</div>
                <div class="judging-scale-track"><div class="judging-scale-fill"></div><button class="judging-scale-handle" type="button" tabindex="-1" aria-hidden="true"><span class="judging-live-value">0.0</span></button></div>
              </div>
            </div>`
          ).join("")}
        </div>
        <label class="judging-feedback">Feedback / notes <span>(optional)</span><textarea class="input" name="feedback" maxlength="500" rows="4" placeholder="Add constructive feedback for this team"></textarea></label>
        <p class="judging-form-error" id="judgingFormError" role="alert"></p>
        <div class="judging-dialog-actions">
          <button type="button" class="btn btn--secondary" data-action="judging-close">Cancel</button>
          <button type="submit" class="btn btn--primary" id="judgingSubmit">Submit Score</button>
        </div>
      </form>
    </dialog>
    <div class="judging-toast" id="judgingToast" role="status" aria-live="polite"></div>
  </div>`;
}

function mentorChatHtml(request) {
  const myEmail = String(STATE.user?.email || "").toLowerCase();
  const mentor = STATE.accounts.find((account) => account.email.toLowerCase() === request.mentorEmail.toLowerCase());
  const team = STATE.accounts.find((account) => account.email.toLowerCase() === request.teamEmail.toLowerCase());
  const messages = request.messages.map((message) => {
    const mine = String(message.senderEmail).toLowerCase() === myEmail;
    return `<article class="mentor-chat__message${withClass(mine, "is-mine")}"><strong>${esc(message.senderName)}</strong><p>${esc(message.text)}</p><time>${esc(fmtWhen(message.createdAt))}</time></article>`;
  }).join("");
  return `<section class="mentor-chat" aria-label="Chat with ${esc(STATE.role === "mentor" ? (team?.team || team?.name || "team") : (mentor?.name || "mentor"))}">
    <header class="mentor-chat__header"><div><p class="mentor-eyebrow">1-ON-1 CHAT</p><h3>${esc(STATE.role === "mentor" ? (team?.team || team?.name || "Team") : (mentor?.name || "Mentor"))}</h3></div><span class="mentor-online-status"><i></i> Session open</span></header>
    <div class="mentor-chat__messages" aria-live="polite">${messages || '<p class="mentor-empty">Your conversation starts here.</p>'}</div>
    <form class="mentor-chat__form mentor-chat-form" data-request-id="${esc(request.id)}"><input name="message" maxlength="1000" required aria-label="Message" placeholder="Write a message…"><button class="mentor-button mentor-button--primary" type="submit">Send</button></form>
  </section>`;
}
function mentorHubHtml() {
  const requests = mentorRequests();
  const email = String(STATE.user?.email || "").toLowerCase();
  const online = onlineMentors();
  const isTeam = STATE.role === "team";
  const isMentor = STATE.role === "mentor";
  const teamRequests = requests.filter((request) => request.teamEmail.toLowerCase() === email);
  const incoming = requests.filter((request) => request.mentorEmail.toLowerCase() === email && request.status === "pending");
  const chats = requests.filter((request) =>
    request.status === "accepted" &&
    (request.teamEmail.toLowerCase() === email || request.mentorEmail.toLowerCase() === email),
  );
  const mentorCards = online.map((mentor) => {
    const prior = teamRequests.find((request) => request.mentorEmail.toLowerCase() === mentor.email.toLowerCase());
    const button = isTeam
      ? `<button class="mentor-button mentor-button--primary" type="button" data-action="mentor-request-open" data-value="${esc(mentor.email)}"${prior ? " disabled" : ""}>${prior ? (prior.status === "accepted" ? "Session accepted" : "Request sent") : "Request 1-on-1"}</button>`
      : "";
    const skills = Array.isArray(mentor.skills) && mentor.skills.length
      ? mentor.skills.slice(0, 4).map((skill) => `<span>${esc(skill)}</span>`).join("")
      : `<span>${esc(mentor.job || "Event mentor")}</span>`;
    return `<article class="mentor-card"><div class="mentor-card__identity"><span class="mentor-avatar">${esc(String(mentor.name || mentor.email).charAt(0).toUpperCase())}</span><div><h3>${esc(mentor.name || "Mentor")}</h3><p>${esc(mentor.job || mentor.org || "Mentor")}</p></div><span class="mentor-online-status"><i></i> Online</span></div>${mentor.about ? `<p class="mentor-card__bio">${esc(mentor.about)}</p>` : ""}<div class="mentor-card__skills">${skills}</div>${button}</article>`;
  }).join("");
  const teamStatus = teamRequests.length
    ? teamRequests.map((request) => {
      const mentor = STATE.accounts.find((account) => account.email.toLowerCase() === request.mentorEmail.toLowerCase());
      const status = request.status === "accepted" ? "Accepted — chat is open" : "Waiting for mentor";
      return `<article class="mentor-request-card"><div><p class="mentor-eyebrow">${esc(status)}</p><h3>${esc(mentor?.name || "Mentor")}</h3><p>${esc(request.details || "1-on-1 mentorship request")}</p></div></article>`;
    }).join("")
    : '<p class="mentor-empty">Your mentorship requests will appear here.</p>';
  const notifications = incoming.length
    ? incoming.map((request) => `<article class="mentor-notification"><div><p class="mentor-eyebrow">NEW MENTORSHIP REQUEST</p><h3>${esc(request.teamName)} is looking for you</h3><p>${esc(request.details || "The team would like a 1-on-1 session.")}</p><small>Received ${esc(fmtWhen(request.createdAt))}</small></div><button class="mentor-button mentor-button--primary" type="button" data-action="mentor-accept" data-value="${esc(request.id)}">Accept &amp; open chat</button></article>`).join("")
    : '<p class="mentor-empty">New team requests will appear here.</p>';
  return `<div class="mentor-hub">
    <section class="mentor-hero"><div><p class="mentor-eyebrow">LIMPOPO DEV ECOSYSTEM</p><h1>Mentor Hub<span>.</span></h1><p>Connect with an expert for focused, one-on-one support.</p></div><div class="mentor-hero__stat"><strong>${online.length}</strong><span>mentors online</span></div></section>
    ${STATE.mentorNotice ? `<p class="mentor-notice" role="alert">${esc(STATE.mentorNotice)}</p>` : ""}
    ${isMentor ? `<section class="mentor-section"><div class="mentor-section__heading"><div><p class="mentor-eyebrow">INBOX</p><h2>Team requests</h2></div><span>${incoming.length} new</span></div><div class="mentor-notifications">${notifications}</div></section>` : ""}
    <section class="mentor-section"><div class="mentor-section__heading"><div><p class="mentor-eyebrow">${isTeam ? "AVAILABLE NOW" : "MENTOR DIRECTORY"}</p><h2>${isTeam ? "Online mentors" : "Mentors online"}</h2></div><span>${online.length} available</span></div>
      ${online.length ? `<div class="mentor-grid">${mentorCards}</div>` : '<p class="mentor-empty">No mentors are online right now. Check back soon.</p>'}
    </section>
    ${isTeam ? `<section class="mentor-section"><div class="mentor-section__heading"><div><p class="mentor-eyebrow">YOUR ACTIVITY</p><h2>My requests</h2></div></div><div class="mentor-request-list">${teamStatus}</div></section>` : ""}
    ${chats.length ? `<section class="mentor-section"><div class="mentor-section__heading"><div><p class="mentor-eyebrow">ACCEPTED SESSIONS</p><h2>Your 1-on-1 chats</h2></div></div><div class="mentor-chat-list">${chats.map(mentorChatHtml).join("")}</div></section>` : ""}
    <dialog class="mentor-dialog" id="mentorRequestDialog"><form id="mentorRequestForm"><header><div><p class="mentor-eyebrow">NEW REQUEST</p><h2>Request a 1-on-1</h2></div><button class="mentor-close" type="button" data-action="mentor-close-dialog" aria-label="Close">×</button></header><p id="mentorRequestRecipient" class="mentor-dialog__recipient"></p><input type="hidden" name="mentorEmail"><label for="mentorRequestDetails">What would you like help with?</label><textarea id="mentorRequestDetails" name="details" maxlength="500" rows="4" placeholder="Share a little context so the mentor can prepare." required></textarea><p class="mentor-form-error" id="mentorRequestError" role="alert"></p><div class="mentor-dialog__actions"><button class="mentor-button" type="button" data-action="mentor-close-dialog">Cancel</button><button class="mentor-button mentor-button--primary" type="submit">Send request</button></div></form></dialog>
  </div>`;
}

// This list chooses which page HTML to show.
const PAGES = {
  live: () => `<div class="live-program"><section>
    ${currentEvent() ? `<div class="cluster cluster--center" role="group" aria-label="Filter sessions by topic">${currentEvent().tracks.map((t) => `<button type="button" class="pill pill--button${withClass(STATE.topic === t, CLS.active)}" aria-pressed="${STATE.topic === t}" data-action="topic" data-value="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
    <div class="tabs tabs--center" role="group" aria-label="Filter sessions by type">${TYPES.map((t) => `<button class="tab${withClass(STATE.filter === t, CLS.active)}" aria-pressed="${STATE.filter === t}" data-action="filter" data-value="${t}">${t}</button>`).join("")}</div>
    ${STATE.notice ? `<p class="notice" role="status">${STATE.notice}</p>` : ""}${liveListHtml()}</section></div>`,

  mentors: () => mentorHubHtml(),

  notices: () => publicNoticeBoardHtml(),

  teams: () => teamDirectoryHtml(),

  judging: () => judgingPortalHtml(),

  admin: () => {
    const e = currentEvent();
    const programSessions = e ? allSessions().filter((session) => session.ev === e.id).length : 0;
    const judgingRows = judgingTeams().map((team) => {
      const aggregate = judgingAggregateForAdmin(team.id);
      return `<tr><td>${esc(team.name)}</td><td>${aggregate.judgeCount}</td><td>${aggregate.average ? aggregate.average.toFixed(1) : "0.0"} / 40</td></tr>`;
    }).join("");
    const judgingSummary = `<section class="panel panel--narrow admin-grid__item"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("judging", 21)}</span><h3>Judging summary</h3></div><p class="u-text-soft">Aggregated only for Super Admins.</p><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Team</th><th>Judges</th><th>Average</th></tr></thead><tbody>${judgingRows || '<tr><td colspan="3">No teams registered.</td></tr>'}</tbody></table></div></section>`;
    const managedEvents = STATE.events.length;
    const submissionState = e ? (e.open ? "Open" : "Closed") : "Not configured";
    const noticeBoards = noticeManagementPanelHtml("public") + mealSchedulePanelHtml() + noticeManagementPanelHtml("private");
    const teamResources = teamResourcesPanelHtml();
    const settings = e
      ? `<section class="panel panel--narrow admin-grid__item admin-grid__item--settings"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("admin", 21)}</span><h3>Program settings</h3></div><p class="u-text-soft">Changes apply to: <strong class="u-text-strong">${esc(e.short)}</strong></p>
    <label class="field">Banner image URL<input class="input" id="bannerImageInput" placeholder="https://example.com/banner.jpg" value="${e.image.startsWith("data:") ? "" : esc(e.image)}"></label>
    <div><button class="btn btn--primary" data-action="update-banner">${svg("image", 17)} Update banner</button></div>
    <label class="field">Code freeze (date and time)<input class="input" type="datetime-local" data-change="due" value="${toLocalInput(new Date(e.dueAt).getTime())}"></label>
    <label class="field">Broadcast message (shown in the red bar)<input class="input" id="broadcastNoteInput" placeholder="Leave empty for the automatic countdown message" value="${esc(e.note || "")}"></label>
    <div><button class="btn btn--primary" data-action="update-note">${svg("send", 17)} Update message</button></div>
    <label class="field field--check"><input class="input input--check" type="checkbox" data-change="open"${e.open ? " checked" : ""}> Submissions are open</label>${STATE.notice ? `<p class="notice" role="status">${STATE.notice}</p>` : ""}</section>`
      : `<section class="panel panel--narrow admin-grid__item admin-grid__item--settings"><div class="admin-section-heading"><span class="admin-section-heading__icon">${svg("admin", 21)}</span><h3>Program settings</h3></div><p class="empty-state u-text-soft">Publish an event to configure its banner, code freeze and submissions.</p></section>`;
    return `<section class="admin-hero" aria-label="Super Admin Console overview">
      <div class="admin-hero__copy">
        <span class="admin-hero__eyebrow">EVENT OPERATIONS</span>
        <h1>Super Admin Console</h1>
        <p>Manage your event, schedule and attendee updates from one place.</p>
      </div>
      <aside class="admin-hero__event" aria-label="Managing event">
        <span class="admin-hero__label">MANAGING EVENT</span>
        <strong>${esc(e ? e.short : "No event selected")}</strong>
        <span class="admin-hero__status${withClass(e && e.open, "is-open")}">${e ? svg(e.open ? "unlock" : "lock", 12) + " SUBMISSIONS " : ""}${submissionState.toUpperCase()}</span>
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
          <strong class="${e && e.open ? "u-text-ok" : "u-text-accent"}">${submissionState}</strong>
          <span>${e ? `For ${esc(e.short)}` : "Publish an event to configure status"}</span>
        </article>
      </div>
    </section>
    <div class="admin-grid">${settings}${judgingSummary}${keynotePanelHtml()}${eventPanelHtml()}${noticeBoards}${teamResources}</div>`;
  },

  auth: () => {
    if (STATE.loggedIn)
      return `<section class="panel panel--narrow panel--auth">
      <h3>You are signed in</h3><p class="u-text-soft">${esc(STATE.user.name)} (${ROLES[STATE.role]})<br>${esc(STATE.user.email)}</p>
      <p class="u-text-soft">Accounts and registration are managed from the shared sign-in page.</p>
      <p><a class="btn btn--primary" href="index.html">Open sign-in page</a></p>
      <div><button class="btn" data-action="auth-toggle">Log out</button></div></section>`;
    return `<section class="panel panel--narrow panel--auth">
      <h3>Sign in or create an account</h3>
      <p class="u-text-soft">Use the shared account page to sign in or register. Your account and role will be used across event pages.</p>
      <a class="btn btn--primary btn--center" href="index.html">Continue to sign in / register</a>
    </section>`;
  },
};

function drawPage() {
  if (!can(STATE.role, STATE.page)) STATE.page = "live"; // SAFETY RULE: no access means show Live program
  STATE.sessionSignature = sessionsSignature();
  show(DOM.banner, STATE.page !== "auth"); // the login form comes first, with no big banner pushing it down
  DOM.pageContent.innerHTML = PAGES[STATE.page]();
  STATE.mentorHubSignature = STATE.page === "mentors" ? mentorHubDataSignature() : "";
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
    caption = DOM.freezeCaption,
    e = currentEvent();
  if (!row || !badge || !caption || !e) return;
  const frozen = left <= 0,
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
  const e = currentEvent();
  if (!e) {
    STATE.wasFrozen = null;
    setBroadcastText("No event updates yet.");
    if (DOM.submissionBadge) {
      DOM.submissionBadge.className = "pill";
      DOM.submissionBadge.textContent = "No event published";
    }
    if (DOM.countdownRow) {
      DOM.countdownRow.classList.remove(CLS.warning, CLS.frozen, CLS.hidden, CLS.dissolving, CLS.collapsing, CLS.collapsed);
      DOM.countdownRow.style.removeProperty("--collapse-height");
    }
    if (DOM.countdown) DOM.countdown.innerHTML = '<p class="empty-state u-text-soft">No event schedule</p>';
    if (DOM.freezeCaption) DOM.freezeCaption.textContent = "No event selected";
    return;
  }
  const left = Math.max(0, Math.floor((new Date(e.dueAt) - Date.now()) / 1000)),
    frozen = left <= 0,
    justFroze = STATE.wasFrozen === false && frozen; // only the tick that crosses zero plays the animation
  setBroadcastText(
    e.note ||
      (left
        ? `${Math.ceil(left / 3600)} hours until submission portal freeze. Make sure all GitHub repositories are public and contain a valid LICENSE.`
        : "The submission portal is now frozen."),
  );
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
  const judgingPage = window.location.pathname.toLowerCase().endsWith("judging-portal.html");
  if (judgingPage && id !== "judging") {
    window.location.assign("live-program.html" + (id !== "live" ? "#" + id : ""));
    return;
  }
  if (id === "judging") {
    if (STATE.role !== "judge" && STATE.role !== "superadmin") return;
    if (!window.location.pathname.toLowerCase().endsWith("judging-portal.html")) {
      window.location.assign("judging-portal.html");
    }
    return;
  }
  if (id === "teams") {
    if (!window.location.pathname.toLowerCase().endsWith("team-directory.html")) {
      window.location.assign("team-directory.html");
    }
    return;
  }
  if (window.location.pathname.toLowerCase().endsWith("team-directory.html")) {
    window.location.assign("live-program.html" + (id !== "live" ? "#" + id : ""));
    return;
  }
  STATE.page = id;
  STATE.editKey = null;
  STATE.delArm = null;
  STATE.keyNote = "";
  STATE.notice = "";
  STATE.publicNoticeNote = "";
  STATE.privateNoticeNote = "";
  STATE.editingPublicNoticeId = null;
  STATE.editingPrivateNoticeId = null;
  STATE.deletePublicNoticeId = null;
  STATE.deletePrivateNoticeId = null;
  STATE.mealScheduleNote = "";
  STATE.teamResourceNote = "";
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
  STATE.eventId = created.id;
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
    kn.add = kn.add.map((x) => (x.id === id ? { ...x, ...fields } : x));
  } else kn.add.push({ id: Date.now(), ev: STATE.eventId, custom: true, ...fields });
  saveKeynotes();
  STATE.keyNote =
    `\u201C${title}\u201D ${STATE.editKey ? "updated" : "published"}.` +
    (end <= Date.now() ? " Its end time has already passed, so it will not show in the program." : " It is now in Live program & keynotes.");
  STATE.editKey = null;
  STATE.delArm = null;
  drawPage();
}
function handleNotice(form, board) {
  const isPublic = board === "public",
    listKey = isPublic ? "publicNotices" : "privateNotices",
    noteKey = isPublic ? "publicNoticeNote" : "privateNoticeNote",
    editingKey = isPublic ? "editingPublicNoticeId" : "editingPrivateNoticeId",
    storageKey = isPublic ? CONFIG.storage.publicNotices : CONFIG.storage.privateNotices,
    prefix = isPublic ? "public" : "private";
  const data = new FormData(form),
    title = String(data.get("title") || "").trim(),
    message = String(data.get("message") || "").trim(),
    error = byId(`${prefix}NoticeError`);
  if (!title || !message) {
    error.textContent = "Please enter both a title and a message.";
    return;
  }
  const now = new Date().toISOString(),
    notices = STATE[listKey],
    existing = notices.find((notice) => notice.id === STATE[editingKey]),
    notice = existing
      ? { ...existing, title, message, updatedAt: now }
      : { id: `notice-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, title, message, createdAt: now },
    next = existing
      ? notices.map((item) => (item.id === existing.id ? notice : item))
      : [...notices, notice];
  if (!saveNotices(storageKey, next)) {
    STATE[noteKey] = "Unable to save the notice. Browser storage is unavailable.";
    drawPage();
    return;
  }
  STATE[listKey] = next;
  STATE[noteKey] = `Notice ${existing ? "updated" : "published"} on the ${prefix} Notice Board.`;
  STATE[editingKey] = null;
  STATE[isPublic ? "deletePublicNoticeId" : "deletePrivateNoticeId"] = null;
  drawPage();
}
function handleMealSchedule(form) {
  const data = new FormData(form),
    next = Object.fromEntries(
      MEALS.map(({ id }) => [
        id,
        {
          time: String(data.get(`${id}Time`) || ""),
          details: String(data.get(`${id}Details`) || "").trim(),
        },
      ]),
    );
  if (MEALS.some(({ id }) => next[id].time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(next[id].time))) {
    byId("mealScheduleError").textContent = "Please enter valid meal times.";
    return;
  }
  const previous = STATE.mealSchedule;
  STATE.mealSchedule = next;
  if (!saveMealSchedule()) {
    STATE.mealSchedule = previous;
    STATE.mealScheduleNote = "Unable to save the meal schedule. Browser storage is unavailable.";
  } else {
    STATE.mealScheduleNote = "Coder meal schedule updated on the Public Notice Board.";
  }
  drawPage();
}
function handleTeamResource(form) {
  const event = currentEvent(),
    data = new FormData(form),
    title = String(data.get("title") || "").trim(),
    description = String(data.get("description") || "").trim(),
    url = String(data.get("url") || "").trim(),
    badge = String(data.get("badge") || "").trim(),
    error = byId("teamResourceError");
  if (!event) {
    error.textContent = "Select an event before adding a resource.";
    return;
  }
  if (!title || !description || !badge || !isSafeResourceUrl(url)) {
    error.textContent = "Please provide a title, description, badge, and a valid http:// or https:// URL.";
    return;
  }
  const resource = {
    id: `resource-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    description,
    url,
    badge,
    tone: "violet",
  };
  persistTeamResources(event.id, [...resourcesForEvent(event.id), resource], "Resource added to this event's Team Directory.");
}
function reorderTeamResources(resourceId, direction) {
  const event = currentEvent();
  if (!event) return;
  const resources = [...resourcesForEvent(event.id)],
    from = resources.findIndex((resource) => resource.id === resourceId),
    to = from + direction;
  if (from < 0 || to < 0 || to >= resources.length) return;
  [resources[from], resources[to]] = [resources[to], resources[from]];
  persistTeamResources(event.id, resources, "Team resources reordered.");
}
function deleteTeamResource(resourceId) {
  const event = currentEvent();
  if (!event) return;
  const resources = resourcesForEvent(event.id),
    resource = resources.find((item) => item.id === resourceId);
  if (!resource || !window.confirm(`Delete "${resource.title}" from ${event.short}'s Team Directory?`)) return;
  persistTeamResources(event.id, resources.filter((item) => item.id !== resourceId), "Resource removed from this event's Team Directory.");
}
function onResourceDragStart(event) {
  const list = byId("teamResourceAdminList");
  if (!list || !list.contains(event.target)) return;
  const row = event.target.closest(".resource-admin-row");
  if (!row || !list.contains(row)) return;
  STATE.draggingResourceId = row.dataset.resourceId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", STATE.draggingResourceId);
  row.classList.add("is-dragging");
}
function onResourceDragOver(event) {
  const list = byId("teamResourceAdminList"),
    target = event.target.closest(".resource-admin-row");
  if (!list || !STATE.draggingResourceId || !target || !list.contains(target)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
}
function onResourceDrop(event) {
  const list = byId("teamResourceAdminList"),
    target = event.target.closest(".resource-admin-row");
  if (!list || !STATE.draggingResourceId || !target || !list.contains(target)) return;
  event.preventDefault();
  const eventId = STATE.eventId,
    resources = [...resourcesForEvent(eventId)],
    from = resources.findIndex((resource) => resource.id === STATE.draggingResourceId),
    targetIndex = resources.findIndex((resource) => resource.id === target.dataset.resourceId);
  if (from < 0 || targetIndex < 0 || from === targetIndex) {
    STATE.draggingResourceId = null;
    return;
  }
  const insertAt = targetIndex + (event.clientY > target.getBoundingClientRect().top + target.offsetHeight / 2 ? 1 : 0),
    [moving] = resources.splice(from, 1),
    adjustedInsertAt = from < insertAt ? insertAt - 1 : insertAt;
  resources.splice(adjustedInsertAt, 0, moving);
  STATE.draggingResourceId = null;
  persistTeamResources(eventId, resources, "Team resources reordered.");
}
function onResourceDragEnd() {
  STATE.draggingResourceId = null;
  document.querySelectorAll(".resource-admin-row.is-dragging").forEach((row) => row.classList.remove("is-dragging"));
}
function beginNoticeEdit(board, id) {
  const isPublic = board === "public";
  STATE[isPublic ? "editingPublicNoticeId" : "editingPrivateNoticeId"] = id;
  STATE[isPublic ? "deletePublicNoticeId" : "deletePrivateNoticeId"] = null;
  STATE[isPublic ? "publicNoticeNote" : "privateNoticeNote"] = "";
  drawPage();
  byId(`${board}NoticeForm`).scrollIntoView({ block: "center" });
}
function cancelNoticeEdit(board) {
  const isPublic = board === "public";
  STATE[isPublic ? "editingPublicNoticeId" : "editingPrivateNoticeId"] = null;
  STATE[isPublic ? "deletePublicNoticeId" : "deletePrivateNoticeId"] = null;
  STATE[isPublic ? "publicNoticeNote" : "privateNoticeNote"] = "";
  drawPage();
}
function deleteNotice(board, id) {
  const isPublic = board === "public",
    listKey = isPublic ? "publicNotices" : "privateNotices",
    noteKey = isPublic ? "publicNoticeNote" : "privateNoticeNote",
    editingKey = isPublic ? "editingPublicNoticeId" : "editingPrivateNoticeId",
    deleteKey = isPublic ? "deletePublicNoticeId" : "deletePrivateNoticeId",
    storageKey = isPublic ? CONFIG.storage.publicNotices : CONFIG.storage.privateNotices;
  if (STATE[deleteKey] !== id) {
    STATE[deleteKey] = id;
    return drawPage();
  }
  const next = STATE[listKey].filter((notice) => notice.id !== id);
  if (!saveNotices(storageKey, next)) {
    STATE[noteKey] = "Unable to remove the notice. Browser storage is unavailable.";
  } else {
    STATE[listKey] = next;
    STATE[noteKey] = `Notice removed from the ${board} Notice Board.`;
    if (STATE[editingKey] === id) STATE[editingKey] = null;
  }
  STATE[deleteKey] = null;
  drawPage();
}
function showDirectoryToast(message) {
  const toast = byId("directoryToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}
function handleDirectoryTeam(form) {
  const data = new FormData(form);
  const name = String(data.get("teamName") || "").trim();
  const number = Number.parseInt(String(data.get("teamNumber") || ""), 10);
  const role = String(data.get("teamRole") || "").trim();
  const category = String(data.get("teamCategory") || "").trim();
  const error = byId("directoryTeamError");
  if (!name || !role || !category || !Number.isInteger(number) || number < 1 || number > 99) {
    error.textContent = "Please fill in every field. The team number must be between 1 and 99.";
    return;
  }
  const teams = directoryTeams();
  if (teams.some((team) => Number(team.number) === number)) {
    error.textContent = `Team ${number} already exists. Please choose a different number.`;
    return;
  }
  teams.push({ name, number: String(number), role, category });
  directoryStorage.set("geekulchaExtraTeams", teams);
  form.reset();
  byId("directoryTeamDialog")?.close();
  showDirectoryToast("Team added to this browser's directory.");
  drawPage();
}
function handleDirectoryMember(form) {
  const data = new FormData(form);
  const name = String(data.get("memberName") || "").trim();
  const team = String(data.get("memberTeam") || "");
  const role = String(data.get("memberRole") || "").trim();
  if (!name || !team || !role) return;
  const members = directoryMembers();
  members.push({ name, team, role });
  directoryStorage.set("geekulchaExtraMembers", members);
  form.reset();
  byId("directoryMemberDialog")?.close();
  showDirectoryToast("Member added to this browser's directory.");
  drawPage();
}
function handleDirectoryHelp(form) {
  const data = new FormData(form);
  const who = String(data.get("who") || "").trim();
  const error = byId("directoryHelpError");
  if (!who || !data.get("kind")) {
    error.textContent = "Please add your name and choose a type of help.";
    return;
  }
  byId("directoryMentorSummary").textContent = `${who}, no mentor is currently listed in the directory. Your request has not been sent.`;
  byId("directoryHelpDialog")?.close();
  byId("directoryMentorDialog")?.showModal();
}
function handleMentorRequest(form) {
  const data = new FormData(form);
  const mentorEmail = String(data.get("mentorEmail") || "").toLowerCase();
  const details = String(data.get("details") || "").trim();
  const mentor = onlineMentors().find((account) => account.email.toLowerCase() === mentorEmail);
  const error = byId("mentorRequestError");
  if (STATE.role !== "team" || !STATE.loggedIn || !mentor) {
    error.textContent = "That mentor is no longer online. Refresh the directory and try again.";
    return;
  }
  if (!details) {
    error.textContent = "Please tell the mentor what you would like help with.";
    return;
  }
  const requests = mentorRequests();
  if (requests.some((request) =>
    request.teamEmail.toLowerCase() === STATE.user.email.toLowerCase() &&
    request.mentorEmail.toLowerCase() === mentorEmail,
  )) {
    error.textContent = "You already have a request or session with this mentor.";
    return;
  }
  const teamName = STATE.user.team || STATE.user.name || STATE.user.email;
  requests.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    mentorEmail,
    teamEmail: STATE.user.email,
    teamName,
    details,
    createdAt: Date.now(),
    status: "pending",
    messages: [],
  });
  if (!saveMentorRequests(requests)) {
    error.textContent = "Unable to send your request because browser storage is unavailable.";
    return;
  }
  byId("mentorRequestDialog").close();
  STATE.mentorNotice = `Your request was sent to ${mentor.name || "the mentor"}.`;
  announceMentorHubChange();
}
function acceptMentorRequest(id) {
  if (!STATE.loggedIn || STATE.role !== "mentor") return;
  const requests = mentorRequests();
  const request = requests.find((item) => item.id === id);
  if (!request || request.mentorEmail.toLowerCase() !== STATE.user.email.toLowerCase()) return;
  request.status = "accepted";
  request.acceptedAt = Date.now();
  if (!saveMentorRequests(requests)) {
    STATE.mentorNotice = "Unable to accept this request because browser storage is unavailable.";
  } else {
    STATE.mentorNotice = `You accepted ${request.teamName}'s request. Your chat is open below.`;
  }
  announceMentorHubChange();
}
function handleMentorChat(form) {
  const requestId = form.dataset.requestId;
  const input = form.elements.message;
  const text = String(input.value || "").trim();
  if (!text || !STATE.loggedIn) return;
  const requests = mentorRequests();
  const request = requests.find((item) => item.id === requestId && item.status === "accepted");
  const email = STATE.user.email.toLowerCase();
  if (!request || ![request.mentorEmail.toLowerCase(), request.teamEmail.toLowerCase()].includes(email)) return;
  request.messages.push({
    senderEmail: STATE.user.email,
    senderName: STATE.user.team || STATE.user.name || STATE.user.email,
    text,
    createdAt: Date.now(),
  });
  if (!saveMentorRequests(requests)) {
    STATE.mentorNotice = "Unable to send your message because browser storage is unavailable.";
  } else {
    STATE.mentorNotice = "";
  }
  announceMentorHubChange();
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
  "judging-filter": (v) => {
    STATE.judgingFilter = v;
    drawPage();
  },
  "judging-open": (teamId) => {
    if (STATE.role !== "judge" || !STATE.loggedIn) return;
    if (!currentEvent()?.open) {
      window.alert("Judging is closed for this event.");
      return;
    }
    const team = judgingTeams().find((item) => item.id === teamId);
    if (!team) return;
    const dialog = byId("judgingDialog");
    const form = byId("judgingForm");
    const existing = ownScoreForTeam(teamId);
    form.reset();
    byId("judgingTeamTitle").textContent = team.name;
    byId("judgingTeamId").value = teamId;
    byId("judgingSubmit").textContent = existing ? "Update Score" : "Submit Score";
    byId("judgingFormError").textContent = "";
    ["innovation", "execution", "impact", "presentation"].forEach((id) => {
      const value = Number(existing?.criteria?.[id] ?? 0);
      setJudgingScale(id, value, true);
    });
    form.elements.feedback.value = existing?.feedback || "";
    dialog?.showModal();
  },
  "judging-close": (v, button) => button.closest("dialog")?.close(),
  "directory-open-team": () => {
    const dialog = byId("directoryTeamDialog");
    byId("directoryTeamError").textContent = "";
    dialog?.showModal();
  },
  "directory-open-member": () => byId("directoryMemberDialog")?.showModal(),
  "directory-open-help": () => byId("directoryHelpDialog")?.showModal(),
  "directory-close-dialog": (v, button) => button.closest("dialog")?.close(),
  "mentor-request-open": (email) => {
    if (!STATE.loggedIn || STATE.role !== "team") return;
    const mentor = onlineMentors().find((account) => account.email.toLowerCase() === String(email).toLowerCase());
    if (!mentor) {
      STATE.mentorNotice = "That mentor is no longer online. Refresh the directory and try again.";
      return drawPage();
    }
    const form = byId("mentorRequestForm");
    form.reset();
    form.elements.mentorEmail.value = mentor.email;
    byId("mentorRequestRecipient").textContent = `Your request will be sent to ${mentor.name || "this mentor"}.`;
    byId("mentorRequestError").textContent = "";
    byId("mentorRequestDialog").showModal();
  },
  "mentor-close-dialog": (v, button) => button.closest("dialog")?.close(),
  "mentor-accept": (id) => acceptMentorRequest(id),
  "directory-dismiss-broadcast": () => {
    byId("directory-broadcast")?.remove();
    try { localStorage.setItem("geekulchaBroadcastDismissed", "1"); } catch {}
  },
  "directory-remove-team": (number) => {
    const teams = directoryTeams();
    const team = teams.find((x) => String(x.number) === String(number));
    if (!team || !window.confirm(`Remove "${team.name}" from this browser's directory?`)) return;
    directoryStorage.set("geekulchaExtraTeams", teams.filter((x) => String(x.number) !== String(number)));
    drawPage();
  },
  "directory-remove-member": (name) => {
    const members = directoryMembers();
    if (!window.confirm(`Remove ${name} from this browser's directory?`)) return;
    directoryStorage.set("geekulchaExtraMembers", members.filter((x) => x.name !== name));
    drawPage();
  },
  topic: (v) => {
    STATE.topic = STATE.topic === v ? "" : v;
    drawPage();
  },
  filter: (v) => {
    STATE.filter = v;
    drawPage();
  },
  // Edited by NkosinathiM-ship: clear the session and return to the login entry.
  "auth-toggle": () => {
    if (STATE.loggedIn) {
      signOut();
      window.location.assign("index.html");
    } else {
      window.location.assign("index.html");
    }
  },
  theme: () => {
    STATE.theme = STATE.theme === "dark" ? "light" : "dark";
    DOM.root.dataset.theme = STATE.theme;
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
    if (!STATE.events.some((x) => x.id === STATE.eventId)) STATE.eventId = STATE.events[0]?.id || "";
    saveEvents();
    STATE.keynotes.add = STATE.keynotes.add.filter((keynote) => STATE.events.some((event) => event.id === keynote.ev));
    saveKeynotes();
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
    kn.add = kn.add.filter((x) => x.id !== id);
    saveKeynotes();
    if (STATE.editKey === id) STATE.editKey = null;
    STATE.delArm = null;
    STATE.keyNote = "Keynote deleted.";
    drawPage();
  },
  "public-notice-edit": (id) => beginNoticeEdit("public", id),
  "public-notice-cancel": () => cancelNoticeEdit("public"),
  "public-notice-delete": (id) => deleteNotice("public", id),
  "private-notice-edit": (id) => beginNoticeEdit("private", id),
  "private-notice-cancel": () => cancelNoticeEdit("private"),
  "private-notice-delete": (id) => deleteNotice("private", id),
  "resource-move-up": (id) => reorderTeamResources(id, -1),
  "resource-move-down": (id) => reorderTeamResources(id, 1),
  "resource-delete": (id) => deleteTeamResource(id),
};

const CHANGES = {
  judgingCategory: null,
  event: (target) => {
    STATE.eventId = target.value;
    STATE.topic = "";
    STATE.editKey = null;
    STATE.keyNote = "";
    STATE.notice = "";
    STATE.teamResourceNote = "";
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

function snapJudgingValue(value) {
  return Math.min(10, Math.max(0, Math.round(value * 2) / 2));
}

function setJudgingScale(id, value, locked = false) {
  const scale = document.querySelector(`.judging-scale[data-scale="${id}"]`);
  const hidden = byId(`${id}Score`);
  const badge = byId(`${id}Badge`);
  if (!scale || !hidden || !badge) return;
  const snapped = snapJudgingValue(Number(value) || 0);
  const percent = snapped * 10;
  scale.classList.toggle("is-dragging", !locked);
  scale.classList.toggle("is-locked", locked);
  scale.setAttribute("aria-valuenow", String(snapped));
  scale.setAttribute("aria-valuetext", `${snapped.toFixed(1)} out of 10`);
  scale.querySelector(".judging-scale-fill").style.width = `${percent}%`;
  scale.querySelector(".judging-scale-handle").style.left = `${percent}%`;
  scale.querySelector(".judging-live-value").textContent = snapped.toFixed(1);
  hidden.value = snapped.toFixed(1);
  badge.querySelector("b").textContent = snapped.toFixed(1);
  badge.classList.toggle("is-locked", locked);
}

function judgingValueFromPointer(scale, event) {
  const rect = scale.querySelector(".judging-scale-track").getBoundingClientRect();
  const ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0;
  return snapJudgingValue(Math.min(10, Math.max(0, ratio * 10)));
}

function handleJudgingScore(form) {
  if (STATE.role !== "judge" || !STATE.loggedIn) {
    window.location.assign("index.html");
    return;
  }
  if (!currentEvent()?.open) {
    byId("judgingFormError").textContent = "Judging is closed for this event.";
    return;
  }
  const data = new FormData(form);
  const teamId = data.get("teamId");
  const criteria = {};
  for (const id of ["innovation", "execution", "impact", "presentation"]) {
    const value = Number(data.get(id));
    if (!Number.isFinite(value) || value < 0 || value > 10 || Math.abs(value * 2 - Math.round(value * 2)) > 0.0001) {
      byId("judgingFormError").textContent = "Set every criterion to a score from 0.0 to 10.0.";
      return;
    }
    criteria[id] = value;
  }
  if (!judgingTeams().some((team) => team.id === teamId)) {
    byId("judgingFormError").textContent = "This team is no longer available.";
    return;
  }
  const existing = !!ownScoreForTeam(teamId);
  if (!upsertOwnScore(teamId, criteria, data.get("feedback"))) {
    byId("judgingFormError").textContent = "Unable to save this score. Browser storage is unavailable.";
    return;
  }
  byId("judgingDialog").close();
  drawPage();
  const toast = byId("judgingToast");
  if (toast) {
    toast.textContent = existing ? "Score updated successfully." : "Score submitted successfully.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }
}

const FORMS = {
  qaForm: handleQuestion,
  judgingForm: handleJudgingScore,
  eventForm: handleEvent,
  keyForm: handleKeynote,
  publicNoticeForm: (form) => handleNotice(form, "public"),
  privateNoticeForm: (form) => handleNotice(form, "private"),
  mealScheduleForm: handleMealSchedule,
  teamResourceForm: handleTeamResource,
  directoryTeamForm: handleDirectoryTeam,
  directoryMemberForm: handleDirectoryMember,
  directoryHelpForm: handleDirectoryHelp,
  mentorRequestForm: handleMentorRequest,
};

function onClick(e) {
  // Send clicked buttons to the right action function.
  const button = e.target.closest("[data-action]");
  const action = button && ACTIONS[button.dataset.action];
  if (action) action(button.dataset.value, button);
  const dialog = e.target.closest("dialog");
  if (dialog && e.target === dialog) dialog.close();
}
function onChange(e) {
  const target = e.target,
    change = CHANGES[target.dataset.change];
  if (target.id === "judgingCategory") {
    STATE.judgingCategory = target.value;
    drawPage();
    return;
  }
  if (change) return change(target);
}
let draggingJudgingScale = null;

function updateJudgingDrag(scale, event) {
  const rect = scale.querySelector(".judging-scale-track").getBoundingClientRect();
  const ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0;
  const liveValue = Math.min(10, Math.max(0, Math.round(ratio * 100) / 10));
  const percent = liveValue * 10;
  scale.querySelector(".judging-scale-fill").style.width = `${percent}%`;
  scale.querySelector(".judging-scale-handle").style.left = `${percent}%`;
  scale.querySelector(".judging-live-value").textContent = liveValue.toFixed(1);
  scale.setAttribute("aria-valuenow", liveValue.toFixed(1));
  scale.setAttribute("aria-valuetext", `${liveValue.toFixed(1)} out of 10`);
}

function onJudgingPointerDown(event) {
  const scale = event.target.closest(".judging-scale");
  if (!scale) return;
  draggingJudgingScale = scale;
  scale.setPointerCapture?.(event.pointerId);
  scale.classList.remove("is-locked");
  scale.classList.add("is-dragging");
  byId(`${scale.dataset.scale}Badge`)?.classList.remove("is-locked");
  updateJudgingDrag(scale, event);
}

function onJudgingPointerMove(event) {
  if (!draggingJudgingScale) return;
  updateJudgingDrag(draggingJudgingScale, event);
}

function onJudgingPointerUp(event) {
  if (!draggingJudgingScale) return;
  updateJudgingDrag(draggingJudgingScale, event);
  const scale = draggingJudgingScale;
  const value = judgingValueFromPointer(scale, event);
  scale.releasePointerCapture?.(event.pointerId);
  draggingJudgingScale = null;
  setJudgingScale(scale.dataset.scale, value, true);
  scale.classList.remove("is-dragging");
  scale.classList.add("is-locking");
  window.setTimeout(() => scale.classList.remove("is-locking"), 420);
}

function onJudgingKeydown(event) {
  const scale = event.target.closest(".judging-scale");
  if (!scale || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const hidden = byId(`${scale.dataset.scale}Score`);
  let value = Number(hidden.value || 0);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") value -= 0.5;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") value += 0.5;
  if (event.key === "Home") value = 0;
  if (event.key === "End") value = 10;
  setJudgingScale(scale.dataset.scale, value, true);
  scale.classList.add("is-locking");
  window.setTimeout(() => scale.classList.remove("is-locking"), 420);
}

function onInput(e) {
  if (e.target.id === "judgingSearch") {
    STATE.judgingSearch = e.target.value;
    drawPage();
    const input = byId("judgingSearch");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
    return;
  }
  const team = e.target.dataset.score;
  if (team) STATE.scores[team] = Math.min(10, Math.max(0, Number(e.target.value))); // judge scores stay between 0 and 10
}
function onKeydown(e) {
  if (e.key === "Escape" && STATE.qaOpen) return setQA(false);
  // keyboard shortcut: press 1, 2, 3... to open that menu item
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  const item = navItems()[Number(e.key) - 1];
  if (item && can(STATE.role, item.id)) go(item.id);
}
function onSubmit(e) {
  e.preventDefault();
  if (e.target.matches(".mentor-chat-form")) return handleMentorChat(e.target);
  const handler = FORMS[e.target.id];
  if (handler) handler(e.target);
}


/* ==========================================================================
   11. init(): wire every listener once, then start the app
   ========================================================================== */
function init() {
  if (window.location.pathname.toLowerCase().endsWith("judging-portal.html")) {
    STATE.page = "judging";
  } else if (window.location.pathname.toLowerCase().endsWith("team-directory.html")) {
    STATE.page = "teams";
  } else {
    const hashPage = window.location.hash.replace(/^#/, "");
    if (hashPage && MENU.some((item) => item.id === hashPage) && can(STATE.role, hashPage)) {
      STATE.page = hashPage;
    }
  }
  // Settings in css/live-program.css are read from tokens so the files stay in sync.
  STATE.bannerShrink = parseFloat(readToken("--banner-shrink")) || STATE.bannerShrink;
  STATE.pixelPalette = CONFIG.pixelTokens.map(readToken);

  if ("BroadcastChannel" in window) {
    try {
      mentorChannel = new BroadcastChannel("portal-mentor-hub-v1");
      mentorChannel.addEventListener("message", syncMentorHub);
    } catch {
      mentorChannel = null;
    }
  }
  DOM.win.addEventListener("storage", (event) => {
    if (event.key === CONFIG.storage.mentorRequests) syncMentorHub();
  });
  DOM.win.addEventListener("beforeunload", clearMentorPresence);
  DOM.doc.addEventListener("visibilitychange", updateMentorPresence);

  // Event listeners (one delegated listener per event type)
  DOM.doc.addEventListener("click", onClick);
  DOM.doc.addEventListener("change", onChange);
  DOM.doc.addEventListener("input", onInput);
  DOM.doc.addEventListener("keydown", onKeydown);
  DOM.doc.addEventListener("submit", onSubmit);
  DOM.doc.addEventListener("pointerdown", onJudgingPointerDown);
  DOM.doc.addEventListener("pointermove", onJudgingPointerMove);
  DOM.doc.addEventListener("pointerup", onJudgingPointerUp);
  DOM.doc.addEventListener("pointercancel", onJudgingPointerUp);
  DOM.doc.addEventListener("keydown", onJudgingKeydown);
  DOM.doc.addEventListener("dragstart", onResourceDragStart);
  DOM.doc.addEventListener("dragover", onResourceDragOver);
  DOM.doc.addEventListener("drop", onResourceDrop);
  DOM.doc.addEventListener("dragend", onResourceDragEnd);
  DOM.win.addEventListener("scroll", onScroll, { passive: true });
  DOM.win.addEventListener("resize", () => {
    bannerMetrics();
    measureBroadcastTicker();
  });
  if (window.ResizeObserver) new ResizeObserver(bannerMetrics).observe(DOM.banner);

  // First paint
  DOM.root.dataset.theme = STATE.theme;
  drawQA();
  drawAll();
  initAccounts().then(() => {
    if (guardJudgingAccess()) drawAll();
  }).catch(() => {
    if (guardJudgingAccess()) drawAll();
  }); // load accounts, restore a saved login, then redraw
  setInterval(tick, CONFIG.tickMs);
  setInterval(() => {
    updateMentorPresence();
    syncMentorHub();
  }, MENTOR_PRESENCE_INTERVAL_MS);
}

init(); // this file is loaded with "defer", so the page is ready by now
