import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Image } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTimeAgo } from "@/utils/formatters";

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
  const { author, content, score, created, replies, isNew } = comment;

  useEffect(() => {
    setIsExpanded(expandByDefault);
  }, [expandByDefault]);

  // Process HTML entities in comment content
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
      {/* Thread line for nested comments */}
      {depth > 0 && <div className="comment-thread-line -ml-3" />}

      <div
        className={`comment-card ${isNew ? "animate-fade-in border-l-4 border-l-primary" : ""}`}
      >
        {/* Comment Header */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-foreground hover:underline">
              {author}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{score === 1 ? "1 point" : `${score} points`}</span>
              <span>•</span>
              <span>{formatTimeAgo(created)}</span>
            </div>
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
