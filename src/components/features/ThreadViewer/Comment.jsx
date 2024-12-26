// Comment.jsx
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Image, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTimeAgo } from "@/utils/formatters";
import { cn } from "@/utils/cn";

const MAX_DEPTH = 5;

const Comment = ({ comment, depth = 0, expandByDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandByDefault);
  const [isVisible, setIsVisible] = useState(!comment.isNew);
  const { author, content, score, created, replies, isNew, permalink } = comment;

  useEffect(() => {
    if (isNew) {
      // Start invisible
      setIsVisible(false);
      // Trigger animation after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const hasReplies = replies?.length > 0;
  const showReplies = hasReplies && isExpanded && depth < MAX_DEPTH;

  return (
    <div className={`relative ${depth > 0 ? "ml-6 mt-3" : "mt-4"}`}>
      {depth > 0 && <div className="comment-thread-line -ml-3" />}

      <div
        className={cn(
          "rounded-xl p-4 hover:shadow-md relative border shadow-sm transition-all duration-400",
          isNew ? "bg-yellow-50 dark:bg-yellow-500/10" : "bg-white dark:bg-zinc-900"
        )}
        style={{
          transition: "opacity 400ms ease-out, transform 400ms ease-out",
          opacity: isVisible ? 1 : 0,
          transform: `translateX(${isVisible ? 0 : -20}px)`
        }}
      >
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
              img: (props) => (
                <img {...props} className="rounded-md max-w-full h-auto my-2" loading="lazy" />
              ),
              a: (props) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {content}
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
