# Zeyobron Backend

Node.js + Express backend for the Zeyobron video streaming platform.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### Environment Variables
Create `.env` file:
```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

## 📦 Deployment to Render

### Method 1: Using Blueprint (Recommended)
This repository includes `render.yaml` for automatic configuration.

1. Push code to GitHub
2. On Render, select **"New +"** → **"Blueprint"**
3. Connect repository
4. Add environment variables
5. Deploy!

### Method 2: Manual Web Service
1. Select **"New +"** → **"Web Service"**
2. **Root Directory**: Leave EMPTY
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add environment variables
6. Deploy!

## 🔗 Endpoints

### Health Check
```
GET /api/health
```
Returns server status

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Movies
```
GET  /api/movies
GET  /api/movies/:id
```

### Categories
```
GET  /api/categories
```

### Admin (Protected)
```
GET    /api/admin/users
PUT    /api/admin/user/:id/subscription
DELETE /api/admin/user/:id
POST   /api/admin/movie
PUT    /api/admin/movie/:id
DELETE /api/admin/movie/:id
POST   /api/admin/movies/bulk-csv
GET    /api/admin/movies/sample-csv
```

## 📝 Scripts

```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
npm run seed   # Seed database with sample data
```

## 🔧 Configuration Files

- `render.yaml` - Render deployment configuration
- `.env` - Environment variables (not committed)
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

## 📖 Documentation

- [Quick Fix Guide](../QUICK_FIX_RENDER.md) - Fix Render deployment errors
- [Troubleshooting](../RENDER_TROUBLESHOOTING.md) - Common issues
- [Full Deployment Guide](../DEPLOYMENT_GUIDE.md) - Complete instructions

## 🛠️ Built With

- Express.js - Web framework
- MongoDB + Mongoose - Database
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin requests

## 📄 License

MIT
