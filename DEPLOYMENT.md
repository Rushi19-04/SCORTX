# SCORTX Deployment Guide (Zero Cost)

This guide walks you through deploying the SCORTX application using free tier services.

## Prerequisites
-   GitHub Account
-   Render Account (for Backend)
-   Netlify Account (for Frontend)

---

## Part 1: Backend Deployment (Render)

1.  **Push Code to GitHub**: Ensure your project is pushed to a GitHub repository.
2.  **Create New Web Service** on [Render Dashboard](https://dashboard.render.com/).
3.  **Connect Repository**: Select your repo.
4.  **Configure Service**:
    -   **Name**: `scortx-backend`
    -   **Region**: Closest to you (e.g., Singapore/Ohio)
    -   **Branch**: `main`
    -   **Root Directory**: `app` (IMPORTANT: set this to `app` since your Dockerfile is inside the app folder)
    -   **Runtime**: `Docker`
    -   **Instance Type**: `Free`
5.  **Environment Variables**:
    -   Add `GEMINI_API_KEY`: Paste your Gemini API key.
    -   Add `FLASK_ENV`: `production`
6.  **Deploy**: Click "Create Web Service".
    -   *Note: First build will take a few minutes as it builds the Docker image with Slither/Mythril.*
7.  **Copy URL**: Once deployed, copy the service URL (e.g., `https://scortx-backend.onrender.com`).

---

## Part 2: Frontend Deployment (Netlify)

1.  **Create New Site** on [Netlify Dashboard](https://app.netlify.com/).
2.  **Import from Git**: Select your repo.
3.  **Configure Build**:
    -   **Base directory**: `frontend_bolt/project`
    -   **Build command**: `npm run build`
    -   **Publish directory**: `dist`
4.  **Environment Variables**:
    -   Click "Advanced" > "New Variable".
    -   Key: `VITE_API_URL`
    -   Value: `https://scortx-backend.onrender.com` (The URL from Part 1)
5.  **Deploy**: Click "Deploy Site".
    -   *Note: Netlify will build your frontend and serve it globally.*

---

## Part 3: Preventing Cold Starts (Crucial for Free Tier)

Render's free tier spins down after 15 minutes of inactivity. To keep it "warm" (active) 24/7 for zero cost:

1.  Sign up for a free generic uptime monitor (e.g., UptimeRobot, Cron-job.org).
2.  Create a standard HTTP Monitor.
3.  **URL**: `https://scortx-backend.onrender.com/health`
4.  **Interval**: Every 14 minutes.
5.  **Start Monitor**.

This will ping your backend periodically, tricking Render into thinking it's busy, so it never sleeps!

---
**Done!** Your SCORTX application is now live and completely free to run.
