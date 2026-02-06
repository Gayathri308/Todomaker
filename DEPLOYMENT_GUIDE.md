# 🚀 ZenTask Deployment Guide - Render

## 📋 Prerequisites
- [ ] GitHub account
- [ ] Render account (free tier works!)
- [ ] Your Supabase credentials ready (.env file)

---

## 🔧 PART 1: Push Code to GitHub

### 1. Initialize Git Repository (if not already done)
```bash
cd C:\Users\Gaayu\OneDrive\Desktop\todomaker
git init
git add .
git commit -m "Initial commit - ZenTask ready for deployment"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Name: `zentask` (or your preferred name)
3. Keep it **Public** or **Private** (both work with Render)
4. **DO NOT** initialize with README (you already have one)
5. Click "Create repository"

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/zentask.git
git branch -M main
git push -u origin main
```

---

## 🌐 PART 2: Deploy Backend to Render

### 1. Create Web Service
1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `zentask` repository

### 2. Configure Backend Service
Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `zentask-backend` (or any name) |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables from your `.env` file:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000
NODE_ENV=production
```

### 4. Deploy Backend
1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. **COPY YOUR BACKEND URL** (e.g., `https://zentask-backend.onrender.com`)
4. Test it by visiting: `https://your-backend-url.onrender.com/api/tasks`

---

## 🎨 PART 3: Deploy Frontend to Render

### 1. Create Static Site
1. Go back to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Select your `zentask` repository again

### 2. Configure Frontend Service
Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `zentask-frontend` (or any name) |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3. Add Environment Variable
Click **"Advanced"** → **"Add Environment Variable"**

**IMPORTANT:** Add your backend URL:

```
VITE_API_URL=https://your-backend-url.onrender.com/api/tasks
```

Replace `your-backend-url` with the actual URL from Step 2.4 above.

### 4. Deploy Frontend
1. Click **"Create Static Site"**
2. Wait 2-5 minutes for deployment
3. Your app will be live at: `https://zentask-frontend.onrender.com`

---

## ✅ PART 4: Verify Deployment

### Test Your Live App
1. Visit your frontend URL
2. Try adding a task
3. Check if it saves (should sync with Supabase)
4. Refresh the page - tasks should persist

### Common Issues & Fixes

#### ❌ Backend shows "Application failed to respond"
- **Fix**: Check if `PORT` environment variable is set to `5000`
- **Fix**: Verify Supabase credentials are correct

#### ❌ Frontend can't connect to backend
- **Fix**: Verify `VITE_API_URL` is set correctly with `/api/tasks` at the end
- **Fix**: Check backend is running (visit backend URL directly)

#### ❌ CORS errors
- Your backend already has CORS enabled (`app.use(cors())`), so this shouldn't happen
- If it does, update backend to: `app.use(cors({ origin: 'https://your-frontend-url.onrender.com' }))`

---

## 🎯 PART 5: Custom Domain (Optional)

### Add Custom Domain to Frontend
1. In Render Dashboard → Your Static Site
2. Go to **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Follow instructions to update DNS records

---

## 🔄 Future Updates

### To Deploy Changes:
```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

Render will **automatically redeploy** both frontend and backend! 🎉

---

## 📊 Free Tier Limits

**Render Free Tier:**
- ✅ 750 hours/month (enough for 1 service running 24/7)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ⚠️ Backend sleeps after 15 min of inactivity (first request takes ~30s to wake up)
- ⚠️ 100GB bandwidth/month

**Supabase Free Tier:**
- ✅ 500MB database
- ✅ 50,000 monthly active users
- ✅ 2GB file storage

---

## 🎉 You're Done!

Your ZenTask app is now live and accessible worldwide! 🌍

**Share your links:**
- Frontend: `https://zentask-frontend.onrender.com`
- Backend API: `https://zentask-backend.onrender.com/api/tasks`

---

## 📞 Need Help?

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → "Logs" tab
2. Verify environment variables are set correctly
3. Test backend API directly using browser or Postman
4. Check browser console for frontend errors (F12)

---

Created with ❤️ for ZenTask Deployment
