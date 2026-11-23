# Event-Management

## Site flow

- `index.html` is the login and registration entry page.
- The logged-out Log in / Register control always opens `index.html`, including from guest access.
- Guests can continue without an account to view only Live program & keynotes; this does not replace or clear a saved login.
- New accounts are registered in the browser; sign-in uses those registered credentials.
- Successful login continues to `live-program.html`.
- Logging out from the live page clears its active session and returns to `index.html`.
- The live page shows menu entries according to the signed-in role. The Team Directory and Super Admin console are available to their permitted roles; Mentor 1-on-1 hub, Notice board, and Judging portal remain placeholders.
- Events and program sessions start empty. Super Admins can publish events, manage their settings, add keynotes, and remove events. Accounts and event data are stored in the current browser.
- Authentication and role checks are client-side only; production use requires server-side authentication and authorization.
- Shared page styles and scripts are in `css/` and `js/`; the Limpopo Dev Ecosystem logo is in `assets/`.