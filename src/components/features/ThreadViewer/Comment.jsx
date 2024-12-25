import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Comment = ({ comment, depth = 0, expandByDefault = false }) => {
  const { author, content, score, created, replies, isNew } = comment;
  const [isExpanded, setIsExpanded] = useState(expandByDefault);

  useEffect(() => {
    setIsExpanded(expandByDefault);
  }, [expandByDefault]);

  const hasReplies = replies && replies.length > 0;
  const maxDepth = 5;

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor(
      (new Date() - new Date(timestamp * 1000)) / 1000,
    );
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    return "just now";
  };

  return (
    <div className={`relative ${depth > 0 ? "ml-6 mt-3" : "mt-4"}`}>
      {depth > 0 && <div className="comment-thread-line -ml-3" />}

      <div
        className={`comment-card ${
          isNew ? "animate-fade-in border-l-4 border-l-primary" : ""
        }`}
      >
        <div className="flex flex-col">
          {/* Comment header */}
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

          {/* Comment content */}
          <div className="mt-2 prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>

          {/* Replies section */}
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

      {hasReplies && isExpanded && depth < maxDepth && (
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
