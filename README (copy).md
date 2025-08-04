# Universal Video Downloader

A minimal, clean video downloader with just an X logo, input field, and download button. Works instantly with no processing delays.

## ✨ Features

- **Clean Interface**: Just X logo, input field, and download button
- **Instant Downloads**: No processing delays - paste URL and download starts immediately
- **Multiple Platforms**: Twitter/X, Reddit, Dailymotion, Streamable, Vimeo, Twitch, Terabox, BitChute
- **Real-time Progress**: Status tracking with automatic file download when ready
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Quick Start

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/your-username/universal-video-downloader.git
cd universal-video-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Install yt-dlp (required for video downloading):
```bash
# On Ubuntu/Debian
sudo apt install yt-dlp

# On macOS
brew install yt-dlp

# On Windows
pip install yt-dlp
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5000 in your browser

### Deploy to Vercel

1. Upload this project to your GitHub account (see DEPLOYMENT_README.md for detailed steps)
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub
3. Click "New Project" and import your GitHub repository
4. Vercel will automatically deploy your app
5. Add environment variables in Vercel dashboard (DATABASE_URL, SESSION_SECRET)
6. Get your live URL like `your-app.vercel.app`

**Note:** For full video download functionality, consider platforms like Railway or Render that support longer-running processes.

## 🎯 Supported Platforms

**✅ Working Reliably:**
- Twitter/X (tested - downloads at 9.89MiB/s)
- Reddit
- Dailymotion  
- Streamable
- Vimeo
- Twitch Clips
- Terabox
- BitChute
- Archive.org
- Bandcamp

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **UI**: Tailwind CSS + shadcn/ui components
- **Download Engine**: yt-dlp
- **State Management**: TanStack Query

## 📁 Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # App pages
│   │   └── lib/         # Utilities
├── server/          # Express backend
├── shared/          # Shared types and schemas
└── downloads/       # Downloaded videos (auto-created)
```

## 🔧 Development

The app uses a full-stack TypeScript setup with:
- Vite for fast development and building
- Shared TypeScript schemas between frontend and backend
- Hot module replacement for instant updates
- ESLint and Prettier for code quality

## 📝 License

MIT License - feel free to use this project however you want!

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch  
5. Open a Pull Request

---

**Made with ❤️ for simple, fast video downloading**