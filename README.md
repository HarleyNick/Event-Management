# Event-Management

## Site flow

- `index.html` is the login and registration entry page.
- The logged-out Log in / Register control always opens `index.html`, including from guest access.
- Guests can continue without an account to view only Live program & keynotes; this does not replace or clear a saved login.
- New accounts are registered in the browser; sign-in uses those registered credentials.
- Successful login continues to `live-program.html`.
- Logging out from the live page clears its active session and returns to `index.html`.
- The live page shows menu entries according to the signed-in role. The Public Notice Board is available to every account, including guests; the Team Directory and Super Admin console remain role-restricted. Mentor 1-on-1 hub and Judging portal are placeholders.
- Events and program sessions start empty. Super Admins can publish events, manage settings and keynotes, manage public and private notices, update the coder meal schedule, and manage event-specific Team Directory resources. Accounts and event data are stored in the current browser.
- Authentication and role checks are client-side only; production use requires server-side authentication and authorization.
- Shared page styles and scripts are in `css/` and `js/`; the Limpopo Dev Ecosystem logo is in `assets/`.
- `judging-portal.html` provides the dedicated Judge-only scoring workspace. Scores use `(eventId, teamId, judgeId)` composite keys in browser storage and only the logged-in judge's own submissions are shown.