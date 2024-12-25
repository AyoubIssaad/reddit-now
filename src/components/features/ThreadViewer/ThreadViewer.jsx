import React, { useState, useEffect } from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/Alert";
import CommentList from "./CommentList";
import { useRedditThread } from "../../../hooks/useRedditThread";
import UpdateFrequencySelect from "./UpdateFrequencySelect";

const ThreadViewer = ({ initialUrl = "", autoStart = false }) => {
  const [url, setUrl] = useState(initialUrl);
  const [isWatching, setIsWatching] = useState(autoStart);
  const [updateFrequency, setUpdateFrequency] = useState(30000); // Default to 30 seconds
  const [expandRepliesByDefault, setExpandRepliesByDefault] = useState(
    localStorage.getItem("expand-replies") === "true",
  );

  // Update URL when initialUrl prop changes
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const { comments, error, isLoading, lastFetch, fetchComments } =
    useRedditThread(url);

  // Set up polling when watching is enabled
  useEffect(() => {
    let interval;
    if (isWatching && url) {
      fetchComments();
      interval = setInterval(fetchComments, updateFrequency);
    }
    return () => clearInterval(interval);
  }, [isWatching, updateFrequency, fetchComments, url]);

  // Start watching automatically if autoStart is true
  useEffect(() => {
    if (autoStart && url && !isWatching) {
      setIsWatching(true);
    }
  }, [autoStart, url]);

  const handleToggleWatch = () => {
    setIsWatching(!isWatching);
  };

  const handleToggleExpand = (e) => {
    const newValue = e.target.checked;
    setExpandRepliesByDefault(newValue);
    localStorage.setItem("expand-replies", newValue);
  };

  return (
    <div className="space-y-4 py-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Thread Viewer</h2>
        <p className="text-sm text-muted-foreground">
          Paste a Reddit thread URL to start watching the comments in real-time
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          type="text"
          placeholder="Paste Reddit thread URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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
