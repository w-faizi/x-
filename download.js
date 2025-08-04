// Vercel serverless function for video downloads
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const supportedPlatforms = {
  twitter: /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/,
  reddit: /(?:reddit\.com\/r\/[\w]+\/comments\/([A-Za-z0-9]+))/,
  dailymotion: /(?:dailymotion\.com\/video\/([A-Za-z0-9]+))/,
  vimeo: /(?:vimeo\.com\/(\d+))/,
  twitch: /(?:twitch\.tv\/videos\/(\d+)|clips\.twitch\.tv\/([A-Za-z0-9]+))/,
  streamable: /(?:streamable\.com\/([A-Za-z0-9]+))/,
};

function detectPlatform(url) {
  for (const [platform, pattern] of Object.entries(supportedPlatforms)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return "generic";
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const platform = detectPlatform(url);
    const downloadId = Date.now().toString();
    
    // For Vercel, we'll return metadata instead of actual file download
    // since serverless functions have execution time limits
    return res.status(200).json({
      id: downloadId,
      url,
      platform,
      status: 'pending',
      message: 'Download initiated. Note: Full download functionality requires a server environment with yt-dlp installed.'
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Failed to process download' });
  }
}