import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Image, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTimeAgo } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const MAX_DEPTH = 5;

// Handle special content like images and GIFs
const MediaRenderer = ({ src, alt, comment }) => {
  // Handle GIFs
  if (src?.includes(".gif")) {
    return (
      <img
        src={src}
        alt={alt || "GIF"}
        className="rounded-md max-w-full h-auto my-2"
        loading="lazy"
      />
    );
  }

  // Handle Reddit preview images
  if (src?.includes("preview.redd.it")) {
    return (
      <a
        href={`https://www.reddit.com${comment.permalink}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Image className="h-4 w-4" />
        View image on Reddit
      </a>
    );
  }

  // Default image handling
  return (
    <img
      src={src}
      alt={alt || "Image"}
      className="rounded-md max-w-full h-auto my-2"
      loading="lazy"
    />
  );
};

const Comment = ({ comment, depth = 0, expandByDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandByDefault);
  const { author, content, score, created, replies, isNew, permalink } =
    comment;

  useEffect(() => {
    setIsExpanded(expandByDefault);
  }, [expandByDefault]);

  const processContent = (rawContent) => {
    if (!rawContent) return "";
    if (rawContent.includes("&lt;")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawContent;
      return tempDiv.textContent;
    }
    return rawContent;
  };

  const hasReplies = replies?.length > 0;
  const showReplies = hasReplies && isExpanded && depth < MAX_DEPTH;

  return (
    <div className={`relative ${depth > 0 ? "ml-6 mt-3" : "mt-4"}`}>
      {depth > 0 && <div className="comment-thread-line -ml-3" />}

      <div
        className={cn(
          "rounded-xl p-4 transition-all duration-300 hover:shadow-md relative border shadow-sm",
          isNew
            ? "animate-highlight bg-yellow-50 dark:bg-yellow-500/10"
            : "bg-white dark:bg-zinc-900",
        )}
      >
        <div className="flex flex-col">
          {/* Comment Header */}
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <a
                href={`https://reddit.com/user/${author}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                {author}
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{score === 1 ? "1 point" : `${score} points`}</span>
                <span>•</span>
                <span>{formatTimeAgo(created)}</span>
              </div>
            </div>
            <a
              href={`https://reddit.com${permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Reddit"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Comment Content */}
          <div className="mt-2 prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: (props) => <MediaRenderer {...props} comment={comment} />,
                a: ({ node, ...props }) => {
                  if (props.href?.includes("preview.redd.it")) {
                    return (
                      <MediaRenderer
                        src={props.href}
                        alt={props.title}
                        comment={comment}
                      />
                    );
                  }
                  return (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  );
                },
              }}
            >
              {processContent(content)}
            </ReactMarkdown>
          </div>

          {/* Replies Toggle */}
          {hasReplies && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {showReplies && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              expandByDefault={expandByDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
