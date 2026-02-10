# 🚀 Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- PostgreSQL database (use Vercel Postgres or external service like Supabase/Neon)

## 📋 Step 1: Push to GitHub

### 1.1 Initialize Git (if not already done)
```bash
cd /Users/azizbek/Desktop/deals_app
git init
git add .
git commit -m "Initial commit: Flight deals app with Fly4free.pl design"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Name it: `flight-deals-app` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license
4. Click "Create repository"

### 1.3 Push to GitHub
Replace `YOUR_USERNAME` with your GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/flight-deals-app.git
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy Backend to Railway/Render

### Option A: Railway (Recommended for Go apps)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Click "Add variables" and add:
   ```
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_jwt_secret_here
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   PORT=8080
   ```
5. Set **Root Directory**: `backend`
6. Railway will auto-detect Go and deploy!

### Option B: Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Name**: `flight-deals-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `go build -o main .`
   - **Start Command**: `./main`
   - **Environment**: Add the same variables as above

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Connect Repository

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.2 Environment Variables

Add this variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### 3.3 Deploy

Click "Deploy" and wait for the build to complete!

## 🗄️ Step 4: Setup PostgreSQL Database

### Option A: Vercel Postgres (Easiest)

1. In Vercel dashboard, go to "Storage"
2. Create new Postgres database
3. Copy the connection string
4. Use it in your backend environment variables

### Option B: Supabase (Free tier available)

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the connection string and use it in backend

### Option C: Neon (Serverless Postgres)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Use it in backend environment variables

## 🔧 Step 5: Run Migrations

After deploying backend, run migrations:

### SSH into Railway/Render:
```bash
# Railway
railway run bash

# Render
# Use their shell feature in dashboard
```

Then run:
```bash
psql $DATABASE_URL -c "$(cat db/migrations/001_init.sql)"
```

## 👤 Step 6: Create Admin User

SSH into your backend and run:
```bash
go run cmd/seed/main.go your-email@example.com your-secure-password
```

Or manually via SQL:
```sql
INSERT INTO admins (email, password_hash, created_at)
VALUES (
  'admin@yourdomain.com',
  -- Use bcrypt to hash 'yourpassword'
  '$2a$10$...hashed_password_here...',
  NOW()
);
```

## ✅ Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the homepage - deals should load
3. Go to `/admin/login` and log in
4. Create a test deal
5. Verify it appears on the homepage

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Update CORS_ORIGIN to your production domain
- [ ] Don't commit .env files
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Vercel/Railway)

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify CORS_ORIGIN in backend matches frontend URL
- Check backend logs in Railway/Render

### Database connection fails
- Verify DATABASE_URL is correct
- Check if database allows external connections
- Verify SSL mode in connection string

### Images not loading
- Unsplash API might be rate-limited
- Add custom image URLs in admin panel
- Consider using a CDN for images

## 📝 Post-Deployment

1. **Custom Domain**: Add your domain in Vercel settings
2. **Analytics**: Add Vercel Analytics
3. **Monitoring**: Set up error tracking (Sentry)
4. **Backups**: Enable database backups
5. **CI/CD**: Automatic deployments on git push (already enabled)

## 🔄 Update Deployment

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy your frontend!
For backend, Railway/Render will also auto-deploy on push.
