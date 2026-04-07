# Tree of Savior Mobile: Boss Tracker (sv.Giltine)

A real-time, responsive, and secure Web Application designed to track and share Boss respawn times across game channels and maps. Built from the ground up for minimal maintenance, the tracker automatically cleans up expired events and synchronizes data instantaneously across all connected players using Firebase.

## Features

- **Real-Time Data Sync:** Powered by Firebase Firestore, any updates made by a user (adding a map, updating a channel time) instantly reflect on all active clients without needing to refresh.
- **Automated Memory Management:** The application automatically performs "garbage collection" on its own. Boss channels that are past their expected time window by +2 hours are automatically deleted out of the database by active clients, ensuring no manual cleanup is ever required.
- **Role-Based Access Control (RBAC):** 
  - **Super Admins:** Hard-coded super administrators have permanent, un-revocable access.
  - **Default Users:** New users who authenticate via Google log in with safe default permissions (Create and Delete Channel).
  - **Custom Roles:** Admins can dynamically create arbitrary role groups in a built-in admin panel with distinct privileges (Admin Menu, Delete Map, Create).
- **Action Audit Logs:** Every critical action taken by a user is logged with a timestamp into an Admin dashboard, preventing griefing and allowing administrators to revoke permissions of misbehaving members.
- **Smart Formatting:** The UI intelligently recognizes game patterns (since respawns are under 6 hours) and auto-formats user inputs for quicker rapid-fire entry.
- **Glassmorphic UI Design:** A beautiful dark-theme layout utilizing ambient animated background blobs, frosted glass containers (`backdrop-filter`), and dynamic hover lighting logic to mimic high-end gaming aesthetic elements.

## Tech Stack

- **Frontend Core:** Vanilla HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend & Database:** Firebase Authentication (Google OAuth), Firebase Cloud Firestore (NoSQL)
- **Deployment:** GitHub Pages

## Complete Setup & Security Guide

If you are cloning or self-hosting this project, you need to configure Firebase appropriately to keep your data secure.

### 1. Firebase Initialization
Replace the `firebaseConfig` block inside `app.js` with your own project's Firebase details.

### 2. Firestore Database Security Rules
Because the raw Firebase API Key must be public in the frontend code, you must secure the database natively in the Firebase Console's "Rules" section for your Cloud Firestore deployment:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only logged in users can read and write documents
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. API Key Domain Restrictions
In the **Google Cloud Console** (under API & Services -> Credentials), find the Browser API key associated with your Firebase project. Ensure you add **Website Restrictions** (HTTP Referrers) so that the API key is only accepted when connections originate from your specific domain (e.g., `*mizstp.github.io/*`).

## Administrator Quick Start

1. To become a Super Admin initially, you must configure the `AdminEmails` array at the top of `app.js` with the email addresses of the owners.
2. Sign in to the deployed application with that Google Account.
3. You will see a golden "🛠️ Admin" button appear on the dashboard.
4. From there, you can define custom Roles, view the Activity Logs of all users, and assign roles to registered emails. 
