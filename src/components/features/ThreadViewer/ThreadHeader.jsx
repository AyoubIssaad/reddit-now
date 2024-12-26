import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ExternalLink, MessageSquare, ArrowUpFromLine } from "lucide-react";
import { formatTimeAgo } from "@/utils/formatters";

const ThreadHeader = ({ threadData }) => {
  if (!threadData) return null;

  const {
    title,
    subreddit,
    author,
    score,
    num_comments,
    created_utc,
    upvote_ratio,
    permalink,
    url,
  } = threadData;

  return (
    <Card className="mb-6">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold leading-tight">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {title}
              </a>
            </h1>
            <a
              href={`https://reddit.com${permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent shrink-0"
              title="View on Reddit"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <a
              href={`https://reddit.com/r/${subreddit}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              r/{subreddit}
            </a>
            <span>•</span>
            <a
              href={`https://reddit.com/user/${author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              u/{author}
            </a>
            <span>•</span>
            <span>{formatTimeAgo(created_utc)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <ArrowUpFromLine className="w-4 h-4" />
            <span>{score} points</span>
            <span className="text-muted-foreground">
              ({Math.round(upvote_ratio * 100)}% upvoted)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span>{num_comments} comments</span>
          </div>
        </div>
      </CardHeader>

      {threadData.selftext && (
        <CardContent className="prose prose-sm dark:prose-invert">
          <p>{threadData.selftext}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default ThreadHeader;
