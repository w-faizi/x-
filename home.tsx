import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Download } from "@shared/schema";

// Platform detection patterns
const supportedPlatforms = {
  youtube: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
  twitter: /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/,
  instagram: /(?:instagram\.com\/(?:p|reel|stories)\/([A-Za-z0-9-_]+))/,
  tiktok: /(?:tiktok\.com\/@[\w.-]+\/video\/(\d+)|vm\.tiktok\.com\/([A-Za-z0-9]+))/,
  facebook: /(?:facebook\.com\/(?:[\w.-]+\/videos\/|watch\?v=)(\d+))/,
  terabox: /(?:terabox\.com\/s\/([A-Za-z0-9]+))/,
};

function validateUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function detectPlatform(url: string): string {
  for (const [platform, pattern] of Object.entries(supportedPlatforms)) {
    if (pattern.test(url)) {
      return platform;
    }
  }
  return "generic";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [currentDownloadId, setCurrentDownloadId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDownloadMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/download", { url });
      return response.json() as Promise<Download>;
    },
    onSuccess: (download) => {
      setCurrentDownloadId(download.id);
      toast({
        title: "Download started",
        description: `Processing ${download.platform} video...`,
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const { data: currentDownload, isLoading: isPolling } = useQuery<Download>({
    queryKey: ["/api/download", currentDownloadId],
    enabled: !!currentDownloadId,
    refetchInterval: (query) => {
      // Stop polling if download is completed or failed
      if (query.state.data?.status === "completed" || query.state.data?.status === "failed") {
        return false;
      }
      return 1000; // Poll every second
    },
  });

  useEffect(() => {
    if (currentDownload?.status === "completed" && currentDownload.downloadUrl) {
      toast({
        title: "Download completed!",
        description: "Your video is ready to download.",
      });
      
      // Trigger file download
      const link = document.createElement("a");
      link.href = currentDownload.downloadUrl;
      link.download = currentDownload.filename || "video";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset state
      setCurrentDownloadId(null);
      setUrl("");
    } else if (currentDownload?.status === "failed") {
      const errorMessage = (currentDownload.metadata as any)?.error || "There was an error processing your video.";
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      });
      setCurrentDownloadId(null);
    }
  }, [currentDownload, toast]);

  const handleDownload = async () => {
    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid video URL.",
        variant: "destructive",
      });
      return;
    }

    const platform = detectPlatform(url);
    console.log(`Detected platform: ${platform} for URL: ${url}`);

    createDownloadMutation.mutate(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDownload();
    }
  };

  const isProcessing = createDownloadMutation.isPending || currentDownload?.status === "processing" || currentDownload?.status === "pending";
  const showProgress = isProcessing || currentDownload?.status === "processing";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-white">
      {/* Logo Section */}
      <div className="mb-12">
        <h1 className="text-8xl md:text-9xl font-bold text-black tracking-wider">
          X
        </h1>
      </div>

      {/* Download Interface */}
      <div className="w-full max-w-md space-y-4">
        {/* URL Input Field */}
        <div className="relative">
          <Input
            type="url"
            placeholder="paste any link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 text-base text-gray-700 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            disabled={isProcessing}
          />
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isProcessing || !url.trim()}
          className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-900 active:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Download"}
        </Button>
      </div>

      {/* Progress Indicator */}
      {showProgress && (
        <div className="w-full max-w-md mt-6">
          <Progress value={currentDownload?.status === "processing" ? 50 : 25} className="h-2" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>
              {currentDownload?.status === "pending" && "Preparing download..."}
              {currentDownload?.status === "processing" && "Downloading video..."}
            </span>
            <span>
              {currentDownload?.status === "pending" && "25%"}
              {currentDownload?.status === "processing" && "50%"}
            </span>
          </div>
        </div>
      )}

      {/* Supported Platforms */}
      <div className="w-full max-w-md mt-8 text-center">
        <details className="text-sm text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700 transition-colors">
            Supported Platforms
          </summary>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex items-center justify-center space-x-2 flex-wrap">
              <span>Twitter/X</span>
              <span>•</span>
              <span>Reddit</span>
              <span>•</span>
              <span>Dailymotion</span>
              <span>•</span>
              <span>Streamable</span>
            </div>
            <div className="flex items-center justify-center space-x-2 flex-wrap">
              <span>Vimeo</span>
              <span>•</span>
              <span>Twitch Clips</span>
              <span>•</span>
              <span>Terabox</span>
              <span>•</span>
              <span>BitChute</span>
            </div>
            <div className="mt-2 text-gray-400">And many other video sites that allow downloads</div>
          </div>
        </details>
      </div>
    </div>
  );
}
