# Event-Management

## Site flow

- `index.html` is the login and registration entry page.
- Successful login and PIN verification continue to `live-program.html`.
- Logging out from the live page clears its active session and returns to `index.html`.
- The live page shows menu entries according to the signed-in role. Only Live program and keynotes and the authorized Super Admin console are active; Mentor 1-on-1 hub, Team directory, Notice board, and Judging portal remain disabled placeholders until their routes are ready.
- Shared page styles and scripts are in `css/` and `js/`; the Limpopo Dev Ecosystem logo is in `assets/`.