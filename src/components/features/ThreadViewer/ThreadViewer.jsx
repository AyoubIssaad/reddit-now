import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import CommentList from "./CommentList";
import { useRedditThread } from "@/hooks/useRedditThread";

// Update frequencies in milliseconds
const UPDATE_FREQUENCIES = [
  { value: 10000, label: "10 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
];

function normalizeRedditUrl(url) {
  if (!url) return "";

  try {
    const urlObj = new URL(url);

    // Handle different URL formats
    if (urlObj.hostname === "reddit.com") {
      return url.replace("reddit.com", "www.reddit.com");
    }

    if (
      urlObj.hostname === "localhost" ||
      urlObj.hostname.includes("reddit-now.com")
    ) {
      return `https://www.reddit.com${urlObj.pathname}${urlObj.search}`;
    }

    return url;
  } catch {
    return url;
  }
}

const ThreadViewer = ({ initialUrl = "", autoStart = false }) => {
  const [url, setUrl] = useState(normalizeRedditUrl(initialUrl));
  const [isWatching, setIsWatching] = useState(autoStart);
  const [updateFrequency, setUpdateFrequency] = useState(30000);
  const [expandReplies, setExpandReplies] = useState(
    localStorage.getItem("expand-replies") === "true",
  );

  const { comments, error, isLoading, lastFetch, fetchComments } =
    useRedditThread(url);

  // Handle initialUrl changes
  useEffect(() => {
    if (initialUrl) {
      setUrl(normalizeRedditUrl(initialUrl));
    }
  }, [initialUrl]);

  // Setup polling
  useEffect(() => {
    if (!isWatching || !url) return;

    // Initial fetch
    fetchComments();

    // Set up interval
    const intervalId = setInterval(fetchComments, updateFrequency);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [isWatching, updateFrequency, url, fetchComments]); // fetchComments won't change now

  // Auto-start if configured
  useEffect(() => {
    if (autoStart && url && !isWatching) {
      setIsWatching(true);
    }
  }, [autoStart, url]);

  // Event handlers
  const handleUrlChange = (e) => setUrl(normalizeRedditUrl(e.target.value));

  const handleToggleWatch = () => {
    if (!isWatching) {
      fetchComments();
    }
    setIsWatching(!isWatching);
  };

  const handleExpandRepliesChange = (e) => {
    const newValue = e.target.checked;
    setExpandReplies(newValue);
    localStorage.setItem("expand-replies", newValue);
  };

  return (
    <div className="space-y-6">
      {/* URL Input and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          type="text"
          placeholder="Paste Reddit thread URL"
          value={url}
          onChange={handleUrlChange}
          className="h-11 flex-grow"
        />

        <div className="flex items-center gap-3">
          {/* Update Frequency Selector */}
          <div className="relative flex items-center">
            <select
              value={updateFrequency}
              onChange={(e) => setUpdateFrequency(Number(e.target.value))}
              disabled={isLoading}
              className="h-10 rounded-lg pl-9 pr-3 text-sm bg-background border border-input"
            >
              {UPDATE_FREQUENCIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  Update every {label}
                </option>
              ))}
            </select>
            <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Start/Stop Button */}
          <Button
            onClick={handleToggleWatch}
            variant={isWatching ? "destructive" : "default"}
            disabled={isLoading || !url}
            className="h-11 px-6 font-medium"
          >
            {isWatching ? "Stop" : "Start"} Watching
          </Button>
        </div>
      </div>

      {/* Settings and Status */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={expandReplies}
            onChange={handleExpandRepliesChange}
            className="rounded border-input h-4 w-4"
          />
          <span>Expand replies by default</span>
        </label>

        {lastFetch && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Last updated: {new Date(lastFetch).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Comments */}
      <div className="mt-8">
        <CommentList comments={comments} expandByDefault={expandReplies} />
      </div>
    </div>
  );
};

export default ThreadViewer;
