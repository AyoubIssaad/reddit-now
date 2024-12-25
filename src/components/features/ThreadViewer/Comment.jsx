import React, { useState, useEffect } from "react";
import { Card } from "../../ui/Card";
import { MessageSquare, ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Comment = ({ comment, depth = 0, expandByDefault = false }) => {
  const { author, content, score, created, replies, isNew } = comment;
  const [isExpanded, setIsExpanded] = useState(expandByDefault);

  // Update expansion state when the default setting changes
  useEffect(() => {
    setIsExpanded(expandByDefault);
  }, [expandByDefault]);

  const hasReplies = replies && replies.length > 0;
  const maxDepth = 5; // Maximum nesting level

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
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -ml-2" />
      )}

      <Card
        className={`p-4 transition-all duration-500 overflow-hidden ${
          isNew ? "animate-fade-in border-l-4 border-l-blue-500" : ""
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              u/{author}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatTimeAgo(created)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 shrink-0">
            {hasReplies && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{score}</span>
            </div>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </Card>

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
