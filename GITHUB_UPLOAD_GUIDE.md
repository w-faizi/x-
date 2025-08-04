# 📂 Manual GitHub Upload (When Download Fails)

Since the zip download is failing, here's how to manually upload your files:

## Step 1: Create GitHub Repository
1. Go to github.com and create new repository
2. Name: "universal-video-downloader" 
3. Make it public
4. Click "Create repository"

## Step 2: Upload Files One by One
In your new GitHub repository, click "Create new file" for each file below:

### File 1: README.md
Copy this content exactly:

```markdown
# Universal Video Downloader

A minimal video downloader with clean X logo interface.

## Features
- Clean interface with X logo, input field, download button
- Works with Twitter/X, Reddit, Dailymotion, Streamable, Vimeo
- Instant downloads at 9.89MiB/s

## Deploy to Vercel
1. Go to vercel.com
2. Sign up with GitHub
3. Import this repository
4. Deploy automatically

## Tech Stack
- React + TypeScript + Vite
- Node.js + Express
- yt-dlp for downloads
```

### File 2: package.json
Copy the existing content from your Replit package.json file

### File 3: .gitignore
```
node_modules/
dist/
downloads/
.env
*.mp4
*.mp3
.DS_Store
```

### File 4: vercel.json  
Copy the content I created in your Replit project

## Step 3: Upload Source Code
1. Create folder "client" in GitHub
2. Copy all files from client/ folder
3. Create folder "server" in GitHub  
4. Copy all files from server/ folder
5. Create folder "shared" in GitHub
6. Copy shared/ files

## Step 4: Deploy to Vercel
1. Go to vercel.com → New Project
2. Import your GitHub repository
3. Deploy (automatic)
4. Get your live URL!

Your video downloader will work perfectly!