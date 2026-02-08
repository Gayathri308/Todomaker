
# ✅ ZenTask Deployment Checklist

## Before You Start
- [ ] Code is working locally (frontend + backend)
- [ ] You have a GitHub account
- [ ] You have a Render account (sign up at render.com)
- [ ] You have your Supabase credentials ready

---

## Step 1: Push to GitHub (5 minutes)
```bash
cd C:\Users\Gaayu\OneDrive\Desktop\todomaker
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/zentask.git
git push -u origin main
```

---

## Step 2: Deploy Backend (10 minutes)

1. **Render Dashboard** → New + → Web Service
2. **Connect** your GitHub repo
3. **Configure:**
   - Name: `zentask-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables:**
   ```
   SUPABASE_URL=your_url_here
   SUPABASE_KEY=your_key_here
   PORT=5000
   ```
5. **Create Web Service** → Wait for deployment
6. **COPY BACKEND URL** (e.g., `https://zentask-backend.onrender.com`)

---

## Step 3: Deploy Frontend (10 minutes)

1. **Render Dashboard** → New + → Static Site
2. **Connect** same GitHub repo
3. **Configure:**
   - Name: `zentask-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. **Environment Variable:**
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api/tasks
   ```
5. **Create Static Site** → Wait for deployment

---

## Step 4: Test Your Live App ✨

- [ ] Visit your frontend URL
- [ ] Add a task
- [ ] Refresh page - task should still be there
- [ ] Complete a task - confetti should appear!

---

## 🎉 DONE!

Your app is live at:
- **Frontend:** `https://zentask-frontend.onrender.com`
- **Backend:** `https://zentask-backend.onrender.com`

---

## Quick Troubleshooting

**Can't add tasks?**
→ Check `VITE_API_URL` in frontend settings

**Backend not responding?**
→ Check Supabase credentials in backend settings

**Need to update?**
→ Just `git push` - Render auto-deploys!

---

**Total Time:** ~25 minutes
**Cost:** $0 (Free tier)
