# Encore Deployment Guide

This guide will help you deploy your Encore application to `join-encore.com`.

## Prerequisites

1. **Domain**: You have purchased `join-encore.com`
2. **GitHub Account**: For version control and deployment
3. **Vercel Account**: For frontend deployment (free tier available)
4. **Railway Account**: For backend deployment (free tier available)

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub.com
   - Create a new repository named `encore-app`
   - Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/encore-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend to Railway

1. **Sign up for Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Deploy Backend**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set the root directory to `backend`
   - Railway will automatically detect it's a Node.js app

3. **Configure Environment Variables**:
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these environment variables:
   ```
   JWT_SECRET=your_secure_jwt_secret_here
   PORT=3000
   NODE_ENV=production
   ```

4. **Get Backend URL**:
   - Railway will provide a URL like: `https://your-app-name.railway.app`
   - Note this URL for the next step

## Step 3: Deploy Frontend to Vercel

1. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Deploy Frontend**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite React app
   - Set the root directory to `/` (root of repository)
   - Click "Deploy"

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Click "Environment Variables"
   - Add these variables:
   ```
   VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
   VITE_USE_MOCK_DATA=false
   ```

## Step 4: Connect Your Domain

### Option A: Connect Domain to Vercel (Recommended)

1. **Add Domain to Vercel**:
   - In Vercel dashboard, go to your project
   - Click "Settings" → "Domains"
   - Add `join-encore.com`
   - Vercel will provide DNS records to configure

2. **Configure DNS**:
   - Go to your domain registrar (where you bought join-encore.com)
   - Find DNS settings
   - Add these records:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Option B: Connect Domain to Railway (Alternative)

If you prefer to serve everything from Railway:

1. **Add Domain to Railway**:
   - In Railway dashboard, go to your project
   - Click "Settings" → "Domains"
   - Add `join-encore.com`

2. **Configure DNS**:
   - Add the DNS records provided by Railway

## Step 5: Update API Configuration

Update your frontend to use the production backend URL:

1. **Create production environment file**:
   ```bash
   # Create .env.production in the root directory
   VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
   VITE_USE_MOCK_DATA=false
   ```

2. **Update API configuration** (if needed):
   - The `src/config/api.ts` file should automatically use the environment variables

## Step 6: Test Your Deployment

1. **Test Backend**:
   - Visit: `https://your-railway-backend-url.railway.app/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Test Frontend**:
   - Visit: `https://join-encore.com`
   - Should load your React application

3. **Test API Integration**:
   - Try logging in/registering
   - Test concert search functionality

## Step 7: SSL Certificate

Both Vercel and Railway automatically provide SSL certificates, so your site will be accessible via `https://join-encore.com`.

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure your backend CORS settings include your frontend domain
   - Update `backend/index.js` CORS configuration if needed

2. **Environment Variables Not Working**:
   - Double-check variable names in Vercel/Railway
   - Ensure variables start with `VITE_` for frontend

3. **Domain Not Loading**:
   - DNS changes can take up to 48 hours to propagate
   - Check DNS propagation using tools like whatsmydns.net

### Support:

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Domain Issues**: Contact your domain registrar

## Cost Estimation

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Railway**: Free tier includes $5 credit/month
- **Domain**: Annual cost from your registrar

## Next Steps

1. Set up monitoring and analytics
2. Configure CI/CD for automatic deployments
3. Set up database backups
4. Add error tracking (Sentry, etc.)

Your Encore application should now be live at `https://join-encore.com`! 🎉 