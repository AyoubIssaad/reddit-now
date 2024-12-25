import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import Container from "@/components/layout/Container";
import ThreadViewer from "@/components/features/ThreadViewer/ThreadViewer";
import SEO from "@/components/SEO";

const RedditRoute = () => {
  const { subreddit, id, title } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [threadInfo, setThreadInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalize Reddit URL for the thread viewer
  const redditUrl = `https://reddit.com/r/${subreddit}/comments/${id}/${title || ""}`;

  // Canonical URL for SEO
  const canonicalUrl = `https://reddit-now.com/r/${subreddit}/comments/${id}`;

  useEffect(() => {
    const fetchThreadInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/comments/${id}/.json`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "Thread not found. It might have been deleted or made private.",
            );
          }
          throw new Error("Failed to fetch thread information");
        }

        const data = await response.json();

        // Verify the response has the expected structure
        if (!data[0]?.data?.children?.[0]?.data) {
          throw new Error("Invalid thread data received");
        }

        const threadData = data[0].data.children[0].data;

        // Check if thread is removed or deleted
        if (threadData.removed || threadData.deleted) {
          throw new Error("This thread has been removed or deleted");
        }

        setThreadInfo({
          title: threadData.title,
          subreddit: threadData.subreddit,
          author: threadData.author,
          description: threadData.selftext
            ? `${threadData.selftext.slice(0, 160)}...`
            : `Live discussion thread in r/${threadData.subreddit}`,
          upvoteRatio: threadData.upvote_ratio,
          score: threadData.score,
          created: threadData.created_utc,
          isNsfw: threadData.over_18,
          isSpoiler: threadData.spoiler,
          commentCount: threadData.num_comments,
          permalink: threadData.permalink,
          url: threadData.url,
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching thread:", err);

        // If it's a 404, redirect to the 404 page
        if (err.message.includes("not found")) {
          navigate("/404", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (subreddit && id) {
      fetchThreadInfo();
    }
  }, [subreddit, id, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading thread information...</p>
        </div>
      </Container>
    );
  }

  // Error state that hasn't resulted in navigation
  if (error && location.pathname !== "/404") {
    return (
      <Container>
        <SEO
          title="Error Loading Thread | Reddit-Now"
          description="There was an error loading this Reddit thread."
          robotsContent="noindex, follow"
        />
        <div className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* SEO Component with thread info */}
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
          fullUrl: redditUrl,
        }}
        robotsContent={threadInfo?.isNsfw ? "noindex, follow" : "index, follow"}
      />

      {/* Thread Viewer */}
      <ThreadViewer
        initialUrl={redditUrl}
        autoStart={true}
        key={location.pathname}
        threadInfo={threadInfo}
      />
    </Container>
  );
};

export default RedditRoute;
