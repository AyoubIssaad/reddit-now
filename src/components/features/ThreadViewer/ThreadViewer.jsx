import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import CommentList from "./CommentList";
import { useRedditThread } from "@/hooks/useRedditThread";
import UpdateFrequencySelect from "./UpdateFrequencySelect";

const normalizeRedditUrl = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
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
};

const ThreadViewer = ({
  initialUrl = "",
  autoStart = false,
  hideHeader = false,
}) => {
  const [url, setUrl] = useState(normalizeRedditUrl(initialUrl));
  const [isWatching, setIsWatching] = useState(autoStart);
  const [updateFrequency, setUpdateFrequency] = useState(30000);
  const [expandRepliesByDefault, setExpandRepliesByDefault] = useState(
    localStorage.getItem("expand-replies") === "true",
  );

  useEffect(() => {
    if (initialUrl) {
      setUrl(normalizeRedditUrl(initialUrl));
    }
  }, [initialUrl]);

  const handleUrlChange = (e) => {
    const newUrl = normalizeRedditUrl(e.target.value);
    setUrl(newUrl);
  };

  const { comments, error, isLoading, lastFetch, fetchComments } =
    useRedditThread(url);

  useEffect(() => {
    let interval;
    if (isWatching && url) {
      fetchComments();
      interval = setInterval(fetchComments, updateFrequency);
    }
    return () => clearInterval(interval);
  }, [isWatching, updateFrequency, fetchComments, url]);

  useEffect(() => {
    if (autoStart && url && !isWatching) {
      setIsWatching(true);
    }
  }, [autoStart, url]);

  const handleToggleWatch = () => {
    if (!isWatching) {
      fetchComments(); // Fetch immediately when starting
    }
    setIsWatching(!isWatching);
  };

  const handleToggleExpand = (e) => {
    const newValue = e.target.checked;
    setExpandRepliesByDefault(newValue);
    localStorage.setItem("expand-replies", newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          type="text"
          placeholder="Paste Reddit thread URL"
          value={url}
          onChange={handleUrlChange}
          className="flex-grow bg-background"
        />
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <UpdateFrequencySelect
            value={updateFrequency}
            onChange={setUpdateFrequency}
            disabled={isLoading}
          />
          <Button
            onClick={handleToggleWatch}
            variant={isWatching ? "destructive" : "default"}
            disabled={isLoading || !url}
          >
            {isWatching ? "Stop" : "Start"} Watching
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={expandRepliesByDefault}
            onChange={handleToggleExpand}
            className="rounded border-gray-300 focus:ring-blue-500"
          />
          <span>Expand replies by default</span>
        </label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastFetch && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {new Date(lastFetch).toLocaleTimeString()}
        </div>
      )}

      <CommentList
        comments={comments}
        expandByDefault={expandRepliesByDefault}
      />
    </div>
  );
};

export default ThreadViewer;
