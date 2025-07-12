# 🚀 Space Waste Mapper - Deployment Guide

This guide will help you deploy your Space Waste Mapper application to production.

## 📋 Prerequisites

- GitHub repository with your code
- GitHub account
- Email for signing up to deployment platforms

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up with your GitHub account
   - Click "New Project"

2. **Import your repository**
   - Select your `space-waste-mapper` repository
   - Vercel will auto-detect it's a React app

3. **Configure the project**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. **Environment Variables** (if needed)
   - Add `REACT_APP_API_URL` with your backend URL

5. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Step 2: Update API URL

After deploying the backend, update your frontend to use the production API:

```javascript
// In your frontend code, update API calls to use:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

---

## 🔧 Backend Deployment (Railway)

### Step 1: Set up Railway

1. **Go to [Railway.app](https://railway.app)**
   - Sign up with your GitHub account
   - Click "New Project"

2. **Deploy from GitHub**
   - Select your repository
   - Choose "Deploy from GitHub repo"

3. **Configure the project**
   - **Root Directory:** `space-waste-mapper/backend`
   - Railway will auto-detect Python requirements

### Step 2: Set up MongoDB Database

1. **Add MongoDB to Railway**
   - In your Railway project, click "New"
   - Select "Database" → "MongoDB"
   - Railway will provide a connection string

2. **Configure Environment Variables**
   - Go to your backend service settings
   - Add environment variable:
     - **Name:** `MONGODB_URI`
     - **Value:** Your Railway MongoDB connection string

### Step 3: Deploy

1. **Railway will automatically deploy** when you push to GitHub
2. **Get your API URL** from the Railway dashboard
3. **Update your frontend** with the new API URL

---

## 🔄 Alternative Deployment Options

### Frontend Alternatives

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=build
```

#### GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

### Backend Alternatives

#### Render
1. Go to [Render.com](https://render.com)
2. Connect your GitHub repo
3. Choose "Web Service"
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Heroku
```bash
# Install Heroku CLI
# Create Procfile (already done)
# Deploy
heroku create your-app-name
git push heroku main
```

---

## 🔗 Connecting Frontend and Backend

### Step 1: Update Frontend API Configuration

Create a `.env` file in your frontend directory:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### Step 2: Update CORS Settings

Your backend already has CORS configured to allow all origins (`"*"`), which is fine for development but you might want to restrict it in production:

```python
# In main.py, update CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 Testing Your Deployment

### Frontend Test
1. Visit your Vercel URL
2. Check if the map loads
3. Test satellite functionality

### Backend Test
1. Visit `https://your-backend-url.railway.app/`
2. Should see: `{"message": "Space Waste Mapper API is running!", "status": "connected"}`
3. Test API endpoints: `https://your-backend-url.railway.app/api/satellite/all`

---

## 🔧 Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Check CORS settings
   - Verify API URL in frontend
   - Check environment variables

2. **Backend deployment fails**
   - Check requirements.txt
   - Verify Python version in runtime.txt
   - Check Procfile syntax

3. **Database connection issues**
   - Verify MONGODB_URI environment variable
   - Check if MongoDB service is running (Railway)

### Debug Commands

```bash
# Check backend logs (Railway)
railway logs

# Check frontend build (Vercel)
# Check Vercel dashboard for build logs

# Test API locally
curl http://localhost:8000/
```

---

## 📊 Monitoring

### Vercel Analytics
- Built-in analytics for frontend
- Performance monitoring
- Error tracking

### Railway Monitoring
- Resource usage
- Logs
- Performance metrics

---

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:
- Push to `main` branch → automatic deployment
- Preview deployments for pull requests

---

## 🎉 Success!

Your Space Waste Mapper is now live! Share your URLs:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.railway.app`

Remember to update your README.md with the live URLs! 