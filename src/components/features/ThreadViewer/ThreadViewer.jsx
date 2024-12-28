// src/components/features/ThreadViewer/ThreadViewer.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import CommentList from "./CommentList";
import ThreadHeader from "./ThreadHeader";
import PinnedComments from "./PinnedComments";
import ScrollToTopButton from "./ScrollToTopButton";
import CommentStats from "./CommentStats";
import WatchedUsersBanner from "../WatchedUsers/WatchedUsersBanner";
import { useRedditThread } from "@/hooks/useRedditThread";
import { usePinnedComments } from "@/hooks/usePinnedComments";
import { useTitleNotifications } from "@/hooks/useTitleNotifications";
import { useWatchedUsers } from "@/hooks/useWatchedUsers";

const UPDATE_FREQUENCIES = [
  { value: 10000, label: "10s" },
  { value: 30000, label: "30s" },
  { value: 60000, label: "1m" },
  { value: 300000, label: "5m" },
];

function normalizeRedditUrl(url) {
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
}

const ThreadViewer = ({
  initialUrl = "",
  autoStart = false,
  hideIntro = false,
}) => {
  const [url, setUrl] = useState(normalizeRedditUrl(initialUrl));
  const [isWatching, setIsWatching] = useState(autoStart);
  const [updateFrequency, setUpdateFrequency] = useState(30000);
  const [expandReplies, setExpandReplies] = useState(
    localStorage.getItem("expand-replies") === "true",
  );

  const {
    comments,
    error,
    isLoading,
    lastFetch,
    fetchComments,
    threadData,
    commentStats,
  } = useRedditThread(url);

  // Initialize pinned comments functionality
  const threadId = threadData?.id;
  const { pinnedCommentIds, pinComment, unpinComment, clearPins, isPinned } =
    usePinnedComments(threadId);

  // Initialize watched users functionality
  const {
    watchedUsers,
    watchUser,
    unwatchUser,
    isWatched,
    processNewComments,
    newActivityByUser,
    clearActivity,
    clearAllActivity,
    notificationsEnabled,
    requestNotifications,
  } = useWatchedUsers();

  // Initialize title notifications
  const { incrementCount } = useTitleNotifications(
    threadData?.title
      ? `${threadData.title} | Reddit-Now`
      : "Reddit-Now - Watch Reddit Threads Live",
  );

  useEffect(() => {
    if (initialUrl) {
      setUrl(normalizeRedditUrl(initialUrl));
    }
  }, [initialUrl]);

  useEffect(() => {
    if (!isWatching || !url) return;

    const handleFetch = async () => {
      const result = await fetchComments();

      // If there are new comments
      if (result?.newCommentsCount > 0) {
        // Increment the title counter first
        incrementCount(result.newCommentsCount);

        // Then process watched users if needed
        if (result.comments) {
          processNewComments(result.comments);
        }
      }
    };

    // Initial fetch
    handleFetch();

    // Set up interval for subsequent fetches
    const intervalId = setInterval(handleFetch, updateFrequency);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, [isWatching, updateFrequency, url, fetchComments, incrementCount]);

  useEffect(() => {
    if (autoStart && url && !isWatching) {
      setIsWatching(true);
    }
  }, [autoStart, url]);

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

  const handleNavigateToComment = (commentId) => {
    const element = document.getElementById(`comment-${commentId}`);
    if (element) {
      // Get the header height
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      const controlsHeight =
        document.querySelector(".controls")?.offsetHeight || 0;

      // Calculate the position to scroll to
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition +
        window.pageYOffset -
        headerHeight -
        controlsHeight -
        20;

      // Smooth scroll to the element
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Add highlight effect
      element.classList.add("highlight-comment");
      setTimeout(() => element.classList.remove("highlight-comment"), 2000);
    }
  };

  const handleToggleWatchUser = useCallback(
    (username) => {
      if (isWatched(username)) {
        unwatchUser(username);
      } else {
        watchUser(username);
      }
    },
    [isWatched, unwatchUser, watchUser],
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Introduction Section */}
      {!isWatching && !hideIntro && (
        <div className="space-y-12 py-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="flex items-center gap-3 text-heading2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                Live Reddit Experience
              </h2>
              <p className="text-body-large text-muted-foreground max-w-2xl">
                Never miss a moment of the conversation! Follow discussions in
                real-time without refreshing.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  1
                </div>
                <div className="text-body text-muted-foreground">
                  Paste any Reddit thread URL in the box below
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  2
                </div>
                <div className="text-body text-muted-foreground">
                  Or simply replace{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                    reddit.com
                  </code>{" "}
                  with{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                    reddit-now.com
                  </code>{" "}
                  in any Reddit URL
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-2 pb-2 border-b z-20 controls">
        <div className="space-y-3">
          {/* URL and Controls Row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              type="text"
              placeholder="Paste Reddit thread URL"
              value={url}
              onChange={handleUrlChange}
              className="h-10 flex-grow"
            />
            <div className="flex items-center gap-2">
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
              <Button
                onClick={handleToggleWatch}
                variant={isWatching ? "destructive" : "default"}
                disabled={isLoading || !url}
                className="h-10 px-4 font-medium whitespace-nowrap"
              >
                {isWatching ? "Stop" : "Start"} Watching
              </Button>
            </div>
          </div>

          {/* Settings and Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
        </div>
      </div>

      {/* Thread Content */}
      <main className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {threadData && <ThreadHeader threadData={threadData} />}

        {/* Watched Users Banner */}
        {threadData && watchedUsers.length > 0 && (
          <WatchedUsersBanner
            watchedUsers={watchedUsers}
            comments={comments} // Add this prop
            newActivityByUser={newActivityByUser}
            onWatchUser={watchUser}
            onUnwatchUser={unwatchUser}
            onClearActivity={clearActivity}
            notificationsEnabled={notificationsEnabled}
            onRequestNotifications={requestNotifications}
            onNavigateToComment={handleNavigateToComment} // Add this prop
          />
        )}

        {/* Comment Stats */}
        {threadData &&
          commentStats.totalCount > commentStats.displayedCount && (
            <CommentStats
              displayedCount={commentStats.displayedCount}
              totalCount={commentStats.totalCount}
            />
          )}

        {/* Pinned Comments Section */}
        {threadData && (
          <PinnedComments
            threadId={threadId}
            comments={comments}
            pinnedCommentIds={pinnedCommentIds}
            onPinComment={pinComment}
            onUnpinComment={unpinComment}
            onClearPins={clearPins}
            onNavigateToComment={handleNavigateToComment}
          />
        )}

        <CommentList
          comments={comments}
          expandByDefault={expandReplies}
          isPinned={isPinned}
          onPinComment={pinComment}
          onUnpinComment={unpinComment}
          isWatched={isWatched}
          onToggleWatch={handleToggleWatchUser}
        />
      </main>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default ThreadViewer;
