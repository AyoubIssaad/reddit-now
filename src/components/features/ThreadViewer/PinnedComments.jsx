import React, { useState } from "react";
import { Pin, X, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PinnedComments = ({
  threadId,
  comments = [],
  onNavigateToComment,
  pinnedCommentIds = [],
  onUnpinComment,
  onClearPins,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get pinned comments data from the full comments list
  const pinnedComments = comments.filter((comment) =>
    pinnedCommentIds.includes(comment.id),
  );

  // Function to count new replies for a comment
  const getNewRepliesCount = (comment) => {
    let count = 0;
    const countNewReplies = (replies) => {
      if (!replies) return;
      for (const reply of replies) {
        if (reply.isNew) count++;
        countNewReplies(reply.replies);
      }
    };
    countNewReplies(comment.replies);
    return count;
  };

  if (pinnedComments.length === 0) return null;

  return (
    <div className="mb-4">
      <Card className="border-primary/20">
        {/* Header */}
        <div className="p-3 border-b flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Pinned Comments ({pinnedComments.length})
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearPins}
              className="text-sm text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Pinned Comments List */}
        {isExpanded && (
          <div className="divide-y">
            {pinnedComments.map((comment) => {
              const newRepliesCount = getNewRepliesCount(comment);
              return (
                <div
                  key={comment.id}
                  className="p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Comment Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => onNavigateToComment(comment.id)}
                        >
                          View Comment
                        </Button>
                        {newRepliesCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {newRepliesCount} new{" "}
                            {newRepliesCount === 1 ? "reply" : "replies"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {comment.content}
                      </p>
                    </div>

                    {/* Unpin Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onUnpinComment(comment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PinnedComments;
