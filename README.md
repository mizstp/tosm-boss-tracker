# TOSM Boss Respawn Tracker

A real-time web app for coordinating boss respawn timers across channels in Tree of Savior Mobile (sv.Giltine). Guild members share a live board — add a channel's respawn time, and everyone sees the countdown update instantly.

---

## Features

- **Real-time sync** — Firestore listeners push updates to all users instantly, no refresh needed
- **EP & Map navigation** — Browse all 13 Episodes and their maps via tab navigation
- **Countdown timers** — Enter a duration (e.g. `02:15` from now) or an exact 24-hour clock time (e.g. `14:30`)
- **Fire indicators** — EP and map tabs show a 🔥 icon when any channel is 5 minutes or less from spawning
- **Browser notifications** — Opt-in desktop alerts when a boss stage starts
- **Auto cleanup** — Channels that are 2+ hours past their spawn time are automatically deleted
- **Role-based access** — Admins control who can create/delete channels
- **Audit logs** — Every action is logged with the user's email and timestamp

---

## Tech Stack

| Layer | Technology |
|---|---|
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore (real-time listeners) |
| Frontend | Vanilla JS (ES Modules), no framework |
| Styling | CSS custom properties + Google Fonts (Inter) |
| Deployment | GitHub Pages |

---

## How It Works

```
EP Tabs (EP 1–13)
  └── Map Tabs (e.g. "Alemeth Forest")
        └── Channel Cards (e.g. "Ch.1 — spawns in 01:42:30")
```

1. Sign in with Google
2. Select an **Episode** tab (highest EP shown first)
3. Select a **Map** tab
4. View live channel countdowns — cards turn red/orange as spawn approaches
5. Click **Add Channel** to log a new respawn (requires Create permission)

---

## Roles & Permissions

| Permission | What it allows |
|---|---|
| `admin` | Access the Admin Control Panel |
| `create` | Add new channels (boss entries) |
| `delete_channel` | Delete individual channels |
| `delete_all` | Delete all channels on a map |

- Hardcoded admin accounts have all permissions automatically
- Admins can create custom roles and assign them to members via the Admin Panel
- New users are auto-assigned the default `Users` role on first login

---

## Admin Panel

Accessible via the **🛠️ Admin** button (admins only). Three tabs:

- **Action Logs** — Scrollable audit table: who did what and when; **Clear Logs** button permanently deletes all log entries from Firestore (with confirmation prompt)
- **Members** — List of all registered users and their current role
- **Roles** — Create roles with granular permission checkboxes; view/delete existing roles

---

## File Structure

```
index.html   — UI layout and modals
app.js       — All app logic (Firebase, auth, Firestore, UI rendering)
bdata.js     — Auxiliary data (e.g. QR data for donation modal)
style.css    — Styles and CSS variables
```
