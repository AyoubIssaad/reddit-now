// src/components/features/ThreadViewer/Comment.jsx
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Image,
  Pin,
  Eye,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatTimeAgo } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

const MAX_DEPTH = 5;

// MediaRenderer component for handling images and GIFs
const MediaRenderer = ({ src, alt, comment }) => {
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

  return (
    <img
      src={src}
      alt={alt || "Image"}
      className="rounded-md max-w-full h-auto my-2"
      loading="lazy"
    />
  );
};

const Comment = ({
  comment,
  depth = 0,
  expandByDefault = false,
  isPinned,
  onPinComment,
  onUnpinComment,
  isWatched,
  onToggleWatch,
}) => {
  const [isExpanded, setIsExpanded] = useState(expandByDefault);
  const [isVisible, setIsVisible] = useState(!comment.isNew);
  const { author, content, score, created, replies, isNew, permalink, id } =
    comment;

  useEffect(() => {
    setIsExpanded(expandByDefault);
  }, [expandByDefault]);

  useEffect(() => {
    if (isNew) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handlePinClick = () => {
    if (isPinned) {
      onUnpinComment(id);
    } else {
      onPinComment(id);
    }
  };

  const hasReplies = replies?.length > 0;
  const showReplies = hasReplies && isExpanded && depth < MAX_DEPTH;
  const watchedStatus = isWatched?.(author);

  return (
    <div
      className={`relative ${depth > 0 ? "ml-6 mt-3" : "mt-4"}`}
      id={`comment-${id}`}
    >
      {depth > 0 && <div className="comment-thread-line -ml-3" />}

      <div
        className={cn(
          "rounded-xl p-4 hover:shadow-md relative border shadow-sm transition-all duration-400",
          isNew
            ? "bg-yellow-50 dark:bg-yellow-500/10"
            : "bg-white dark:bg-zinc-900",
          isPinned && "ring-1 ring-primary ring-opacity-50",
          watchedStatus && "ring-1 ring-primary/30",
        )}
        style={{
          transition: "opacity 400ms ease-out, transform 400ms ease-out",
          opacity: isVisible ? 1 : 0,
          transform: `translateX(${isVisible ? 0 : -20}px)`,
        }}
      >
        {/* Comment Header */}
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={`https://reddit.com/user/${author}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                {author}
              </a>
              {watchedStatus && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Watched
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{score === 1 ? "1 point" : `${score} points`}</span>
              <span>•</span>
              <span>{formatTimeAgo(created)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Watch Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleWatch?.(author)}
              className={cn(
                "h-8 w-8 transition-colors",
                watchedStatus
                  ? "text-primary hover:text-primary/80"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={watchedStatus ? `Unwatch ${author}` : `Watch ${author}`}
            >
              <Eye className={cn("h-4 w-4", watchedStatus && "fill-current")} />
            </Button>

            {/* Pin Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePinClick}
              className={cn(
                "h-8 w-8 transition-colors",
                isPinned
                  ? "text-primary hover:text-primary/80"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={isPinned ? "Unpin comment" : "Pin comment"}
            >
              <Pin className={cn("h-4 w-4", isPinned && "fill-current")} />
            </Button>

            {/* External Link */}
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
              isPinned={isPinned}
              onPinComment={onPinComment}
              onUnpinComment={onUnpinComment}
              isWatched={isWatched}
              onToggleWatch={onToggleWatch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
