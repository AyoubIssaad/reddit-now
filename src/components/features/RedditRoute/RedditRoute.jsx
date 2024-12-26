import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import ThreadViewer from "@/components/features/ThreadViewer/ThreadViewer";
import SEO from "@/components/SEO";

const RedditRoute = () => {
  const { subreddit, id, title } = useParams();
  const navigate = useNavigate();
  const [threadInfo, setThreadInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const threadUrl = `https://reddit.com/r/${subreddit}/comments/${id}/${title || ""}`;
  const canonicalUrl = `https://reddit-now.com/r/${subreddit}/comments/${id}`;

  useEffect(() => {
    const fetchThreadInfo = async () => {
      if (!subreddit || !id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/comments/${id}/.json`,
          { headers: { Accept: "application/json" } },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "Thread not found. It might have been deleted or made private.",
            );
          }
          throw new Error("Failed to fetch thread information");
        }

        const [threadData] = await response.json();
        const thread = threadData?.data?.children?.[0]?.data;

        if (!thread) {
          throw new Error("Invalid thread data received");
        }

        if (thread.removed || thread.deleted) {
          throw new Error("This thread has been removed or deleted");
        }

        setThreadInfo({
          title: thread.title,
          subreddit: thread.subreddit,
          author: thread.author,
          description: thread.selftext
            ? `${thread.selftext.slice(0, 160)}...`
            : `Live discussion thread in r/${thread.subreddit}`,
          upvoteRatio: thread.upvote_ratio,
          score: thread.score,
          created: thread.created_utc,
          isNsfw: thread.over_18,
          isSpoiler: thread.spoiler,
          commentCount: thread.num_comments,
          permalink: thread.permalink,
          url: thread.url,
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching thread:", err);

        if (err.message.includes("not found")) {
          navigate("/404", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadInfo();
  }, [subreddit, id, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading thread information...</p>
      </div>
    );
  }

  if (error && !window.location.pathname.includes("/404")) {
    return (
      <div className="py-8">
        <SEO
          title="Error Loading Thread | Reddit-Now"
          description="There was an error loading this Reddit thread."
          robotsContent="noindex, follow"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <SEO
        title={
          threadInfo?.title
            ? `${threadInfo.title} | Reddit-Now`
            : "Loading Thread | Reddit-Now"
        }
        description={threadInfo?.description || "Loading Reddit thread..."}
        canonicalUrl={canonicalUrl}
        ogImage={threadInfo?.url}
        threadInfo={{
          ...threadInfo,
          fullUrl: threadUrl,
        }}
        robotsContent={threadInfo?.isNsfw ? "noindex, follow" : "index, follow"}
      />

      <ThreadViewer
        initialUrl={threadUrl}
        autoStart={true}
        key={window.location.pathname}
        threadInfo={threadInfo}
      />
    </div>
  );
};

export default RedditRoute;
