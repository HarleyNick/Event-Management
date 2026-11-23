// Small front-end demo: additions are saved in this browser using localStorage.
// A production version should send these details to the shared project database.
const teamDialog = document.getElementById("team-dialog");
const memberDialog = document.getElementById("member-dialog");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

// ==========================================================
// LIGHT / DARK MODE
// index.html sets the first theme before the page paints (saved choice, else the device setting).
// This code runs the toggle button, saves the choice, and follows the device setting
// until the visitor has picked a theme themselves.
// ==========================================================
const themeToggle = document.getElementById("theme-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const systemLight = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const next = theme === "dark" ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${next} mode`);
  themeToggle.title = `Switch to ${next} mode`;
  if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#0d0e12" : "#f4f5f9");
}

function savedTheme() {
  try { return localStorage.getItem("geekulchaTheme"); } catch (error) { return null; }
}

applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  // Fade the colours briefly, unless the visitor prefers reduced motion.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("theme-anim");
    window.setTimeout(() => document.documentElement.classList.remove("theme-anim"), 300);
  }
  applyTheme(next);
  try { localStorage.setItem("geekulchaTheme", next); } catch (error) { /* storage blocked: the choice just won't be remembered */ }
});

// If the device switches between light and dark (e.g. at sunset) and no choice was saved, follow it.
systemLight.addEventListener("change", event => {
  if (!savedTheme()) applyTheme(event.matches ? "light" : "dark");
});

// Open the two short forms from their matching buttons.
document.getElementById("open-team-form").addEventListener("click", () => teamDialog.showModal());
document.getElementById("open-member-form").addEventListener("click", () => memberDialog.showModal());
document.querySelectorAll(".close-dialog").forEach(button => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

// Keep the broadcast pinned until the visitor chooses to dismiss it.
document.getElementById("dismiss-broadcast").addEventListener("click", () => {
  document.getElementById("broadcast-panel").classList.add("broadcast-hidden");
  showToast("Broadcast dismissed for this view.");
});

// Read existing additions so a page refresh does not immediately remove demo entries.
const savedTeams = JSON.parse(localStorage.getItem("geekulchaExtraTeams") || "[]");
const savedMembers = JSON.parse(localStorage.getItem("geekulchaExtraMembers") || "[]");

// Registering a team adds a clear row and updates the team count.
document.getElementById("team-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const team = {
    name: data.get("teamName").trim(),
    number: data.get("teamNumber").trim(),
    role: data.get("teamRole").trim()
  };
  if (!team.name || !team.number || !team.role) return;
  savedTeams.push(team);
  localStorage.setItem("geekulchaExtraTeams", JSON.stringify(savedTeams));
  renderExtras();
  event.currentTarget.reset();
  teamDialog.close();
  showToast("Team added to this browser's directory.");
});

// Adding a member records their name, team and role for this browser preview.
document.getElementById("member-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const member = {
    name: data.get("memberName").trim(),
    team: data.get("memberTeam"),
    role: data.get("memberRole").trim()
  };
  if (!member.name || !member.team || !member.role) return;
  savedMembers.push(member);
  localStorage.setItem("geekulchaExtraMembers", JSON.stringify(savedMembers));
  renderExtras();
  event.currentTarget.reset();
  memberDialog.close();
  showToast("Member added to this browser's directory.");
});

// Render only user-added entries; the four original teams remain the supplied baseline.
function renderExtras() {
  const teamCount = 4 + savedTeams.length;
  const memberCount = 7 + savedMembers.length;
  document.getElementById("team-total").textContent = teamCount;
  document.getElementById("member-total").textContent = memberCount;
  document.getElementById("all-member-label").textContent = `${memberCount} people · ${teamCount} teams`;

  const list = document.getElementById("other-teams");
  list.querySelectorAll(".added-team, .added-member").forEach(node => node.remove());

  savedTeams.forEach(team => {
    const row = document.createElement("article");
    row.className = "team-row added-team";
    const badge = document.createElement("span");
    badge.className = "team-badge badge-one";
    badge.textContent = String(team.number).padStart(2, "0");
    const details = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = team.name;
    const description = document.createElement("small");
    description.textContent = team.role;
    details.append(title, description);
    row.append(badge, details);
    list.append(row);
  });

  savedMembers.forEach(member => {
    const row = document.createElement("article");
    row.className = "team-row added-member";
    const badge = document.createElement("span");
    badge.className = "team-badge badge-three";
    badge.textContent = member.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    const details = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = member.name;
    const description = document.createElement("small");
    description.textContent = `${member.team} · ${member.role}`;
    details.append(title, description);
    row.append(badge, details);
    list.append(row);
  });
}

renderExtras();

// ==========================================================
// REQUEST HELP: pop-up 1 asks for the type of help, pop-up 2 shows the mentor.
// There is no server yet, so the "Email mentor" button opens the visitor's email app
// with the request already written. Replace the placeholder mentors and emails below.
// ==========================================================
const helpTypes = [
  { id: "tech",     label: "Technical / coding",   hint: "Bugs, HTML, CSS, JavaScript",     mentor: { name: "Technical mentor",     email: "mentor@example.com" } },
  { id: "reg",      label: "Registration & login", hint: "Sign-up, accounts, forms",        mentor: { name: "Registration mentor",  email: "mentor@example.com" } },
  { id: "live",     label: "Live programme",       hint: "Schedule, live event page",       mentor: { name: "Programme mentor",     email: "mentor@example.com" } },
  { id: "security", label: "Security & research",  hint: "Passwords, data, OWASP",          mentor: { name: "Security mentor",      email: "mentor@example.com" } },
  { id: "other",    label: "Something else",       hint: "Not sure where to start",         mentor: { name: "Directory coordinator", email: "mentor@example.com" } }
];

const helpDialog = document.getElementById("help-dialog");
const mentorDialog = document.getElementById("mentor-dialog");
const helpForm = document.getElementById("help-form");
const helpError = document.getElementById("help-error");

// Build the choice list from the data above.
document.getElementById("help-options").innerHTML = helpTypes.map(type =>
  `<label class="help-option"><input type="radio" name="kind" value="${type.id}"><span><b>${type.label}</b><small>${type.hint}</small></span></label>`
).join("");

// Every "Request help" button on the page opens pop-up 1.
document.querySelectorAll("[data-open-help]").forEach(button => {
  button.addEventListener("click", () => {
    helpForm.reset();
    helpError.textContent = "";
    helpDialog.showModal();
  });
});

// Clicking the dark area outside a help pop-up closes it.
[helpDialog, mentorDialog].forEach(dialog => {
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
});
helpForm.addEventListener("input", () => { helpError.textContent = ""; });

helpForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(helpForm);
  const who = (data.get("who") || "").trim();
  const kind = data.get("kind");
  const details = (data.get("details") || "").trim();
  if (!who || !kind) {
    helpError.textContent = "Please add your name and choose a type of help.";
    return;
  }

  const type = helpTypes.find(item => item.id === kind);
  const mentor = type.mentor;
  const initials = mentor.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();

  // textContent keeps anything the visitor typed from being treated as code.
  document.getElementById("mentor-avatar").textContent = initials;
  document.getElementById("mentor-name").textContent = mentor.name;
  document.getElementById("mentor-role").textContent = "Mentor · " + type.label;
  document.getElementById("mentor-summary").textContent =
    `${who}, you asked for help with: ${type.label}.` + (details ? ` "${details}"` : "");

  const body = `Hi ${mentor.name},\n\nI need help.\nName: ${who}\nType of help: ${type.label}\nDetails: ${details || "-"}\n\nThank you.`;
  document.getElementById("mentor-mail").href =
    `mailto:${mentor.email}?subject=${encodeURIComponent("Help request: " + type.label)}&body=${encodeURIComponent(body)}`;

  helpDialog.close();
  mentorDialog.showModal();
});
