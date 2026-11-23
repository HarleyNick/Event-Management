/* ==========================================================================
   LOGIN / REGISTRATION PAGE LOGIC

   Contents
   1. Helpers
   2. Server calls (replace these with your real backend)
   3. State
   4. Validation rules
   5. Validation functions
   6. Switching between Sign in and Register
   7. Live validation and password toggle
   8. Switching between views (form, PIN, success)
   9. Form submit
   10. PIN boxes (typing, backspace, arrows, paste)
   11. PIN verification
   12. Buttons: Back and Sign out
   13. Profile builder (photo, skills, social links)
   14. Registration steps (3 parts)
   15. Theme switch (light / dark)
   16. Start
   ========================================================================== */


/* ==========================================================================
   1. HELPERS
   Short names for things we use all the time.
   ========================================================================== */

// $('#id')  -> finds ONE element
const $ = s => document.querySelector(s);

// $$('.class') -> finds ALL matching elements and returns a real array
const $$ = s => [...document.querySelectorAll(s)];

// wait(700) -> pauses for 700 ms (used to fake a slow server in the demo)
const wait = ms => new Promise(r => setTimeout(r, ms));


/* ==========================================================================
   2. SERVER CALLS
   These are DEMO versions that pretend to talk to a server.
   Replace each one with a real fetch() call to your backend.
   ========================================================================== */

// Create a new account. Should return { ok: true } on success.
// NOTE: data.photo is a File. To send it to a real server use FormData
// (formData.append('photo', data.photo)); JSON cannot carry a file.
async function apiRegister(data){
  await wait(700);
  const accountsKey = 'portal-accounts-v1';
  let accounts = [];
  try { accounts = JSON.parse(localStorage.getItem(accountsKey) || '[]'); } catch { accounts = []; }
  if (!Array.isArray(accounts)) accounts = [];
  const email = data.email.trim().toLowerCase();
  const duplicate = accounts.some(account => account.email && account.email.toLowerCase() === email);
  const demoEmails = ['attendee@demo.test', 'mentor@demo.test', 'team@demo.test', 'judge@demo.test', 'admin@demo.test'];
  if (duplicate || demoEmails.includes(email)) throw new Error('An account already exists for that email.');
  return { ok: true };
}

// Sign in. Should return { ok: true } if email and password are correct.
async function apiLogin(data){
  await wait(700);
  const email = data.email.trim().toLowerCase();
  const role = data.role.toLowerCase().replace(/\s+/g, '');
  const demos = {
    'attendee@demo.test': 'attendee',
    'mentor@demo.test': 'mentor',
    'team@demo.test': 'team',
    'judge@demo.test': 'judge',
    'admin@demo.test': 'superadmin'
  };
  if (demos[email]) {
    return { ok: demos[email] === role && data.password === 'demo1234' };
  }

  let accounts = [];
  try { accounts = JSON.parse(localStorage.getItem('portal-accounts-v1') || '[]'); } catch { accounts = []; }
  if (!Array.isArray(accounts)) return { ok: false };
  const account = accounts.find(item => item.email && item.email.toLowerCase() === email);
  if (!account) return { ok: false };
  if (account.role && account.role !== role) return { ok: false };
  if (!crypto || !crypto.subtle) return { ok: false };
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email + ':' + data.password));
  const key = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return { ok: account.key === key };
}

// Check the 6-digit authenticator code. Should return true or false.
// Demo: the only code that works is 123456.
async function apiVerifyPin(code){
  await wait(500);
  return code === '123456';
}


/* ==========================================================================
   3. STATE
   Values the page remembers while it is open.
   ========================================================================== */
let mode = 'login';   // 'login' or 'register' (which tab is active)
let user = null;      // details of the person who just submitted the form
let attempts = 0;     // how many wrong PIN codes have been entered
let skills = [];      // skills / tech stack tags chosen in the profile builder
let step = 1;         // which registration step is showing (1, 2 or 3)


/* ==========================================================================
   4. VALIDATION RULES
   One rule per field. Each rule receives the field's value and returns:
   - ''            if the value is fine
   - 'message...'  if there is a problem (this text is shown to the user)
   ========================================================================== */
// Builds a rule for an OPTIONAL social link.
// Empty is fine; otherwise it must be a real web address on the right site.
// hosts = allowed domains (e.g. ['linkedin.com']); null = any website.
const linkRule = (hosts, name) => v => {
  v = v.trim();
  if (!v) return '';
  try{
    const u = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v);
    const host = u.hostname.replace(/^www\./, '');
    if (!host.includes('.')) return 'Enter a valid link';
    if (hosts && !hosts.some(h => host === h || host.endsWith('.' + h))){
      return 'Enter a valid ' + name + ' link';
    }
    return '';
  }catch{
    return 'Enter a valid link';
  }
};

const rules = {
  fullname: v => v.trim() ? '' : 'Enter your full name',

  // Basic email shape: something@something.something
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    ? ''
    : 'Enter a valid email address, like name@company.com',

  job:   v => v.trim() ? '' : 'Enter your job title',
  org:   v => v.trim() ? '' : 'Enter your organisation',

  // Only asked when the role is Team (see needsTeam below)
  team:  v => v.trim() ? '' : 'Enter your team name',

  about: v => v.trim().length >= 10
    ? ''
    : 'Add a short description (at least 10 characters)',

  // Profile photo: required, must be an image under 2 MB
  photo: () => {
    const f = $('#photo').files[0];
    if (!f) return 'Add a profile photo';
    if (!f.type.startsWith('image/')) return 'Choose an image file (JPG, PNG or WebP)';
    if (f.size > 2 * 1024 * 1024) return 'Photo must be smaller than 2 MB';
    return '';
  },

  // Skills: uses the skills[] array (the hidden input is only a mirror of it)
  skills: () => skills.length ? '' : 'Add at least one skill or tool you use',

  // Social links: all optional
  linkedin: linkRule(['linkedin.com'], 'LinkedIn'),
  facebook: linkRule(['facebook.com', 'fb.com'], 'Facebook'),
  github:   linkRule(['github.com'], 'GitHub'),
  website:  linkRule(null, 'website'),

  // When signing in we only check it's filled in.
  // When registering we also require 8+ characters.
  pw: v => !v
    ? 'Enter your password'
    : (mode === 'register' && v.length < 8 ? 'Use at least 8 characters' : ''),

  // Must match the first password box
  pw2: v => v === $('#pw').value ? '' : "Passwords don't match",
  'admin-code': v => needsSuperAdminCode() && v.trim() !== 'LIMPOPO-ADMIN'
    ? 'Enter the correct Super Admin access code'
    : ''
};

// Roles that must also give a team name.
// These must match the value="..." of the role radio buttons in index.html.
// To ask another role for a team name, add it here, e.g. ['Team', 'Mentor'].
const TEAM_ROLES = ['Team'];

// The role currently selected, or '' if none
const selectedRole = () => {
  const r = $('input[name=role]:checked');
  return r ? r.value : '';
};

// True when the team name question must be asked:
// registering AND the role is one of TEAM_ROLES
const needsTeam = () => mode === 'register' && TEAM_ROLES.includes(selectedRole());
const needsSuperAdminCode = () => mode === 'register' && selectedRole() === 'Super Admin';

// Which fields must be checked in each mode
const fieldsFor = () => {
  if (mode === 'login') return ['email', 'pw'];

  // Same order as on the page, so focus goes to the first problem from the top
  const fields = ['photo', 'fullname', 'email', 'job', 'org', 'about', 'skills',
                  'linkedin', 'facebook', 'github', 'website', 'pw', 'pw2'];
  if (needsTeam()) fields.splice(fields.indexOf('email') + 1, 0, 'team');   // team name sits under email
  if (needsSuperAdminCode()) fields.splice(fields.indexOf('email') + 1, 0, 'admin-code');
  return fields;
};


/* ==========================================================================
   5. VALIDATION FUNCTIONS
   ========================================================================== */

// Checks one field, shows or clears its error message, returns true if valid.
function check(id){
  const el  = $('#' + id);
  const msg = rules[id](el.value);

  // Show the message in the <p id="e-..."> under the field
  $('#e-' + id).textContent = msg;

  // aria-invalid turns the border red (CSS) and tells screen readers
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');

  // Link the input to its error so screen readers read it out
  if (msg) el.setAttribute('aria-describedby', 'e-' + id);
  else     el.removeAttribute('aria-describedby');

  return !msg;
}

// Checks that one of the available roles is selected.
function checkRole(){
  const ok = !!$('input[name=role]:checked');
  $('#e-role').textContent = ok ? '' : 'Choose your role';
  return ok;
}


/* ==========================================================================
   6. SWITCHING BETWEEN SIGN IN AND REGISTER
   Changes tabs, headings, button text and which fields are visible.
   ========================================================================== */
function setMode(m){
  mode = m;
  const reg = m === 'register';

  // Slide the coloured panel (CSS reacts to data-mode) and swap its message
  $('#panel').dataset.mode = m;
  $('#ov-login').hidden    = reg;
  $('#ov-register').hidden = !reg;

  // Text that changes with the mode
  $('#or-text').textContent = reg ? 'or use your email for registration' : 'or use your account';
  $('#switch-q').textContent   = reg ? 'Already a member?' : 'New here?';
  $('#switch-btn').textContent = reg ? 'Sign in' : 'Create account';

  // Show registration-only fields (class "reg") only when registering
  $$('.reg').forEach(e => e.hidden = !reg);

  // Update the text
  $('#title').textContent    = reg ? 'Create account' : 'Sign in';
  $('#subtitle').textContent = reg
    ? 'Tell us who you are and set a password.'
    : 'Choose your role, then sign in.';
  $('#submit').textContent   = reg ? 'Create account' : 'Sign in';

  // Helps password managers: save a new password vs fill an existing one
  $('#pw').autocomplete = reg ? 'new-password' : 'current-password';

  // Clear every old error message and red border
  $$('.err').forEach(e => e.textContent = '');
  $$('[aria-invalid]').forEach(e => e.setAttribute('aria-invalid', 'false'));
  $('#form-err').textContent = '';

  // Show or hide the team name question for the current mode and role
  updateTeamField();

  // Start registration from step 1 again
  step = 1;
  updateSteps();
}

// Shows the "Team name" field only when needsTeam() is true
function updateTeamField(){
  const visible = needsTeam();
  $('#team-field').hidden = !visible;

  // When hidden, clear any leftover error so it doesn't reappear later
  if (!visible){
    $('#e-team').textContent = '';
    $('#team').setAttribute('aria-invalid', 'false');
  }

  const adminVisible = needsSuperAdminCode();
  $('#admin-code-field').hidden = !adminVisible;
  if (!adminVisible){
    $('#e-admin-code').textContent = '';
    $('#admin-code').setAttribute('aria-invalid', 'false');
  }
}

// Buttons on the coloured panel, and the link shown on small screens
$('#go-register').onclick = () => setMode('register');
$('#go-login').onclick    = () => setMode('login');
$('#switch-btn').onclick  = () => setMode(mode === 'login' ? 'register' : 'login');

// Social buttons: placeholder until you connect Facebook / Google / LinkedIn sign-in
$$('.soc').forEach(b => b.onclick = () => {
  $('#form-err').textContent = b.dataset.provider + " sign-in isn't connected yet. Please use your email for now.";
});


/* ==========================================================================
   7. LIVE VALIDATION AND PASSWORD TOGGLE
   ========================================================================== */
['team', 'fullname', 'email', 'job', 'org', 'about',
 'linkedin', 'facebook', 'github', 'website', 'pw', 'pw2'].forEach(id => {
  const el = $('#' + id);

  // When the user leaves a field, check it (skip fields hidden in this mode)
  el.addEventListener('blur', () => {
    if (!el.closest('[hidden]')) check(id);
  });

  // While typing, re-check only if the field already shows an error,
  // so the error disappears as soon as the problem is fixed
  el.addEventListener('input', () => {
    if (el.getAttribute('aria-invalid') === 'true') check(id);
  });
});

// When a role is picked: clear the "Choose your role" error,
// and show the Team name question if the role is in TEAM_ROLES
$$('input[name=role]').forEach(r => r.addEventListener('change', () => {
  checkRole();
  updateTeamField();
}));

// "Show password" checkbox: switches both password boxes between dots and text
$('#show').onchange = e => {
  $('#pw').type = $('#pw2').type = e.target.checked ? 'text' : 'password';
};


/* ==========================================================================
   8. SWITCHING BETWEEN VIEWS
   show('auth') = form, show('pin') = authenticator, show('done') = success.
   The tabs are only visible on the form view.
   ========================================================================== */
function show(view){
  ['auth', 'pin', 'done'].forEach(v => $('#view-' + v).hidden = v !== view);
  // Only the form view shows the sliding panel; PIN and success are a single card
  $('#panel').classList.toggle('solo', view !== 'auth');
}


/* ==========================================================================
   9. FORM SUBMIT
   Runs when the user clicks "Sign in" or "Create account".
   Steps: validate -> disable button -> call server -> show PIN screen.
   ========================================================================== */
$('#form').addEventListener('submit', async e => {
  e.preventDefault();               // stop the browser reloading the page

  // Registration steps 1 and 2: pressing Enter or the button means "Next"
  if (mode === 'register' && step < 3){ nextStep(); return; }
  $('#form-err').textContent = '';

  // If a skill was typed but "Add" wasn't pressed, add it now
  if (mode === 'register' && $('#skill-input').value.trim()) commitSkillInput();

  // --- Validate everything ---
  const roleOk  = checkRole();
  const results = fieldsFor().map(id => [id, check(id)]);
  const bad     = results.find(r => !r[1]);   // first invalid field, if any

  if (!roleOk || bad){
    // Registration: go back to the step that holds the problem
    if (mode === 'register') goToStep(roleOk ? STEP_OF[bad[0]] : 1);

    // Move focus to the first problem so the user can fix it
    // The skills field is a hidden input, so focus the visible skill text box instead
    (bad ? $(bad[0] === 'skills' ? '#skill-input' : '#' + bad[0]) : $('input[name=role]')).focus();
    return;
  }

  // --- Show a loading state on the button ---
  const btn   = $('#submit');
  const label = btn.textContent;
  btn.setAttribute('aria-busy', 'true');
  btn.textContent = 'Please wait…';
  btn.disabled = true;

  // --- Collect what the user entered ---
  user = {
    role:  $('input[name=role]:checked').value,
    team:  needsTeam() ? $('#team').value.trim() : '',   // '' when not a team role
    email: $('#email').value.trim(),
    name:  mode === 'register'
      ? $('#fullname').value.trim()
      : '',
    job:   mode === 'register' ? $('#job').value.trim() : '',   // professional title
    org:   mode === 'register' ? $('#org').value.trim() : '',   // organisation
    skills: mode === 'register' ? [...skills] : [],             // tech stack tags
    links:  mode === 'register' ? collectLinks() : {},          // social links
    photo:  mode === 'register' ? ($('#photo').files[0] || null) : null
  };
  // Temporary address of the chosen photo, used to show it on the success screen
  user.photoUrl = user.photo ? URL.createObjectURL(user.photo) : '';

  // --- Talk to the server ---
  try{
    const res = mode === 'register'
      ? await apiRegister({
          ...user,
          about: $('#about').value.trim(),
          password: $('#pw').value
        })
      : await apiLogin({ ...user, password: $('#pw').value });

    if (!res.ok) throw new Error();

    // Success: reset the PIN attempts and show the confirmation message
    attempts = 0;
    $('#pin-notice').textContent = mode === 'register'
      ? 'Account created. We sent a confirmation to ' + user.email + '.'
      : 'Signed in as ' + user.email + '. One more step to finish.';

    // Start with empty PIN boxes, then go to the PIN screen
    $$('#pin input').forEach(i => i.value = '');
    $('#e-pin').textContent = '';
    show('pin');
    $('#pin input').focus();

  }catch{
    // Failure: show a message at the top of the form
    $('#form-err').textContent = mode === 'login'
      ? 'Email or password is incorrect. Check them and try again.'
      : "We couldn't create your account. Try again in a moment.";

  }finally{
    // Always restore the button, whether it worked or not
    btn.removeAttribute('aria-busy');
    btn.textContent = label;
    btn.disabled = false;
  }
});


/* ==========================================================================
   10. PIN BOXES
   Six one-digit boxes that behave like a single code field.
   ========================================================================== */
const pins = $$('#pin input');

pins.forEach((inp, i) => {

  // Typing: keep one digit only, jump to the next box, auto-verify when full
  inp.addEventListener('input', () => {
    inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
    if (inp.value && i < 5) pins[i + 1].focus();
    if (pins.every(p => p.value)) verify();
  });

  // Keyboard: Backspace on an empty box goes back, arrows move left/right
  inp.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !inp.value && i > 0) pins[i - 1].focus();
    if (e.key === 'ArrowLeft'  && i > 0) pins[i - 1].focus();
    if (e.key === 'ArrowRight' && i < 5) pins[i + 1].focus();
  });

  // Paste: spread a copied code (e.g. "123456") across the boxes
  inp.addEventListener('paste', e => {
    const d = (e.clipboardData.getData('text') || '')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!d) return;

    e.preventDefault();
    [...d].forEach((c, k) => pins[k].value = c);
    pins[Math.min(d.length, 5)].focus();
    if (d.length === 6) verify();
  });
});


/* ==========================================================================
   11. PIN VERIFICATION
   Runs when all 6 digits are entered or "Verify code" is clicked.
   ========================================================================== */
let verifying = false;   // stops the check running twice at the same time

// Edited by NkosinathiM-ship: persist the selected role for the live-program app.
async function startLiveProgramSession(){
  const email = user.email.trim().toLowerCase();
  const role = user.role.toLowerCase().replace(/\s+/g, '');
  const accountsKey = 'portal-accounts-v1';
  const sessionKey = 'portal-session-v1';
  const accounts = JSON.parse(localStorage.getItem(accountsKey) || '[]');
  if (!Array.isArray(accounts)) throw new Error('Live program accounts must be a list.');

  const index = accounts.findIndex(account =>
    account && typeof account.email === 'string' && account.email.toLowerCase() === email
  );
  const existing = index >= 0 ? accounts[index] : {};
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(email + ':' + $('#pw').value)
  );
  const key = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  const account = {
    ...existing,
    email,
    name: user.name || existing.name || email.split('@')[0],
    role,
    key
  };

  if (index >= 0) accounts[index] = account;
  else accounts.push(account);
  localStorage.setItem(accountsKey, JSON.stringify(accounts));
  localStorage.setItem(sessionKey, email);
}

async function verify(){
  if (verifying) return;

  // Join the six boxes into one string, e.g. "123456"
  const code = pins.map(p => p.value).join('');
  if (code.length < 6){
    $('#e-pin').textContent = 'Enter all 6 digits';
    return;
  }

  // Disable the button while the server checks the code
  verifying = true;
  $('#verify').disabled = true;
  const ok = await apiVerifyPin(code);
  verifying = false;
  $('#verify').disabled = false;

  // --- Correct code: show the success screen ---
  if (ok){
    try{
      await startLiveProgramSession();
    }catch(error){
      console.error('Could not establish the live program session.', error);
      $('#e-pin').textContent = 'Could not start the live program. Please try again.';
      return;
    }

    $('#done-title').textContent = user.name
      ? 'Welcome, ' + user.name.split(' ')[0]   // first name only
      : "You're in";
    $('#done-sub').textContent  = user.email;

    // Profile card: name, professional title and organisation
    // (hidden when we have none of them, e.g. a plain sign in in the demo)
    $('#done-name').textContent = user.name;
    $('#done-job').textContent  = user.job;
    $('#done-org').textContent  = user.org;
    renderProfile();
    $('#done-role').textContent = user.role + (user.team ? ' · ' + user.team : '');
    show('done');
    // Edited by NkosinathiM-ship: send a verified login to the live program.
    window.location.assign('live-program.html');
    return;
  }

  // --- Wrong code ---
  attempts++;

  // After 3 wrong codes, send the user back to the sign-in form
  if (attempts >= 3){
    show('auth');
    setMode('login');
    $('#form-err').textContent = 'Too many wrong codes. Sign in again to get a fresh start.';
    return;
  }

  // Otherwise show how many attempts are left and clear the boxes
  const left = 3 - attempts;
  $('#e-pin').textContent = "That code isn't right. " + left +
    (left === 1 ? ' attempt' : ' attempts') + ' left.';
  pins.forEach(p => p.value = '');
  pins[0].focus();
}

$('#verify').onclick = verify;


/* ==========================================================================
   12. BUTTONS: BACK AND SIGN OUT
   ========================================================================== */

// "Back" on the PIN screen returns to the form
$('#back').onclick = () => {
  show('auth');
  $('#email').focus();
};

// "Sign out" on the success screen clears everything and returns to sign in
$('#signout').onclick = () => {
  $('#form').reset();
  user = null;
  setMode('login');
  show('auth');
};


/* ==========================================================================
   13. PROFILE BUILDER
   Photo upload, skills / tech stack tags and social links.
   (Only shown on the New member tab.)
   ========================================================================== */

/* ---- Profile photo ---- */

// Puts the photo preview back to the empty person icon
function clearPhotoPreview(){
  $('#avatar').style.backgroundImage = '';
  $('#avatar').classList.remove('has-img');
  $('#photo-remove').hidden = true;
  $('#photo-btn').textContent = 'Choose photo';
}

// When a file is chosen: validate it, then show a round preview
$('#photo').addEventListener('change', () => {
  if (check('photo')){
    $('#avatar').style.backgroundImage = 'url("' + URL.createObjectURL($('#photo').files[0]) + '")';
    $('#avatar').classList.add('has-img');
    $('#photo-remove').hidden = false;
    $('#photo-btn').textContent = 'Change photo';
  }else{
    clearPhotoPreview();
  }
});

$('#photo-remove').onclick = () => {
  $('#photo').value = '';
  clearPhotoPreview();
  $('#e-photo').textContent = '';
  $('#photo').setAttribute('aria-invalid', 'false');
  $('#photo-btn').focus();
};


/* ---- Skills / tech stack tags ---- */
const SUGGESTED_SKILLS = ['JavaScript', 'Python', 'HTML', 'CSS', 'Java', 'React',
                          'Node.js', 'TypeScript', 'SQL', 'PHP', 'C#', 'Git'];
const MAX_SKILLS = 15;

// Case-insensitive "already added?" check
const hasSkill = name => skills.some(k => k.toLowerCase() === name.toLowerCase());

// Redraws the chosen tags and greys out suggestions that are already added.
// Tags are built with textContent (never innerHTML) so typed text can't inject HTML.
function renderSkills(){
  const list = $('#skill-list');
  list.replaceChildren();
  skills.forEach(name => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = name + ' ×';
    chip.setAttribute('aria-label', 'Remove ' + name);
    chip.onclick = () => removeSkill(name);
    list.appendChild(chip);
  });

  $('#skills').value = skills.join(',');          // hidden mirror, used by the form
  $$('#skill-suggest .chip').forEach(b => b.disabled = hasSkill(b.dataset.name));
}

function addSkill(raw){
  const name = raw.trim().replace(/\s+/g, ' ').slice(0, 30);
  if (!name || hasSkill(name)) return;

  if (skills.length >= MAX_SKILLS){
    $('#e-skills').textContent = 'You can add up to ' + MAX_SKILLS + ' skills';
    return;
  }
  skills.push(name);
  renderSkills();
  check('skills');                                // clears the "add at least one" error
}

function removeSkill(name){
  skills = skills.filter(k => k !== name);
  renderSkills();
  $('#skill-input').focus();
}

// Adds whatever is typed in the skill box, then empties it
function commitSkillInput(){
  addSkill($('#skill-input').value);
  $('#skill-input').value = '';
}

$('#skill-add').onclick = () => { commitSkillInput(); $('#skill-input').focus(); };

// Enter or comma adds the skill (and must not submit the whole form)
$('#skill-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ','){
    e.preventDefault();
    commitSkillInput();
  }
});

// Build the suggestion buttons once
SUGGESTED_SKILLS.forEach(name => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip';
  b.dataset.name = name;
  b.textContent = '+ ' + name;
  b.onclick = () => { addSkill(name); $('#skill-input').focus(); };
  $('#skill-suggest').appendChild(b);
});
renderSkills();


/* ---- Social links ---- */
const LINK_LABELS = { linkedin: 'LinkedIn', facebook: 'Facebook', github: 'GitHub', website: 'Website' };

// Returns only the links that were filled in, each as a full https:// address
function collectLinks(){
  const out = {};
  Object.keys(LINK_LABELS).forEach(id => {
    const v = $('#' + id).value.trim();
    if (!v) return;
    out[id] = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v).href;
  });
  return out;
}


/* ---- Success screen: fill in the profile card ---- */
function renderProfile(){
  // Photo
  const av = $('#done-avatar');
  av.hidden = !user.photoUrl;
  av.style.backgroundImage = user.photoUrl ? 'url("' + user.photoUrl + '")' : '';

  // Social links (open in a new tab)
  const links = $('#done-links');
  links.replaceChildren();
  Object.entries(user.links).forEach(([id, href]) => {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = LINK_LABELS[id];
    const li = document.createElement('li');
    li.appendChild(a);
    links.appendChild(li);
  });

  // Skills
  const box = $('#done-skills');
  box.replaceChildren();
  user.skills.forEach(name => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = name;
    box.appendChild(chip);
  });

  // Hide the whole card if there is nothing to show
  $('#profile').hidden = !(user.name || user.job || user.org || user.photoUrl || user.skills.length);
}


/* ---- Clearing the profile builder when the form is reset (Sign out) ---- */
function resetProfile(){
  skills = [];
  renderSkills();
  $('#skill-input').value = '';
  clearPhotoPreview();
}
// setTimeout lets the browser finish resetting the fields first
$('#form').addEventListener('reset', () => setTimeout(resetProfile, 0));

/* ==========================================================================
   14. REGISTRATION STEPS (3 PARTS)
   Create account is split into three short steps so the form isn't one long
   scroll. Elements in index.html carry data-step="1|2|3"; CSS shows only the
   current step. Sign in ignores steps.
     Step 1  About you : role, photo, full name, email
     Step 2  Your work : team name (Team only), job title, organisation, bio, skills
     Step 3  Finish    : social links, password
   ========================================================================== */

// Fields to check on each step ("Next" only moves on when these are valid)
const STEP_FIELDS = {
  1: () => ['photo', 'fullname', 'email'].concat(needsSuperAdminCode() ? ['admin-code'] : []),
  2: () => (needsTeam() ? ['team'] : []).concat(['job', 'org', 'about', 'skills']),
  3: () => ['linkedin', 'facebook', 'github', 'website', 'pw', 'pw2']
};

// Which step each field lives on (used to jump back to a problem)
const STEP_OF = {
  photo: 1, fullname: 1, email: 1,
  team: 2, job: 2, org: 2, about: 2, skills: 2,
  linkedin: 3, facebook: 3, github: 3, website: 3, pw: 3, pw2: 3
};

const STEP_SUBTITLES = [
  'Tell us who you are.',
  'Tell us about your work.',
  'Add your links and set a password.'
];

// Updates everything that depends on the current step
function updateSteps(){
  const reg = mode === 'register';

  // CSS reads this attribute to show only the current step's fields
  $('#view-auth').dataset.current = step;

  // Buttons: Back (steps 2-3), Next (steps 1-2), Create account (step 3)
  $('#prev').hidden   = !(reg && step > 1);
  $('#next').hidden   = !(reg && step < 3);
  $('#submit').hidden = reg && step < 3;

  // Progress circles
  $$('#steps li').forEach(li => {
    const n = Number(li.dataset.n);
    li.classList.toggle('done', n < step);
    if (n === step) li.setAttribute('aria-current', 'step');
    else            li.removeAttribute('aria-current');
  });

  if (reg) $('#subtitle').textContent = STEP_SUBTITLES[step - 1];
}

function goToStep(n){
  step = n;
  updateSteps();
}

// Checks the given fields (and the role if asked).
// Returns true if all are fine; otherwise focuses the first problem and returns false.
function validateFields(ids, withRole){
  const roleOk = withRole ? checkRole() : true;
  const bad = ids.map(id => [id, check(id)]).find(r => !r[1]);
  if (roleOk && !bad) return true;

  (!roleOk
    ? $('input[name=role]')
    : $(bad[0] === 'skills' ? '#skill-input' : '#' + bad[0])
  ).focus();
  return false;
}

function nextStep(){
  // A skill typed but not yet added counts as added
  if (step === 2 && $('#skill-input').value.trim()) commitSkillInput();

  if (!validateFields(STEP_FIELDS[step](), step === 1)) return;

  goToStep(step + 1);
  window.scrollTo(0, 0);

  // Put the cursor in the first visible text box of the new step
  const first = $$('#form [data-step="' + step + '"] input.t, #form [data-step="' + step + '"] textarea')
    .find(el => el.offsetParent);
  if (first) first.focus();
}

$('#next').onclick = nextStep;
$('#prev').onclick = () => {
  goToStep(step - 1);
  window.scrollTo(0, 0);
};

/* ==========================================================================
   15. THEME SWITCH (LIGHT / DARK)
   The theme is stored on <html data-theme="light|dark"> and remembered in
   localStorage. A small script in <head> sets it before the page paints.
   ========================================================================== */
const themeBtn = $('#theme-toggle');

// Set the theme, update the switch for screen readers, and remember the choice
function applyTheme(theme){
  document.documentElement.dataset.theme = theme;
  themeBtn.setAttribute('aria-checked', theme === 'dark');
  $('#theme-text').textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
  try{ localStorage.setItem('theme', theme); }catch(e){}   // storage can be blocked
}

// On load, reflect whatever the <head> script chose
// (or fall back to the device setting if it did not run)
const startTheme = document.documentElement.dataset.theme ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = startTheme;
themeBtn.setAttribute('aria-checked', startTheme === 'dark');
$('#theme-text').textContent = startTheme === 'dark' ? 'Dark mode' : 'Light mode';

themeBtn.onclick = () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
};

/* ==========================================================================
   16. START
   Set the page to Sign in mode when it first loads.
   ========================================================================== */
setMode('login');