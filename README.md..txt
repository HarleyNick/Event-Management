GEEKULCHA DIRECTORY HUB
=======================

CONTENTS
--------
index.html   Directory page and all visible sections.
styles.css   Layout, colours, cards, forms and responsive styling.
app.js       Register-team, add-member and request-help interactions.
README.txt   This guide.

WHAT IS INCLUDED
----------------
- Team 4 is the featured team: Sinethemba Malinga and Ethan Carelse.
- All four teams and their supplied members/roles are listed.
- Workspace overview: 4 teams and 7 current members.
- Notice board with the supplied 08:00–09:30 hacker registration and swag
  badge pickup slot, kickoff breakfast & espresso fuel bar, and sponsor power
  lunch. Times not supplied are marked "Time TBC" rather than guessed.
- Pinned broadcast stays visible until the visitor dismisses it.
- Beginner-friendly links to MDN, W3Schools, OWASP, GitHub and VS Code docs.
- Register a team and Add a member forms.
- Request help: a button in the top bar and in the "Need a hand?" box opens a
  pop-up where the contestant gives their name and picks the type of help
  (technical, registration, live programme, security, other). A second pop-up
  then shows the matched mentor with an "Email mentor" button that opens the
  visitor's email app with the request already written.
- Black and red theme (black panels, red accent, Archivo / Inter / JetBrains Mono).
- Responsive layout for desktop, tablet and mobile.
- Code comments explaining important page sections and JavaScript behaviour.

HOW TO OPEN
-----------
1. Extract geekulcha_directory_hub.zip.
2. Open the folder in VS Code or PyCharm.
3. Open index.html in Chrome, Edge or Firefox.
4. Keep index.html, styles.css and app.js together in the same folder.

FUNCTIONALITY NOTE
------------------
The add-team and add-member forms work as a front-end demonstration and save
entries in localStorage in the current browser. They do not submit to a shared
database, so other users/devices will not see those additions yet. A production
version needs a back-end API, database, access control and validation.

The broadcast dismiss button hides the pinned broadcast for the current page
view. It is not a real-time broadcast service yet.

NOTICE BOARD NOTE
-----------------
Only the 08:00–09:30 registration time was supplied. Kickoff breakfast and
sponsor power lunch are shown with "Time TBC" until the organiser confirms
their exact times. Update the schedule directly in index.html.

REQUEST HELP NOTE
-----------------
There is no server yet, so nothing is sent automatically. The "Email mentor"
button opens the visitor's email app and the visitor sends the message.
The mentor names and emails are placeholders: edit the helpTypes list near the
bottom of app.js (name and email for each type of help).

THEME NOTE
----------
All colours are variables at the top of styles.css (--bg, --panel, --red ...).
Change --red to restyle every red element at once.

LIGHT AND DARK MODE
-------------------
- The sun/moon button in the top bar switches between light and dark mode.
- First visit: the page follows the visitor's device setting. Once they press
  the button, their choice is saved in this browser (localStorage) and used from then on.
- Dark values live in :root and light values in :root[data-theme="light"] at the
  top of styles.css. To tweak a theme, change the variables in that block.
  Never hard-code colours elsewhere; use the variables so both themes stay in sync.
- The small script in the <head> of index.html applies the theme before the page
  paints (no flash). The toggle logic is at the top of app.js.
