# CPSU San Carlos Campus: Digital ID Information Management System

Vue 3 + Vite front end. No router, no backend, no environment variables.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in /dist
```

Needs Node.js 20.19 or newer.

## Deploy on Vercel

`vercel.json` is already set up.

1. Push this folder to a GitHub repository.
2. In Vercel choose **Add New > Project**, import the repo, and click **Deploy**.

Or with the CLI: `npm i -g vercel` then `vercel --prod`.

## Demo account

| ID number | Password |
|-----------|----------|
| 2026-0001 | demo1234 |

## Flows (from the draw.io files)

**Registration**: input credentials -> ID number already exists, or password has special characters? -> "try again" returns to the inputs; otherwise the account is saved and you go to the login form.

**Login**: attempts check -> input credentials -> check credentials. Correct goes to the dashboard. Wrong goes back to the attempts check, and after 5 wrong attempts the form locks for 5 minutes, then you can input credentials again.

## Dashboard

- **Dashboard**: ID preview, ID status, validity, profile completeness, activity.
- **Student Information**: photo upload, personal, academic, contact and emergency details.
- **Digital ID**: front and back with a QR code. Download as PNG or print.
- **ID Requests**: replacement, renewal and correction requests, with cancel.
- **Settings**: change password.

The ID becomes **Active** once the photo, program, year level, birthdate, contact number, address and emergency contact are filled in.

## Notes

This is a front-end prototype. Accounts, photos, requests and login attempts are stored in the browser (localStorage), and passwords are SHA-256 hashed in the browser. Requests stay "Pending" because there is no ID office side. A real deployment needs a backend for authentication, records and request review. The code to replace is in `src/stores/auth.js`.

Navigation is plain Vue state: `src/App.vue` switches Login / Register / Dashboard, and `src/views/DashboardLayout.vue` switches the dashboard pages.
