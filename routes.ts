import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDownloadSchema } from "@shared/schema";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// Create a simple validation schema for API requests
const downloadRequestSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

// Platform detection patterns - focused on working platforms
const supportedPlatforms = {
  twitter: /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/,
  reddit: /(?:reddit\.com\/r\/[\w]+\/comments\/([A-Za-z0-9]+))/,
  dailymotion: /(?:dailymotion\.com\/video\/([A-Za-z0-9]+))/,
  vimeo: /(?:vimeo\.com\/(\d+))/,
  twitch: /(?:twitch\.tv\/videos\/(\d+)|clips\.twitch\.tv\/([A-Za-z0-9]+))/,
  streamable: /(?:streamable\.com\/([A-Za-z0-9]+))/,
  terabox: /(?:terabox\.com\/s\/([A-Za-z0-9]+))/,
  bitchute: /(?:bitchute\.com\/video\/([A-Za-z0-9]+))/,
  archive: /(?:archive\.org\/details\/([A-Za-z0-9-_]+))/,
  bandcamp: /(?:[\w-]+\.bandcamp\.com\/track\/[\w-]+)/,
};

function detectPlatform(url: string): string {
  for (const [platform, pattern] of Object.entries(supportedPlatforms)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return "generic";
}

async function downloadVideo(downloadId: string, url: string, platform: string) {
  try {
    // Update status to processing
    await storage.updateDownload(downloadId, { status: "processing" });

    const outputDir = path.join(process.cwd(), "downloads");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputTemplate = path.join(outputDir, `${downloadId}_%(title)s.%(ext)s`);
    
    // Platform-specific configurations for working platforms
    const platformConfigs = {
      twitter: ["--format", "best"],
      reddit: ["--format", "best"],
      vimeo: ["--format", "best"],
      dailymotion: ["--format", "best"],
      twitch: ["--format", "best"],
      streamable: ["--format", "best"],
      terabox: ["--format", "best"],
      bitchute: ["--format", "best"],
      archive: ["--format", "best"],
      bandcamp: ["--format", "best"],
      generic: ["--format", "best"]
    };
    
    const formatArgs = platformConfigs[platform as keyof typeof platformConfigs] || platformConfigs.generic;

    // Use yt-dlp for downloading with enhanced configuration
    const baseArgs = [
      url,
      "-o", outputTemplate,
      "--no-playlist",
      ...formatArgs,
      "--merge-output-format", "mp4",
      "--no-warnings",
      "--no-check-certificate",
      "--ignore-errors",
      "--no-call-home",
      "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "--referer", "https://www.google.com/",
      "--extractor-retries", "3",
      "--fragment-retries", "3",
      "--retry-sleep", "1",
    ];

    // Use base arguments for all supported platforms
    const args = baseArgs;

    const ytdlp = spawn("yt-dlp", args);
    let filename = "";
    let filesize = 0;

    ytdlp.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`yt-dlp stdout: ${output}`);
      
      // Extract filename from output
      const filenameMatch = output.match(/\[download\] Destination: (.+)/);
      if (filenameMatch) {
        filename = path.basename(filenameMatch[1]);
      }
    });

    ytdlp.stderr.on("data", (data) => {
      const errorOutput = data.toString();
      console.error(`yt-dlp stderr: ${errorOutput}`);
      
      // Check for common errors and provide helpful metadata
      if (errorOutput.includes("rate-limit") || errorOutput.includes("login required")) {
        storage.updateDownload(downloadId, { 
          status: "failed",
          metadata: { error: "Platform requires authentication or has rate limits. Try again later." }
        });
      } else if (errorOutput.includes("not available")) {
        storage.updateDownload(downloadId, { 
          status: "failed",
          metadata: { error: "Content not available or removed." }
        });
      } else if (errorOutput.includes("Unsupported URL")) {
        storage.updateDownload(downloadId, { 
          status: "failed",
          metadata: { error: "URL format not supported." }
        });
      }
    });

    ytdlp.on("close", async (code) => {
      if (code === 0) {
        // Get file stats
        const files = fs.readdirSync(outputDir).filter(f => f.startsWith(downloadId));
        if (files.length > 0) {
          const filePath = path.join(outputDir, files[0]);
          const stats = fs.statSync(filePath);
          filesize = stats.size;
          filename = files[0];
          
          // Update download record
          await storage.updateDownload(downloadId, {
            status: "completed",
            filename,
            filesize,
            downloadUrl: `/api/download/${downloadId}/file`,
          });
        } else {
          await storage.updateDownload(downloadId, { status: "failed" });
        }
      } else {
        await storage.updateDownload(downloadId, { status: "failed" });
      }
    });

  } catch (error) {
    console.error("Download error:", error);
    await storage.updateDownload(downloadId, { status: "failed" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create download request
  app.post("/api/download", async (req, res) => {
    try {
      const { url } = downloadRequestSchema.parse(req.body);
      const platform = detectPlatform(url);
      
      const download = await storage.createDownload({ url, platform });
      
      // Start download process asynchronously
      downloadVideo(download.id, url, platform);
      
      res.json(download);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get download status
  app.get("/api/download/:id", async (req, res) => {
    try {
      const download = await storage.getDownload(req.params.id);
      if (!download) {
        return res.status(404).json({ message: "Download not found" });
      }
      res.json(download);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Download file
  app.get("/api/download/:id/file", async (req, res) => {
    try {
      const download = await storage.getDownload(req.params.id);
      if (!download || download.status !== "completed" || !download.filename) {
        return res.status(404).json({ message: "File not found" });
      }

      const filePath = path.join(process.cwd(), "downloads", download.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.download(filePath, download.filename);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
