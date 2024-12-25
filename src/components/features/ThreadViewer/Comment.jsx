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
    <div className={`relative ${depth > 0 ? "ml-4 mt-2" : "mt-3"}`}>
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400 dark:bg-gray-600 -ml-2" />
      )}

      <div
        className={`border bg-card text-card-foreground shadow rounded-r-xl rounded-l-none p-4 transition-all duration-500 overflow-hidden ${
          isNew
            ? "animate-fade-in border-l-4 border-l-gray-600 dark:border-l-gray-400"
            : ""
        }`}
      >
        <div className="flex flex-col">
          {/* Comment header */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100 hover:underline">
              {author}
            </span>
            <span>{score === 1 ? "1 point" : `${score} points`}</span>
            <span>{formatTimeAgo(created)}</span>
          </div>

          {/* Comment content */}
          <div className="mt-1 prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>

          {/* Replies section */}
          {hasReplies && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {hasReplies && isExpanded && depth < maxDepth && (
        <div className="space-y-2">
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
