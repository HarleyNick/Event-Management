/*
  script.js: everything the portal does. Read it from top to bottom:
    1. ICONS      small line drawings used in the menu and buttons
    2. DATA       roles, menus, who may see what, events, sessions, mentors, teams, notices
    3. STATE      the one object (S) that remembers everything that can change
    4. ACCOUNTS   register, log in, log out (demo only, runs in the browser)
    5. DRAWING    functions that fill each part of the screen (sidebar, header, banner, pages)
    6. ACTIONS    what happens when someone clicks, types, picks from a list or presses a key
*/

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
const ADMIN_CODE = "LIMPOPO-ADMIN"; // DEMO ONLY: Super Admin sign-up needs this code. LATER: organizers are created by the server, never by a code in the page.
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
const SESSIONS = [
  {
    id: 1,
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
    type: "Mentor Pit",
    start: inMin(245),
    end: inMin(320),
    title: "Venture Pitch Clinic: What Judges & Angel VCs Look For",
    about:
      "1-on-1 critique of 3-minute deck structure, traction milestones, defensible moat articulation, and live demo stagecraft.",
    who: "Kaito Tanaka, Cybernetic Ventures",
  },
];
// Sessions still to come or happening now, with "live" worked out from the clock.
const sessionsNow = () => {
  const n = Date.now();
  return SESSIONS.filter((s) => s.end > n).map((s) => ({ ...s, live: s.start <= n }));
};
const sessionsSig = () => sessionsNow().map((s) => s.id + (s.live ? "L" : "")).join();
let sessSig = ""; // remembers what is on screen, so the page only redraws when a session starts or ends
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

/* ============ STATE: everything that can change ============ */
const KEY = "portal-events-v3"; // browser storage name, so admin edits survive a refresh
function load() {
  try {
    const r = localStorage.getItem(KEY);
    if (r) return JSON.parse(r);
  } catch (e) {
    /* storage blocked */
  }
  return DEFAULTS;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S.events));
  } catch (e) {
    /* ignore */
  }
}
const S = {
  events: load(),
  eventId: "limpopo",
  role: "guest",
  loggedIn: false,
  user: null,
  page: "live",
  theme: "dark",
  pinned: false,
  bcastOff: false,
  qaOpen: false,
  filter: "All",
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
const ev = () => S.events.find((e) => e.id === S.eventId);
const $ = (id) => document.getElementById(id);
const esc = (t) =>
  String(t).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  ); // stops typed text running as code
function update(patch) {
  Object.assign(ev(), patch);
  save();
}
const visible = () => MENU.filter((m) => can(S.role, m.id));
// The top bar holds every tab except "Log in & registration" (that lives in the sidebar).
const navItems = () => visible().filter((m) => m.id !== "auth");

/* ============ ACCOUNTS (DEMO): sign-up and login happen inside the browser ============
   A person's role comes from the account they registered with. It cannot be changed afterwards.
   LATER: replace this block with calls to a real backend. A real site must never keep passwords in the browser. */
const ACC_KEY = "portal-accounts-v1",
  SES_KEY = "portal-session-v1";
const DEMO_PASS = "demo1234";
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
let accounts = [];
const isDemo = (a) => DEMO.some((d) => d.email === a.email);
function saveAccounts() {
  try {
    localStorage.setItem(ACC_KEY, JSON.stringify(accounts.filter((a) => !isDemo(a))));
  } catch (e) {
    /* storage blocked */
  }
}
// Signing in fixes the role to the one on the account.
function signIn(u) {
  S.user = u;
  S.role = u.role;
  S.loggedIn = true;
  S.page = "live";
  try {
    localStorage.setItem(SES_KEY, u.email);
  } catch (e) {
    /* ignore */
  }
}
function signOut() {
  S.user = null;
  S.role = "guest";
  S.loggedIn = false;
  S.page = "live";
  try {
    localStorage.removeItem(SES_KEY);
  } catch (e) {
    /* ignore */
  }
}
async function initAccounts() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(ACC_KEY)) || [];
  } catch (e) {
    /* ignore */
  }
  const demo = await Promise.all(
    DEMO.map(async (d) => ({ ...d, key: await fingerprint(d.email, DEMO_PASS) })),
  );
  accounts = [...demo, ...saved];
  try {
    const u = accounts.find((a) => a.email === localStorage.getItem(SES_KEY));
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
    err = $("authErr"),
    reg = S.authMode === "register";
  if (!email || !pass || (reg && !name)) {
    err.textContent = "Please fill in every box.";
    return;
  }
  if (reg && pass.length < 6) {
    err.textContent = "Please use at least 6 characters for your password.";
    return;
  }
  const key = await fingerprint(email, pass),
    found = accounts.find((a) => a.email === email);
  if (reg) {
    if (found) {
      err.textContent = "That email already has an account. Please log in instead.";
      return;
    }
    const role = SIGNUP_ROLES.includes(f.get("role")) ? f.get("role") : "attendee";
    if (role === "superadmin" && (f.get("code") || "").trim() !== ADMIN_CODE) {
      err.textContent = "That Super Admin access code is not right.";
      return;
    }
    const u = { email, name, role, key };
    accounts.push(u);
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
  const name = S.loggedIn ? S.user.name : "Guest";
  $("sidebar").innerHTML = `<div class="sb-user"><span class="sb-av" aria-hidden="true">${esc(name.charAt(0).toUpperCase())}</span><span class="t"><b>${esc(name)}</b><small>${ROLES[S.role]}</small></span></div>
    <div class="sb-mid"><div class="sb-event">${svg("layers", 20)}<div class="t"><span class="lbl">Event</span><select data-change="event" aria-label="Choose an event">${S.events.map((x) => `<option value="${x.id}"${x.id === S.eventId ? " selected" : ""}>${esc(x.short)}</option>`).join("")}</select></div></div></div>
    <div class="sb-foot">
      <button class="nav" data-action="theme" aria-label="Switch between light and dark mode"><span class="themeic"><span class="i sun">${svg("sun", 20)}</span><span class="i moon">${svg("moon", 20)}</span></span><span class="t"><span class="lt">Switch to light</span><span class="dk">Switch to dark</span></span></button>
      <button class="nav" data-action="auth-toggle">${svg(S.loggedIn ? "out" : "auth", 20)}<span class="t">${S.loggedIn ? "Log out" : "Log in / Register"}</span></button>
    </div>`;
}
// TOP NAVIGATION: the event name, the role tag and one tab for every menu item this role may open.
function drawNav() {
  $("topnav").innerHTML = `<div class="strip"><b>${esc(ev().short)}</b><span class="tag">${ROLES[S.role]}</span></div>
    <ul class="menu">${navItems()
      .map(
        (m) => `<li><button class="nav${S.page === m.id ? " on" : ""}" data-action="nav" data-v="${m.id}" title="${m.hint}"${S.page === m.id ? ' aria-current="page"' : ""}><span class="ic">${svg(m.id, 18)}</span><span class="t"><b>${m.label}</b></span></button></li>`,
      )
      .join("")}</ul>`;
}
function drawTop() {
  const e = ev(),
    due = new Date(e.dueAt);
  $("top").innerHTML = `<div class="toolbar"><h2 class="ptitle">${MENU.find((m) => m.id === S.page).label}</h2>
    <div class="row"><span class="tag ${e.open ? "g" : ""}">${svg("lock", 12)} ${e.open ? "Submissions open" : "Submissions closed"}</span>
    </div></div>
    <div class="timerow" id="timerow"><div class="timers"><div class="boxes" id="cd" role="timer" aria-label="Time left until code freeze"></div></div>
    <div class="timebox"><span class="lbl">Time</span><b>${due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b><span class="lbl">Code freeze</span></div></div>`;
  tick();
}
function drawBanner() {
  const e = ev(),
    b = $("banner"),
    custom = !e.image.startsWith("data:"); // the Super Admin can swap in their own photo
  b.className = "banner" + (custom ? " custom" : "");
  b.style.backgroundImage = custom
    ? `linear-gradient(180deg,rgba(8,8,12,.35),rgba(8,8,12,.7)),url("${e.image.replace(/"/g, "%22")}")`
    : `url("${e.image}")`;
  b.innerHTML = `<div class="tl"><span class="bchip mono">${esc(e.place)}</span>${S.role === "superadmin" ? `<button class="btn primary" data-action="nav" data-v="admin">Change program banner</button>` : ""}</div>
    <h1>${esc(e.name)}</h1>
    ${e.summary ? `<p>${esc(e.summary)}</p>` : ""}
    <div class="row"><span class="tag">${esc(e.date)}</span><span class="mono">${esc(e.tag)}</span></div>`;
}
// BROADCAST BAR: shows how long is left. Can be dismissed with the X.
function drawBcast() {
  $("bcast").hidden = S.bcastOff;
  $("bcast").innerHTML = `<i class="dot"></i><b>Broadcast:</b>${svg("alert", 16)}<span id="bmsg">
    </span><button class="x" data-action="bcast-x" aria-label="Close this message">${svg("x", 16)}</button>`;
}
// COUNTDOWN: runs every second and only touches the clock, so typing elsewhere is never interrupted.
function tick() {
  const left = Math.max(0, Math.floor((new Date(ev().dueAt) - Date.now()) / 1000)),
    cd = $("cd"),
    bm = $("bmsg");
  if (bm)
    bm.textContent =
      ev().note ||
      (left
        ? `${Math.ceil(left / 3600)} hours until submission portal freeze. Make sure all GitHub repositories are public and contain a valid LICENSE.`
        : "The submission portal is now frozen.");
  const tr = $("timerow");
  if (tr) tr.hidden = left <= 0; // countdown and Code freeze box disappear at zero
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
  if (S.page === "live" && sessionsSig() !== sessSig) drawPage();
}
setInterval(tick, 1000);

// One session card. The "Save my seat" button needs a login.
function card(s) {
  const r = S.reserved.includes(s.id);
  return `<article class="blk${s.live ? " live" : ""}"><h2 class="big">${s.title}</h2>
    <p class="sub">${s.type} \u00B7 ${timeLabel(s)} ${s.live ? '<span class="livepill mono">Live now</span>' : ""}</p>
    <p class="soft">${s.about}</p><p class="mono who">${s.who.replace(", ", " \u00B7 ")}</p>
    <button class="rsvp${r ? " done" : ""}" aria-pressed="${r}" data-action="reserve" data-v="${s.id}">${svg("cal", 16)} ${r ? "Seat saved" : "Save my seat"}</button></article>`;
}
// Q&A list: pinned questions first, then the most votes.
function qaList() {
  return [...S.questions]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.votes - a.votes)
    .map(
      (q) =>
        `<li><div class="qwho"><span><b>${esc(q.name)}</b> (Team ${esc(q.team)})</span>
      <span>${q.time}</span></div><p style="margin:8px 0">${esc(q.text)}</p>
    <div class="qfoot"><button class="vote" data-action="vote" data-v="${q.id}"${S.voted.includes(q.id) ? " disabled" : ""} aria-label="Vote for this question. Votes: ${q.votes}">${svg("thumb", 14)} ${q.votes}</button>${q.pinned ? `<span class="mono" style="color:var(--amber)">${svg("pin", 12)} Pinned</span>` : ""}</div>
      </li>`,
    )
    .join("");
}
const liveList = () => {
  const l = sessionsNow().filter((s) => S.filter === "All" || s.type === S.filter);
  return l.length
    ? l.map(card).join("")
    : '<p class="soft" style="text-align:center;margin:40px 0">No sessions left in this view.</p>';
};
// SUPER ADMIN: the form that adds (and schedules) the next upcoming event.
const eventPanel = () => {
  const mine = S.events.filter((x) => x.custom);
  return `<section class="panel narrow" style="margin-top:20px"><h3>Create and publish the next event</h3>
    <p class="soft">Fill this in and publish. The event is added to the event switcher in the sidebar straight away.</p>
    <form id="eventForm" novalidate>
      <label>Event name<input name="name" placeholder="e.g. Pretoria Robotics Challenge"></label>
      <label>Short name (shown in menus)<input name="short" placeholder="e.g. Robotics Challenge"></label>
      <div class="two"><label>Starts<input type="datetime-local" name="start"></label><label>Code freeze<input type="datetime-local" name="due"></label></div>
      <label>Description<textarea name="summary" rows="3" placeholder="A sentence or two about the event"></textarea></label>
      <label>Tagline<input name="tag" placeholder="e.g. 48-Hour Build Sprint"></label>
      <label>Location<input name="place" placeholder="e.g. Sandton Convention Centre"></label>
      <label>Tracks (separate with commas)<input name="tracks" placeholder="e.g. Robotics, AI, IoT"></label>
      <label>Banner image URL (optional)<input name="image" placeholder="https://example.com/banner.jpg"></label>
      <p class="err" id="evErr" role="alert"></p>
      <button class="btn primary" style="justify-content:center">Publish event</button>
    </form>
    ${S.evNote ? `<p class="note" role="status">${esc(S.evNote)}</p>` : ""}
    ${mine.length ? `<div><p class="lbl soft">Events you added</p>${mine.map((x) => `<div class="row" style="justify-content:space-between;margin-top:8px"><span><b>${esc(x.short)}</b> <span class="soft">${esc(x.date)}</span></span><button class="btn" type="button" data-action="rm-event" data-v="${x.id}">Remove</button></div>`).join("")}</div>` : ""}</section>`;
};
const PAGES = {
  live: () => `<div class="live"><section>
    <div class="row" style="justify-content:center">${ev().tracks.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    <div class="tabs" role="group" aria-label="Filter sessions by type">${TYPES.map((t) => `<button class="tab${S.filter === t ? " on" : ""}" aria-pressed="${S.filter === t}" data-action="filter" data-v="${t}">${t}</button>`).join("")}</div>
    ${S.notice ? `<p class="note" role="status">${S.notice}</p>` : ""}${liveList()}</section></div>`,
  mentors: () =>
    `<p class="soft" style="margin-top:20px">Book 20 minutes with an expert.</p>` +
    MENTORS.map(([n, sk]) => {
      const b = S.booked.includes(n);
      return `<article class="sess"><h3 style="margin:0">${n}</h3><p class="soft">${sk}</p>
      <button class="rsvp${b ? " done" : ""}" data-action="book" data-v="${n}">${svg("cal", 16)} ${b ? "Booked. Tap to cancel" : "Book 20 minutes"}</button>
      </article>`;
    }).join(""),
  teams: () =>
    `<div style="margin-top:20px">` +
    TEAMS.map(
      ([n, m]) => `<article class="sess">
    <h3 style="margin:0">${n}</h3><p class="soft">${m} members</p></article>`,
    ).join("") +
    "</div>",
  notices: () =>
    `<div style="margin-top:20px">` +
    NOTICES.map(
      ([t, b]) => `<article class="sess">
    <h3>${t}</h3><p class="soft">${b}</p></article>`,
    ).join("") +
    "</div>",
  judging: () =>
    `<p class="soft" style="margin-top:20px">Give each team a score from 0 to 10.</p>` +
    TEAMS.map(
      ([n]) => `<article class="sess">
    <h3>${n}</h3><label>Score<input type="number" min="0" max="10" data-score="${n}" value="${S.scores[n] ?? ""}">
    </label></article>`,
    ).join(""),
  admin: () => {
    const e = ev(),
      local = new Date(new Date(e.dueAt) - new Date(e.dueAt).getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16); // datetime-local wants local time
    return `<section class="panel narrow" style="margin-top:20px"><p class="soft">Changes apply to: <strong style="color:var(--text)">${esc(e.short)}</strong>
      </p>
    <label>Banner image URL<input id="imgUrl" placeholder="https://example.com/banner.jpg" value="${e.image.startsWith("data:") ? "" : esc(e.image)}">
      </label>
    <div><button class="btn primary" data-action="banner">Update banner</button></div>
    <label>Code freeze (date and time)<input type="datetime-local" data-change="due" value="${local}">
      </label>
    <label>Broadcast message (shown in the red bar)<input id="noteTxt" placeholder="Leave empty for the automatic countdown message" value="${esc(e.note || "")}">
      </label>
    <div><button class="btn primary" data-action="note">Update message</button></div>
    <label class="chk"><input type="checkbox" data-change="open"${e.open ? " checked" : ""}> Submissions are open</label>${S.notice ? `<p class="note" role="status">${S.notice}</p>` : ""}</section>${eventPanel()}`;
  },
  auth: () => {
    // Already signed in: show the account. The role cannot be changed here.
    if (S.loggedIn)
      return `<section class="panel narrow" style="margin-top:24px">
      <h3>You are signed in</h3><p class="soft">${esc(S.user.name)} (${ROLES[S.role]})<br>${esc(S.user.email)}</p>
      <p class="soft">Your menu only shows what your role can use. To use a different role, log out and sign in with a different account.</p>
      <div><button class="btn" data-action="auth-toggle">Log out</button></div></section>`;
    const reg = S.authMode === "register";
    return `<section class="panel narrow" style="margin-top:24px"><div class="tabs" style="margin:0">
      <button class="tab${reg ? "" : " on"}" data-action="mode" data-v="login">Log in</button>
      <button class="tab${reg ? " on" : ""}" data-action="mode" data-v="register">Register</button>
      </div>
    <form id="authForm" novalidate>${reg ? '<label>Your name<input name="name" autocomplete="name"></label>' : ""}<label>Email<input name="email" type="email" autocomplete="email">
      </label><label>Password<input name="password" type="password" autocomplete="${reg ? "new-password" : "current-password"}">
      </label>
    ${
      reg
        ? `<label>I am joining as<select name="role">${SIGNUP_ROLES.map((id) => `<option value="${id}">${ROLES[id]}</option>`).join("")}</select>
      </label><label id="codeBox" hidden>Super Admin access code<input name="code" autocomplete="off">
      </label><p class="soft">Your role is set when you register and cannot be changed later. Super Admin needs the organizer access code (demo code: ${ADMIN_CODE}).</p>`
        : ""
    }
    <p class="err" id="authErr" role="alert"></p><button class="btn primary" style="justify-content:center">${reg ? "Create account" : "Log in"}</button>
      </form>
    ${
      reg
        ? ""
        : `<div><p class="lbl soft">Demo accounts (password ${DEMO_PASS})</p>
      <div class="row">${DEMO.map((d) => `<button class="tab" type="button" data-action="demo" data-v="${d.email}">${ROLES[d.role]}</button>`).join("")}</div>
      </div>`
    }</section>`;
  },
};
function drawPage() {
  if (!can(S.role, S.page)) S.page = "live";
  sessSig = sessionsSig();
  $("banner").hidden = S.page === "auth";
  /* the login form comes first, with no big banner pushing it down */ $("page").innerHTML = PAGES[S.page]();
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
  $("qaFloat").innerHTML = `<button class="qa-open" id="qaOpen" data-action="qa-open" aria-label="Open Mini Q&amp;A" aria-expanded="false" aria-controls="qaBody">${svg("spark", 26)}</button>
    <section class="qa-body" id="qaBody" aria-label="Mini Q&amp;A"><div class="qa-h"><h2 class="sec" style="margin:0">${svg("spark", 20)}<span>Mini Q&amp;A</span></h2>
    <div class="row" style="flex-wrap:nowrap;gap:6px"><span class="mono" id="qCount">${S.questions.length} questions</span><button class="qa-x" data-action="qa-close" aria-label="Close Mini Q&amp;A">${svg("x", 18)}</button></div></div>
    <ul class="qa" id="qaList">${qaList()}</ul>
    <form id="qaForm" novalidate><div class="two"><input name="name" placeholder="Your name" aria-label="Your name">
    <input name="team" placeholder="Team name" aria-label="Team name"></div>
    <div class="send"><input name="text" placeholder="Ask the speaker a question..." aria-label="Your question">
    <button aria-label="Send question">${svg("send", 18)}</button></div><p class="err" id="qaErr" role="alert"></p></form></section>`;
}
function setQA(open) {
  S.qaOpen = open;
  $("qaFloat").classList.toggle("open", open);
  $("qaOpen").setAttribute("aria-expanded", open);
  if (open) requestAnimationFrame(() => document.querySelector(".qa-x").focus());
  else $("qaOpen").focus();
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
    err = $("evErr");
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
  S.events.push(e);
  save();
  S.evNote = `${short} is published for ${e.date}. It is now in the event switcher in the sidebar.`;
  drawAll();
}
function go(id) {
  S.page = id;
  S.notice = "";
  S.evNote = "";
  drawNav();
  drawTop();
  drawPage();
}
document.addEventListener("click", (x) => {
  const b = x.target.closest("[data-action]");
  if (!b) return;
  const a = b.dataset.action,
    v = b.dataset.v;
  if (a === "nav") go(v);
  else if (a === "rm-event") {
    S.events = S.events.filter((x) => !(x.id === v && x.custom));
    if (!S.events.some((x) => x.id === S.eventId)) S.eventId = S.events[0].id;
    save();
    drawAll();
  } else if (a === "qa-open") setQA(true);
  else if (a === "qa-close") setQA(false);
  else if (a === "pin") {
    S.pinned = !S.pinned;
    drawSidebar();
  } else if (a === "bcast-x") {
    S.bcastOff = true;
    $("bcast").hidden = true;
  } else if (a === "filter") {
    S.filter = v;
    drawPage();
  } else if (a === "reserve") {
    if (!S.loggedIn)
      S.notice = "Please log in or register first (use \u201CLog in & registration\u201D in the menu).";
    else {
      S.notice = "";
      S.reserved = S.reserved.includes(+v) ? S.reserved.filter((i) => i !== +v) : [...S.reserved, +v];
    }
    drawPage();
  } else if (a === "vote") {
    const q = S.questions.find((i) => i.id === +v);
    if (q && !S.voted.includes(q.id)) {
      q.votes++;
      S.voted.push(q.id);
      $("qaList").innerHTML = qaList();
    }
  } else if (a === "book") {
    S.booked = S.booked.includes(v) ? S.booked.filter((i) => i !== v) : [...S.booked, v];
    drawPage();
  } else if (a === "mode") {
    S.authMode = v;
    drawPage();
  } else if (a === "auth-toggle") {
    if (S.loggedIn) {
      signOut();
      drawAll();
    } else go("auth");
  } else if (a === "theme") {
    S.theme = S.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = S.theme;
  } else if (a === "note") {
    update({ note: $("noteTxt").value.trim() });
    S.bcastOff = false;
    S.notice = "Message updated.";
    drawBcast();
    tick();
    drawPage();
  } else if (a === "demo") {
    document.querySelector("#authForm [name=email]").value = v;
    document.querySelector("#authForm [name=password]").value = DEMO_PASS;
  } // fills the demo login
  else if (a === "banner") {
    const u = $("imgUrl").value.trim();
    if (u) {
      update({ image: u });
      S.notice = "Banner updated.";
      drawBanner();
      drawPage();
    }
  }
});
document.addEventListener("change", (x) => {
  const t = x.target,
    c = t.dataset.change;
  if (c === "event") {
    S.eventId = t.value;
    S.notice = "";
    S.evNote = "";
    drawAll();
  } else if (c === "due" && t.value) {
    update({ dueAt: new Date(t.value).toISOString() });
    drawTop();
  } else if (c === "open") {
    update({ open: t.checked });
    drawTop();
  } else if (t.name === "role" && t.form && t.form.id === "authForm")
    $("codeBox").hidden = t.value !== "superadmin"; // show the code box only for Super Admin
});
document.addEventListener("input", (x) => {
  const n = x.target.dataset.score;
  if (n) S.scores[n] = Math.min(10, Math.max(0, Number(x.target.value)));
}); // judge scores stay between 0 and 10
document.addEventListener("keydown", (x) => {
  if (x.key === "Escape" && S.qaOpen) return setQA(false);
  // keyboard shortcut: press 1, 2, 3... to open that menu item
  if (/INPUT|TEXTAREA|SELECT/.test(x.target.tagName) || x.ctrlKey || x.metaKey || x.altKey) return;
  const m = navItems()[Number(x.key) - 1];
  if (m) go(m.id);
});
document.addEventListener("submit", (x) => {
  x.preventDefault();
  const f = new FormData(x.target);
  if (x.target.id === "qaForm") {
    // all three boxes are needed
    const name = f.get("name").trim(),
      team = f.get("team").trim(),
      text = f.get("text").trim();
    if (!name || !team || !text) {
      $("qaErr").textContent = "Please fill in your name, your team and your question.";
      return;
    }
    S.questions.push({
      id: Date.now(),
      name,
      team,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      pinned: false,
      votes: 0,
    });
    $("qaList").innerHTML = qaList();
    $("qCount").textContent = S.questions.length + " questions";
    $("qaList").scrollTop = $("qaList").scrollHeight;
    x.target.reset();
    $("qaErr").textContent = "";
  } else if (x.target.id === "authForm") handleAuth(f);
  else if (x.target.id === "eventForm") handleEvent(f);
});
document.documentElement.dataset.theme = S.theme;
drawQA();
drawAll();
initAccounts().then(drawAll).catch(drawAll); // load accounts, restore a saved login, then redraw

