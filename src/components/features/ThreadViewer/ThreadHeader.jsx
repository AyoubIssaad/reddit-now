import React, { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  ExternalLink,
  MessageSquare,
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatTimeAgo } from "@/utils/formatters";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/cn";

const ThreadHeader = ({ threadData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!threadData?.title) return null;

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
    selftext,
  } = threadData;

  const processContent = (rawContent) => {
    if (!rawContent) return "";
    if (rawContent.includes("&lt;")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawContent;
      return tempDiv.textContent;
    }
    return rawContent;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="p-4">
        <div className="space-y-2">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium leading-tight hover:underline line-clamp-1"
                >
                  {title}
                </a>
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

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
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
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ArrowUpFromLine className="w-4 h-4" />
              <span>{score} points</span>
              <span>({Math.round(upvote_ratio * 100)}% upvoted)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{num_comments} comments</span>
            </div>
          </div>

          {/* Collapsible Content */}
          {selftext && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-2"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {isExpanded ? "Hide post content" : "Show post content"}
              </button>

              {isExpanded && (
                <div className="mt-3 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: (props) => (
                        <img
                          {...props}
                          className="rounded-md max-w-full h-auto my-2"
                          loading="lazy"
                        />
                      ),
                      a: (props) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        />
                      ),
                    }}
                  >
                    {processContent(selftext)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default ThreadHeader;
