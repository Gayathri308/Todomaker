# 🚀 ZenTask: Complete Deployment & Usage Guide

This guide covers everything from running the app locally on your machine to deploying it live on Render.

---

## 💻 Part 1: How to Run Locally (Terminal)

Since this is a full-stack app, you need to run **both** the backend (API) and the frontend (React UI) at the same time.

### Option A: Using Helper Scripts (Recommended)
You have a root `package.json` with shortcuts.

1.  **Open Terminal 1 (Backend):**
    ```powershell
    npm run dev-backend
    ```
    *Wait until you see:* `Server is running on port: 5000`

2.  **Open Terminal 2 (Frontend):**
    ```powershell
    npm run dev-frontend
    ```
    *Wait until you see:* `Local: http://localhost:5173/`

3.  **Open Browser:** Go to `http://localhost:5173`

### Option B: The Manual Way
If you prefer doing it manually:

1.  **Terminal 1 (Backend):**
    ```powershell
    cd backend
    npm install  # (Only if not installed yet)
    npm run dev
    ```

2.  **Terminal 2 (Frontend):**
    ```powershell
    cd frontend
    npm install  # (Only if not installed yet)
    npm run dev
    ```

---

## 📤 Part 2: Pushing to GitHub

Before deploying to Render, your code needs to be on GitHub.

1.  **Create a New Repository** on GitHub (e.g., named `zentask`).
2.  **Push your code** from your local terminal:

    ```powershell
    # 1. Initialize git (if you haven't already)
    git init

    # 2. Add all files
    git add .

    # 3. Commit changes
    git commit -m "Initial commit for deployment"

    # 4. Link to your GitHub repo (Replace URL with yours!)
    git remote add origin https://github.com/YOUR_USERNAME/zentask.git

    # 5. Push to main branch
    git push -u origin main
    ```

---

## ☁️ Part 3: Deploying to Render (Step-by-Step)

You will create **two services** on Render: one for the backend and one for the frontend.

### 🔌 Step 3.1: Deploy Backend (Web Service)

1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Select your repository (`zentask`).
4.  Fill in these details:

    | Field | Value |
    | :--- | :--- |
    | **Name** | `zentask-backend` (or similar) |
    | **Region** | Singapore (or closest to you) |
    | **Root Directory** | `backend` |
    | **Runtime** | `Node` |
    | **Build Command** | `npm install` |
    | **Start Command** | `node index.js` |
    | **Instance Type** | Free |

5.  **Environment Variables:**
    Scroll down to "Environment Variables" and add these keys from your local `.env`:
    *   `SUPABASE_URL`: (Paste your Supabase URL)
    *   `SUPABASE_KEY`: (Paste your Supabase Key)
    *   `PORT`: `5000`

6.  Click **Create Web Service**.
7.  **Wait** for the deployment to finish.
8.  **COPY THE URL** (e.g., `https://zentask-backend.onrender.com`). You need this for the frontend!

---

### � Step 3.2: Deploy Frontend (Static Site)

1.  Go back to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Static Site**.
3.  Select the **same repository** (`zentask`).
4.  Fill in these details:

    | Field | Value |
    | :--- | :--- |
    | **Name** | `zentask-frontend` (or similar) |
    | **Root Directory** | `frontend` |
    | **Build Command** | `npm run build` |
    | **Publish Directory** | `dist` |

5.  **Environment Variables:**
    *   `VITE_API_URL`: Paste your **Backend URL** from Step 3.1 (e.g., `https://zentask-backend.onrender.com/api/tasks`)
    *   *Note: Ensure you add `/api/tasks` at the end if your frontend expects it, otherwise just the base URL depending on your code logic.*
    *   *Correction based on your code:* Your `App.jsx` uses `VITE_API_URL` directly. So if your backend URL is `...onrender.com`, set this variable to `https://...onrender.com/api/tasks`.

6.  Click **Create Static Site**.
7.  **Wait** for deployment.
8.  **Click your new Frontend URL** to see your live app! 🎉

---

## 🆘 Troubleshooting

*   **"Application Error" on Frontend:** Check the console (F12). If you see CORS errors or 404s, double-check that your `VITE_API_URL` environment variable in Render is correct and includes `https://`.
*   **Backend stays "Deploying":** Check the "Logs" tab in Render. It usually means a crash or missing environment variable.
*   **Git Push Error:** If `git push` fails, try `git pull origin main --rebase` first if you created the repo with a README on GitHub.
