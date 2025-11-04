# Vercel Deployment Guide

## Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts:**
   - Link to existing project? No
   - Project name: realtime-tracker
   - Directory: ./
   - Override settings? No

## Important Notes

- **WebSocket Limitations**: Vercel has limited WebSocket support. For production, consider:
  - Railway (better WebSocket support)
  - Render
  - Heroku
  - DigitalOcean App Platform

- **Alternative for Vercel**: Use polling instead of WebSockets for basic functionality

## Quick Deploy Commands
```bash
# One-time setup
vercel login
vercel

# Future deployments
vercel --prod
```